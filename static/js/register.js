function toggleFields() {
    const role = document.getElementById('role').value;
    const patientFields = document.getElementById('patient-fields');
    if (patientFields) {
        patientFields.style.display = (role === 'PATIENT' ? 'block' : 'none');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const errDiv = document.getElementById('globalError');
            btn.disabled = true; btn.innerText = 'Creating account...';
            errDiv.style.display = 'none';

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
                    const loginRes = await fetch('/api/accounts/web-login/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: payload.username, password: payload.password })
                    });
                    const loginData = await loginRes.json();
                    if (loginRes.ok) {
                        localStorage.setItem('access', loginData.access);
                        localStorage.setItem('role', loginData.role);
                        window.location.href = '/dashboard/';
                    } else { window.location.href = '/login/?registered=true'; }
                } else {
                    btn.disabled = false; btn.innerText = 'Register Now';
                    errDiv.style.display = 'block';
                    errDiv.innerText = 'Registration Failed: ' + JSON.stringify(data);
                }
            } catch (err) { 
                btn.disabled = false; btn.innerText = 'Register Now';
                errDiv.style.display = 'block'; errDiv.innerText = 'Server error. Try again.';
            }
        };
    }
});
