document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const ballContainer = document.getElementById('lotto-numbers');
    const themeBtn = document.getElementById('theme-btn');
    const body = document.body;

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

    // Lotto Generation Logic
    generateBtn.addEventListener('click', () => {
        const numbers = generateLottoNumbers();
        displayNumbers(numbers);
    });

    function generateLottoNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomNum = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNum);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function displayNumbers(numbers) {
        ballContainer.innerHTML = '';
        numbers.forEach(num => {
            const ball = document.createElement('div');
            ball.className = `ball ${getColorClass(num)}`;
            ball.textContent = num;
            ballContainer.appendChild(ball);
        });
    }

    function getColorClass(num) {
        if (num <= 10) return 'n1-10';
        if (num <= 20) return 'n11-20';
        if (num <= 30) return 'n21-30';
        if (num <= 40) return 'n31-40';
        return 'n41-45';
    }
});