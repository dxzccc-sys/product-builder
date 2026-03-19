export type Difficulty = "상" | "중" | "하";

export interface Subject {
  id: string;
  name: string;
  description: string;
  progress: number;
  lastStudied: string;
  totalChapters: number;
  completedChapters: number;
  color: string;
  icon: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  number: number;
  title: string;
  summary: string;
  keywords: string[];
  examPoints: string[];
  correctRate: number;
}

export interface Question {
  id: string;
  subjectId: string;
  chapterId: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface StudyStats {
  todayQuestions: number;
  totalCorrectRate: number;
  streakDays: number;
}

// ─── Mock Subjects ───────────────────────────────────────────────────────────

export const mockSubjects: Subject[] = [
  {
    id: "cloud",
    name: "클라우드 컴퓨팅",
    description: "AWS, Azure, GCP 기반 클라우드 아키텍처 및 서비스",
    progress: 72,
    lastStudied: "2026-03-18",
    totalChapters: 6,
    completedChapters: 4,
    color: "blue",
    icon: "☁️",
  },
  {
    id: "security",
    name: "정보보안기초",
    description: "암호화, 접근제어, 보안 위협 및 대응 방안",
    progress: 45,
    lastStudied: "2026-03-16",
    totalChapters: 5,
    completedChapters: 2,
    color: "orange",
    icon: "🔒",
  },
  {
    id: "finance",
    name: "금융투자분석",
    description: "재무제표 분석, 투자 지표, 포트폴리오 이론",
    progress: 28,
    lastStudied: "2026-03-10",
    totalChapters: 6,
    completedChapters: 2,
    color: "green",
    icon: "📈",
  },
];

// ─── Mock Chapters ────────────────────────────────────────────────────────────

export const mockChapters: Chapter[] = [
  // Cloud
  {
    id: "cloud-1",
    subjectId: "cloud",
    number: 1,
    title: "클라우드 컴퓨팅 개요",
    summary:
      "클라우드 컴퓨팅은 인터넷을 통해 컴퓨팅 리소스(서버, 스토리지, 데이터베이스, 네트워킹, 소프트웨어 등)를 온디맨드로 제공하는 서비스입니다. IaaS, PaaS, SaaS의 세 가지 주요 서비스 모델과 퍼블릭, 프라이빗, 하이브리드 클라우드 배포 모델이 있습니다.",
    keywords: ["IaaS", "PaaS", "SaaS", "퍼블릭 클라우드", "프라이빗 클라우드", "하이브리드"],
    examPoints: [
      "3가지 서비스 모델(IaaS/PaaS/SaaS)의 차이점과 예시",
      "클라우드의 5가지 핵심 특성 (온디맨드, 광대역 네트워크 접근, 리소스 풀링, 신속한 탄력성, 측정된 서비스)",
      "배포 모델별 장단점 비교",
    ],
    correctRate: 85,
  },
  {
    id: "cloud-2",
    subjectId: "cloud",
    number: 2,
    title: "가상화 기술",
    summary:
      "가상화는 물리적 하드웨어 리소스를 추상화하여 여러 가상 환경을 생성하는 기술입니다. 하이퍼바이저 타입1(베어메탈)과 타입2(호스트형)의 차이, 컨테이너 기반 가상화(Docker, Kubernetes)와 전통적 VM의 비교가 핵심입니다.",
    keywords: ["하이퍼바이저", "VM", "Docker", "Kubernetes", "컨테이너"],
    examPoints: [
      "Type 1 vs Type 2 하이퍼바이저 차이점",
      "컨테이너와 VM의 비교 (격리 수준, 성능, 이식성)",
      "Kubernetes의 주요 컴포넌트 (Pod, Node, Cluster)",
    ],
    correctRate: 70,
  },
  {
    id: "cloud-3",
    subjectId: "cloud",
    number: 3,
    title: "AWS 핵심 서비스",
    summary:
      "AWS의 주요 서비스로는 컴퓨팅(EC2, Lambda), 스토리지(S3, EBS, EFS), 데이터베이스(RDS, DynamoDB), 네트워킹(VPC, CloudFront, Route53) 등이 있습니다. 각 서비스의 용도와 특성을 이해하는 것이 중요합니다.",
    keywords: ["EC2", "S3", "Lambda", "RDS", "VPC", "IAM"],
    examPoints: [
      "EC2 인스턴스 타입과 요금 모델(온디맨드/스팟/예약)",
      "S3 스토리지 클래스 종류와 용도",
      "VPC 구성 요소 (서브넷, 라우팅 테이블, 인터넷 게이트웨이)",
    ],
    correctRate: 60,
  },
  {
    id: "cloud-4",
    subjectId: "cloud",
    number: 4,
    title: "클라우드 보안",
    summary:
      "클라우드 보안은 공동 책임 모델(Shared Responsibility Model)을 기반으로 합니다. AWS는 클라우드 인프라 보안을, 고객은 클라우드 내 데이터 및 애플리케이션 보안을 책임집니다. IAM, 암호화, 보안 그룹, NACL 등이 핵심 보안 도구입니다.",
    keywords: ["공동 책임 모델", "IAM", "암호화", "보안 그룹", "NACL", "KMS"],
    examPoints: [
      "공동 책임 모델에서 AWS와 고객의 책임 범위",
      "IAM 정책, 역할, 사용자의 차이",
      "보안 그룹과 NACL의 차이점",
    ],
    correctRate: 75,
  },
  {
    id: "cloud-5",
    subjectId: "cloud",
    number: 5,
    title: "클라우드 비용 최적화",
    summary:
      "클라우드 비용 최적화는 FinOps의 핵심입니다. 예약 인스턴스, 스팟 인스턴스, 오토스케일링, 적절한 사이징 등의 전략을 통해 비용을 절감할 수 있습니다. AWS Cost Explorer, Trusted Advisor 등의 도구를 활용합니다.",
    keywords: ["FinOps", "예약 인스턴스", "스팟 인스턴스", "오토스케일링", "Cost Explorer"],
    examPoints: [
      "예약 인스턴스 vs 스팟 인스턴스 적합한 사용 시나리오",
      "오토스케일링 그룹의 구성 요소",
      "비용 최적화 7가지 모범 사례",
    ],
    correctRate: 55,
  },
  {
    id: "cloud-6",
    subjectId: "cloud",
    number: 6,
    title: "서버리스 아키텍처",
    summary:
      "서버리스는 서버 관리 없이 코드를 실행할 수 있는 클라우드 실행 모델입니다. AWS Lambda, API Gateway, DynamoDB, S3를 조합하여 완전한 서버리스 애플리케이션을 구축할 수 있습니다. 이벤트 기반 아키텍처가 핵심입니다.",
    keywords: ["Lambda", "API Gateway", "이벤트 기반", "FaaS", "서버리스"],
    examPoints: [
      "Lambda의 실행 환경과 제한 사항(메모리, 실행 시간)",
      "서버리스의 장단점",
      "이벤트 트리거 종류",
    ],
    correctRate: 65,
  },

  // Security
  {
    id: "security-1",
    subjectId: "security",
    number: 1,
    title: "정보보안 개요",
    summary:
      "정보보안의 3대 핵심 요소는 기밀성(Confidentiality), 무결성(Integrity), 가용성(Availability)으로 CIA 트라이어드라 합니다. 위협, 취약점, 위험의 관계를 이해하고 보안 정책 수립의 기본 원칙을 파악해야 합니다.",
    keywords: ["CIA 트라이어드", "기밀성", "무결성", "가용성", "위협", "취약점"],
    examPoints: [
      "CIA 트라이어드 각 요소의 정의와 예시",
      "위협 = 위협원 × 취약점의 관계",
      "보안 정책의 3가지 구성요소",
    ],
    correctRate: 80,
  },
  {
    id: "security-2",
    subjectId: "security",
    number: 2,
    title: "암호화 기술",
    summary:
      "암호화는 대칭키(AES, DES)와 비대칭키(RSA, ECC)로 구분됩니다. 대칭키는 속도가 빠르지만 키 배분 문제가 있고, 비대칭키는 느리지만 공개키/개인키 쌍으로 키 배분 문제를 해결합니다. 해시함수(MD5, SHA)는 무결성 검증에 사용됩니다.",
    keywords: ["대칭키", "비대칭키", "AES", "RSA", "해시", "SHA", "PKI"],
    examPoints: [
      "대칭키 vs 비대칭키 암호화 차이점과 사용 시나리오",
      "SSL/TLS 핸드셰이크 과정",
      "해시함수의 특성 (일방향성, 충돌 저항성)",
    ],
    correctRate: 55,
  },
  {
    id: "security-3",
    subjectId: "security",
    number: 3,
    title: "네트워크 보안",
    summary:
      "네트워크 보안의 주요 위협으로는 DoS/DDoS, 스니핑, 스푸핑, 중간자 공격(MITM) 등이 있습니다. 방화벽, IDS/IPS, VPN, DMZ 구성을 통해 네트워크를 보호합니다.",
    keywords: ["DDoS", "방화벽", "IDS", "IPS", "VPN", "DMZ", "MITM"],
    examPoints: [
      "IDS vs IPS의 차이점",
      "DMZ 구성의 목적과 방법",
      "DoS vs DDoS 공격 유형",
    ],
    correctRate: 45,
  },
  {
    id: "security-4",
    subjectId: "security",
    number: 4,
    title: "접근 제어",
    summary:
      "접근 제어 모델에는 DAC(임의적), MAC(강제적), RBAC(역할기반), ABAC(속성기반)이 있습니다. 최소 권한 원칙(Least Privilege)과 직무 분리(Separation of Duties)는 접근 제어의 핵심 원칙입니다.",
    keywords: ["DAC", "MAC", "RBAC", "ABAC", "최소 권한", "직무 분리"],
    examPoints: [
      "4가지 접근 제어 모델의 특성과 차이점",
      "최소 권한 원칙 적용 사례",
      "인증 vs 인가의 차이",
    ],
    correctRate: 50,
  },
  {
    id: "security-5",
    subjectId: "security",
    number: 5,
    title: "보안 위협 및 대응",
    summary:
      "주요 사이버 공격 유형으로는 피싱, 랜섬웨어, SQL 인젝션, XSS, CSRF 등이 있습니다. OWASP Top 10을 숙지하고, 각 공격에 대한 방어 기법을 이해해야 합니다.",
    keywords: ["피싱", "랜섬웨어", "SQL 인젝션", "XSS", "CSRF", "OWASP"],
    examPoints: [
      "OWASP Top 10 주요 취약점",
      "SQL 인젝션 공격 원리와 방어",
      "XSS vs CSRF 차이점",
    ],
    correctRate: 40,
  },

  // Finance
  {
    id: "finance-1",
    subjectId: "finance",
    number: 1,
    title: "재무제표 분석",
    summary:
      "재무제표는 재무상태표(BS), 손익계산서(IS), 현금흐름표(CF)로 구성됩니다. 각 재무제표의 구성 항목과 상호 관계를 이해하고, 수익성, 유동성, 안정성 지표를 계산하고 해석할 수 있어야 합니다.",
    keywords: ["재무상태표", "손익계산서", "현금흐름표", "ROE", "ROA", "유동비율"],
    examPoints: [
      "3대 재무제표의 구성과 상호 관계",
      "ROE, ROA, ROI 계산 공식",
      "유동비율, 부채비율 계산 및 해석",
    ],
    correctRate: 35,
  },
  {
    id: "finance-2",
    subjectId: "finance",
    number: 2,
    title: "투자 지표",
    summary:
      "주식 투자의 핵심 지표로는 PER(주가수익비율), PBR(주가순자산비율), EPS(주당순이익), BPS(주당순자산) 등이 있습니다. 이러한 지표들을 통해 주식의 적정 가치를 평가하고 투자 결정을 내립니다.",
    keywords: ["PER", "PBR", "EPS", "BPS", "배당수익률", "DCF"],
    examPoints: [
      "PER, PBR 계산 공식과 해석 기준",
      "EPS가 높을수록 좋은 이유",
      "DCF(할인현금흐름) 방법론",
    ],
    correctRate: 30,
  },
];

// ─── Mock Questions ───────────────────────────────────────────────────────────

export const mockQuestions: Question[] = [
  {
    id: "q1",
    subjectId: "cloud",
    chapterId: "cloud-1",
    text: "클라우드 컴퓨팅의 서비스 모델 중 사용자가 애플리케이션만 관리하고 나머지 인프라는 모두 클라우드 제공자가 관리하는 모델은?",
    options: ["IaaS", "PaaS", "SaaS", "FaaS"],
    correctIndex: 2,
    explanation:
      "SaaS(Software as a Service)는 소프트웨어까지 모두 제공되므로 사용자는 애플리케이션 사용만 하면 됩니다. IaaS는 인프라, PaaS는 플랫폼까지 제공됩니다.",
    difficulty: "하",
  },
  {
    id: "q2",
    subjectId: "cloud",
    chapterId: "cloud-1",
    text: "NIST가 정의한 클라우드 컴퓨팅의 5가지 핵심 특성에 해당하지 않는 것은?",
    options: [
      "온디맨드 셀프 서비스",
      "광대역 네트워크 접근",
      "전용 하드웨어 보장",
      "측정된 서비스",
    ],
    correctIndex: 2,
    explanation:
      "NIST 클라우드 5대 특성: 온디맨드 셀프 서비스, 광대역 네트워크 접근, 리소스 풀링, 신속한 탄력성, 측정된 서비스. '전용 하드웨어 보장'은 포함되지 않으며 오히려 클라우드의 리소스 풀링 개념과 반대됩니다.",
    difficulty: "중",
  },
  {
    id: "q3",
    subjectId: "cloud",
    chapterId: "cloud-2",
    text: "Type 1 하이퍼바이저(베어메탈)의 특징으로 올바른 것은?",
    options: [
      "호스트 OS 위에서 동작한다",
      "하드웨어에 직접 설치되어 동작한다",
      "VirtualBox, VMware Workstation이 대표적 예시다",
      "Type 2보다 성능이 낮다",
    ],
    correctIndex: 1,
    explanation:
      "Type 1(베어메탈) 하이퍼바이저는 물리 하드웨어에 직접 설치됩니다. VMware ESXi, Microsoft Hyper-V가 대표적입니다. Type 2는 호스트 OS 위에서 동작하며 VirtualBox, VMware Workstation이 예시입니다.",
    difficulty: "중",
  },
  {
    id: "q4",
    subjectId: "cloud",
    chapterId: "cloud-3",
    text: "AWS S3의 스토리지 클래스 중 데이터 접근 빈도가 낮고(월 1~2회) 검색 시 몇 밀리초의 지연이 허용될 때 가장 비용 효율적인 클래스는?",
    options: [
      "S3 Standard",
      "S3 Standard-IA",
      "S3 Glacier Instant Retrieval",
      "S3 Glacier Deep Archive",
    ],
    correctIndex: 2,
    explanation:
      "S3 Glacier Instant Retrieval은 분기별 접근 데이터에 적합하며 밀리초 검색이 가능합니다. Standard-IA는 월 1회 이상 접근에 적합하고, Glacier Deep Archive는 연 1-2회 접근에 가장 저렴합니다.",
    difficulty: "상",
  },
  {
    id: "q5",
    subjectId: "cloud",
    chapterId: "cloud-4",
    text: "AWS 공동 책임 모델에서 '고객'의 책임에 해당하는 것은?",
    options: [
      "물리적 데이터센터 보안",
      "하이퍼바이저 패치 관리",
      "EC2 인스턴스 내 운영체제 패치",
      "글로벌 네트워크 인프라 보호",
    ],
    correctIndex: 2,
    explanation:
      "공동 책임 모델에서 AWS는 클라우드 인프라(물리 서버, 네트워크, 하이퍼바이저 등)를 책임지고, 고객은 클라우드 내부(게스트 OS, 애플리케이션, 데이터, IAM)를 책임집니다.",
    difficulty: "중",
  },
  {
    id: "q6",
    subjectId: "security",
    chapterId: "security-1",
    text: "정보보안의 CIA 트라이어드에서 '무결성(Integrity)'을 위협하는 공격 유형은?",
    options: [
      "DDoS 공격으로 서비스 불가",
      "데이터 도청으로 정보 유출",
      "데이터 위변조로 내용 수정",
      "계정 탈취로 불법 접근",
    ],
    correctIndex: 2,
    explanation:
      "무결성은 데이터가 허가 없이 변경되지 않아야 함을 의미합니다. DDoS는 가용성, 도청은 기밀성, 불법 접근은 기밀성/무결성 위협입니다.",
    difficulty: "하",
  },
  {
    id: "q7",
    subjectId: "security",
    chapterId: "security-2",
    text: "비대칭키 암호화에서 데이터를 암호화할 때 사용하는 키는?",
    options: [
      "수신자의 개인키",
      "수신자의 공개키",
      "송신자의 개인키",
      "송신자의 공개키",
    ],
    correctIndex: 1,
    explanation:
      "비대칭키 암호화에서 데이터를 암호화할 때는 수신자의 공개키를 사용하고, 복호화는 수신자의 개인키로 합니다. 전자서명은 반대로 송신자의 개인키로 서명하고 공개키로 검증합니다.",
    difficulty: "중",
  },
  {
    id: "q8",
    subjectId: "security",
    chapterId: "security-3",
    text: "IDS(침입탐지시스템)와 IPS(침입방지시스템)의 가장 큰 차이점은?",
    options: [
      "IDS는 네트워크 기반, IPS는 호스트 기반이다",
      "IDS는 탐지만 하고 IPS는 탐지 후 자동 차단한다",
      "IDS는 유료, IPS는 무료다",
      "IDS는 방화벽 내부, IPS는 방화벽 외부에 설치한다",
    ],
    correctIndex: 1,
    explanation:
      "IDS는 침입을 탐지하고 경보를 발생시키지만 차단하지는 않습니다. IPS는 탐지 후 자동으로 트래픽을 차단하는 능동적 대응을 합니다.",
    difficulty: "하",
  },
  {
    id: "q9",
    subjectId: "security",
    chapterId: "security-5",
    text: "SQL 인젝션 공격을 방어하는 가장 효과적인 방법은?",
    options: [
      "HTTPS 적용",
      "Prepared Statement(매개변수화 쿼리) 사용",
      "강력한 비밀번호 정책 적용",
      "세션 타임아웃 설정",
    ],
    correctIndex: 1,
    explanation:
      "Prepared Statement는 SQL 쿼리 구조와 데이터를 분리하여 사용자 입력이 SQL 명령으로 해석되지 않도록 합니다. 입력값 검증, WAF도 보조적 방어 수단입니다.",
    difficulty: "중",
  },
  {
    id: "q10",
    subjectId: "finance",
    chapterId: "finance-1",
    text: "ROE(자기자본이익률)의 계산 공식으로 올바른 것은?",
    options: [
      "(순이익 / 총자산) × 100",
      "(순이익 / 자기자본) × 100",
      "(영업이익 / 매출액) × 100",
      "(순이익 / 매출액) × 100",
    ],
    correctIndex: 1,
    explanation:
      "ROE = (순이익 / 자기자본) × 100. ROA는 순이익/총자산, 영업이익률은 영업이익/매출액, 순이익률은 순이익/매출액입니다. ROE가 높을수록 주주 자본을 효율적으로 활용하는 것입니다.",
    difficulty: "중",
  },
];

// ─── Mock Stats ───────────────────────────────────────────────────────────────

export const mockStats: StudyStats = {
  todayQuestions: 23,
  totalCorrectRate: 68,
  streakDays: 7,
};
