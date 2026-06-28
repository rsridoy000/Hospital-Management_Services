function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form   = document.getElementById('loginForm');
    const btn    = document.getElementById('loginBtn');
    const errBox = document.getElementById('errorMsg');

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                showError('Please enter both username and password.');
                return;
            }

            // Show loading state
            btn.disabled = true;
            btn.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:3px solid #000;border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:10px;"></span> Signing In...';
            errBox.style.display = 'none';

            try {
                const response = await fetch('/api/accounts/web-login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('access', data.access);
                    localStorage.setItem('refresh', data.refresh);
                    localStorage.setItem('role', data.role);
                    btn.innerHTML = '✅ Success! Redirecting...';
                    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    setTimeout(() => { window.location.href = '/dashboard/'; }, 400);
                } else {
                    showError(data.detail || 'Invalid username or password. Please try again.');
                    resetBtn();
                }
            } catch (err) {
                showError('Connection error. Make sure the server is running.');
                resetBtn();
            }
        };
    }

    function showError(msg) {
        errBox.textContent = '⚠️ ' + msg;
        errBox.style.display = 'block';
    }
    function resetBtn() {
        btn.disabled = false;
        btn.innerHTML = 'Sign In →';
    }
});
