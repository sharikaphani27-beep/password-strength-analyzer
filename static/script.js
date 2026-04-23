document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('passwordInput');
    const toggleBtn = document.getElementById('toggleBtn');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeOffIcon = document.getElementById('eyeOffIcon');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const result = document.getElementById('result');
    const strengthText = document.getElementById('strengthText');
    const scoreFill = document.getElementById('scoreFill');
    const scoreText = document.getElementById('scoreText');
    const feedbackList = document.getElementById('feedbackList');

    toggleBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        eyeIcon.classList.toggle('hidden', type === 'text');
        eyeOffIcon.classList.toggle('hidden', type === 'password');
    });

    analyzeBtn.addEventListener('click', async () => {
        const password = passwordInput.value;
        
        if (!password) {
            passwordInput.focus();
            return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();
            displayResult(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze Password';
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeBtn.click();
        }
    });

    function displayResult(data) {
        result.classList.remove('hidden');
        
        const percent = (data.score / data.max_score) * 100;
        
        strengthText.textContent = data.strength;
        strengthText.className = 'strength-value ' + data.strength.toLowerCase();
        
        scoreFill.style.width = percent + '%';
        scoreFill.className = 'score-fill ' + data.strength.toLowerCase();
        
        scoreText.textContent = `${data.score}/${data.max_score}`;
        
        feedbackList.innerHTML = '';
        
        if (data.feedback && data.feedback.length > 0) {
            data.feedback.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                feedbackList.appendChild(li);
            });
        } else if (data.strength === 'Strong') {
            const li = document.createElement('li');
            li.textContent = 'Great password! This is a strong password.';
            li.style.borderLeftColor = 'var(--strong)';
            feedbackList.appendChild(li);
        }
    }
});