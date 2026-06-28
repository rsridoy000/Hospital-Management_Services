function toggleFields() {
    const role = document.getElementById('role').value;
    const patientFields = document.getElementById('patient-fields');
    if (patientFields) {
        patientFields.style.display = (role === 'PATIENT' ? 'block' : 'none');
    }
}

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
    const form = document.getElementById('registerForm');
    
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const errDiv = document.getElementById('globalError');
            const successDiv = document.getElementById('successMsg');
            btn.disabled = true; btn.innerText = 'Creating account...';
            errDiv.style.display = 'none';
            successDiv.style.display = 'none';

            const payload = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                first_name: document.getElementById('first_name').value,
                last_name: document.getElementById('last_name').value,
                role: document.getElementById('role').value,
                password: document.getElementById('password').value,
                age: document.getElementById('age') ? document.getElementById('age').value || 0 : 0,
                gender: document.getElementById('gender') ? document.getElementById('gender').value || 'O' : 'O',
                phone_number: document.getElementById('phone') ? document.getElementById('phone').value || '000' : '000'
            };

            try {
                const response = await fetch('/api/accounts/register/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (response.ok) {
                    // Redirect to login page with success param — no auto-login
                    window.location.href = '/login/?registered=true';
                } else {
                    btn.disabled = false; btn.innerText = 'Register Now';
                    errDiv.style.display = 'block';
                    const errors = Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');
                    errDiv.innerText = '⚠️ ' + errors;
                }
            } catch (err) { 
                btn.disabled = false; btn.innerText = 'Register Now';
                errDiv.style.display = 'block'; errDiv.innerText = '⚠️ Server error. Try again.';
            }
        };
    }
});
