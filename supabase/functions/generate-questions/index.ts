import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OR_BASE = "https://openrouter.ai/api/v1";
const TARGET_COUNT = 10; // 10문제로 줄여 토큰 절감
const MODEL_TIMEOUT_MS = 30000; // 30초/모델
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// 실제 테스트 확인된 3개 모델 (3 × 30s = 90s max)
const MODELS = [
  "google/gemma-3-27b-it:free",
  "z-ai/glm-4.5-air:free",
  "stepfun/step-3.5-flash:free",
];

async function callWithFallback(prompt: string, apiKey: string): Promise<{ content: string; model: string }> {
  const SKIP_STATUS = [429, 503, 404, 408];
  let lastErr = "no models tried";

  for (const model of MODELS) {
    console.log(`[OR] trying ${model}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
    try {
      const res = await fetch(`${OR_BASE}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://examcraft.app",
          "X-Title": "ExamCraft"
        },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      clearTimeout(timer);
      const body = await res.text();
      console.log(`[OR] ${model} => ${res.status} (${body.length}c)`);

      if (SKIP_STATUS.includes(res.status)) {
        lastErr = `${model} skipped (${res.status})`;
        console.log(`[skip] ${lastErr}`);
        continue;
      }
      if (!res.ok) throw new Error(`${model} ${res.status}: ${body.slice(0, 200)}`);

      const parsed = JSON.parse(body);
      const content = parsed?.choices?.[0]?.message?.content as string;
      if (!content || content.trim() === "") {
        lastErr = `${model} empty content`;
        console.log(`[skip] ${lastErr}`);
        continue;
      }
      console.log(`[OR] ${model} OK (${content.length}c)`);
      return { content, model };
    } catch (e) {
      clearTimeout(timer);
      const msg = String(e);
      if (msg.includes("AbortError") || msg.includes("abort")) {
        lastErr = `${model} timeout`;
        console.log(`[skip] ${lastErr}`);
        continue;
      }
      throw e;
    }
  }
  throw new Error(`All models failed. Last: ${lastErr}`);
}

function parseQuestions(text: string): any[] {
  const clean = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  const m = clean.match(/\[[\s\S]*\]/);
  if (!m) throw new Error(`JSON array not found: ${text.slice(0, 200)}`);
  const arr = JSON.parse(m[0]);
  const valid = arr.filter((q: any) =>
    q.text &&
    Array.isArray(q.options) && q.options.length === 4 &&
    typeof q.correct_index === "number" && q.correct_index >= 0 && q.correct_index <= 3 &&
    q.explanation &&
    ["상", "중", "하"].includes(q.difficulty) &&
    q.topic
  );
  console.log(`[parse] ${arr.length} total => ${valid.length} valid`);
  return valid;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const orKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!orKey) throw new Error("OPENROUTER_API_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No Authorization header");
    const uc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: ae } = await uc.auth.getUser();
    if (ae || !user) throw new Error("Auth failed: " + (ae?.message ?? "unknown"));

    const { document_id, subject_id, subject_name, extracted_text } = await req.json();
    if (!document_id || !subject_id || !extracted_text) throw new Error("Missing required fields");
    console.log(`[start] uid=${user.id} text=${extracted_text.length}c`);

    const svc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: subj } = await svc
      .from("subjects")
      .select("id")
      .eq("id", subject_id)
      .eq("user_id", user.id)
      .single();
    if (!subj) throw new Error("Subject access denied");

    // 텍스트 4000자로 축소
    const txt = extracted_text.slice(0, 4000);
    const label = subject_name ?? "학습 자료";

    const prompt = `당신은 자격시험 문제 출제 전문가입니다.
학습 자료 (${label}):
"""
${txt}
"""

위 자료를 바탕으로 ${TARGET_COUNT}개 객관식 문제를 생성하세요.
조건: 언어 유지, 보기 4개, 난이도 하/중/상 포함, 상세 해설 작성.

순수 JSON 배열만 응답:
[{"text":"문제","options":["1","2","3","4"],"correct_index":0,"explanation":"설명","difficulty":"중","topic":"주제"}]`;

    const { content, model } = await callWithFallback(prompt, orKey);
    const questions = parseQuestions(content);
    console.log(`[done] ${questions.length}q via ${model}`);

    if (questions.length === 0) throw new Error("No valid questions generated");

    const rows = questions.map((q: any) => ({
      ...q,
      subject_id,
      document_id,
      generation: 1,
    }));

    const { error: ie } = await svc.from("questions").insert(rows);
    if (ie) throw new Error(`DB insert error: ${ie.message}`);

    await svc.from("documents").update({ status: "done" }).eq("id", document_id);
    console.log(`[saved] ${rows.length}q`);

    return new Response(
      JSON.stringify({ success: true, total: rows.length, model }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = String(err);
    console.error("[error]", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
