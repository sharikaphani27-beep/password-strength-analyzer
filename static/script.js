document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    const toggleVisibility = document.getElementById('toggleVisibility');
    const eyeIcon = document.getElementById('eyeIcon');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const result = document.getElementById('result');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const scoreText = document.getElementById('scoreText');
    const feedback = document.getElementById('feedback');
    const checkItems = document.querySelectorAll('.check-item');

    toggleVisibility.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            eyeIcon.textContent = '👁️';
        }
    });

    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzePassword();
        }
    });

    analyzeBtn.addEventListener('click', analyzePassword);

    function analyzePassword() {
        const password = passwordInput.value;

        if (!password) {
            shakeInput();
            return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';

        fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: password })
        })
        .then(response => response.json())
        .then(data => {
            displayResult(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        })
        .finally(() => {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze Password';
        });
    }

    function displayResult(data) {
        result.classList.remove('hidden');
        
        const strengthClass = data.strength.toLowerCase();
        strengthFill.className = 'strength-fill ' + strengthClass;
        strengthText.className = 'strength-text ' + strengthClass;
        strengthText.textContent = data.strength + ' Password';
        
        scoreText.textContent = `Score: ${data.score}/${data.max_score}`;

        checkItems.forEach(item => {
            const checkType = item.dataset.check;
            const passed = data.checks && data.checks[checkType];
            
            if (passed) {
                item.classList.add('passed');
            } else {
                item.classList.remove('passed');
            }
        });

        if (data.feedback && data.feedback.length > 0) {
            feedback.classList.remove('hidden');
            feedback.innerHTML = '<ul>' + data.feedback.map(f => `<li>${f}</li>`).join('') + '</ul>';
        } else {
            feedback.classList.add('hidden');
        }
    }

    function shakeInput() {
        passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);