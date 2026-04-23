document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    const toggleBtn = document.getElementById('toggleBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const result = document.getElementById('result');
    const strengthBadge = document.getElementById('strengthBadge');
    const scoreFill = document.getElementById('scoreFill');
    const uniqueStatus = document.getElementById('uniqueStatus');
    const suggestions = document.getElementById('suggestions');
    const suggestedPassword = document.getElementById('suggestedPassword');
    
    toggleBtn.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = 'Show';
        }
    });
    
    analyzeBtn.addEventListener('click', analyzePassword);
    
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzePassword();
        }
    });
    
    function analyzePassword() {
        const password = passwordInput.value;
        
        if (!password) {
            alert('Please enter a password');
            return;
        }
        
        analyzeBtn.textContent = 'Analyzing...';
        analyzeBtn.disabled = true;
        
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
            analyzeBtn.textContent = 'Analyze Password';
            analyzeBtn.disabled = false;
        });
    }
    
    function displayResult(data) {
        result.classList.remove('hidden');
        
        strengthBadge.textContent = data.strength;
        strengthBadge.className = 'strength-badge ' + data.strength.toLowerCase();
        
        scoreFill.className = 'score-fill ' + data.strength.toLowerCase();
        
        if (data.unique) {
            uniqueStatus.textContent = '✅ Password is unique';
            uniqueStatus.className = 'unique-status unique';
        } else {
            uniqueStatus.textContent = '⚠️ This password was used before';
            uniqueStatus.className = 'unique-status duplicate';
        }
        
        if (data.remarks && data.remarks.length > 0) {
            suggestions.innerHTML = `
                <h4>Suggestions to improve:</h4>
                <ul>
                    ${data.remarks.map(r => `<li>${r}</li>`).join('')}
                </ul>
            `;
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
        
        if (data.suggested) {
            suggestedPassword.innerHTML = `
                <h4>Suggested Strong Password:</h4>
                <code>${data.suggested}</code>
                <button class="copy-btn" onclick="copySuggested()">Copy</button>
            `;
            suggestedPassword.style.display = 'block';
        } else {
            suggestedPassword.style.display = 'none';
        }
    }
    
    window.copySuggested = function() {
        const code = suggestedPassword.querySelector('code');
        navigator.clipboard.writeText(code.textContent).then(() => {
            alert('Password copied to clipboard!');
        });
    };
});