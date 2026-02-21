document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    const body = document.body;
    const dropZone = document.getElementById('drop-zone');
    const imageUpload = document.getElementById('image-upload');
    const resultContainer = document.getElementById('result-container');
    const uploadArea = document.getElementById('upload-area');
    const faceImage = document.getElementById('face-image');
    const labelContainer = document.getElementById('label-container');
    const retryBtn = document.getElementById('retry-btn');
    const loading = document.getElementById('loading');

    // Teachable Machine Model URL
    const URL = 'https://teachablemachine.withgoogle.com/models/dMPinJ0y0/';
    let model, maxPredictions;

    // Load initial theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        themeBtn.textContent = '☀️';
    }

    // Theme Toggle Logic
    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        themeBtn.textContent = isDarkMode ? '☀️' : '🌙';
    });

    // Model Initialization
    async function init() {
        const modelURL = URL + 'model.json';
        const metadataURL = URL + 'metadata.json';
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }

    // Image Upload Logic
    dropZone.addEventListener('click', () => imageUpload.click());

    imageUpload.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImage(e.target.files[0]);
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--button-bg)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--ball-empty-bg)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImage(e.dataTransfer.files[0]);
        }
    });

    async function handleImage(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            faceImage.src = e.target.result;
            uploadArea.style.display = 'none';
            loading.style.display = 'block';
            
            if (!model) await init();
            await predict();
            
            loading.style.display = 'none';
            resultContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    async function predict() {
        const prediction = await model.predict(faceImage);
        labelContainer.innerHTML = '';
        
        // Sort predictions by probability
        prediction.sort((a, b) => b.probability - a.probability);

        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction = prediction[i].className;
            const probability = (prediction[i].probability * 100).toFixed(0);
            
            const barWrapper = document.createElement('div');
            barWrapper.className = 'result-bar-wrapper';
            barWrapper.innerHTML = `
                <div class="result-label">
                    <span>${classPrediction}</span>
                    <span>${probability}%</span>
                </div>
                <div class="bar-bg">
                    <div class="bar-fill" style="width: ${probability}%"></div>
                </div>
            `;
            labelContainer.appendChild(barWrapper);
        }
    }

    retryBtn.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        uploadArea.style.display = 'block';
        imageUpload.value = '';
    });
});
