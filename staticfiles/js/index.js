function openStaffModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('staffModal');
    modal.style.display = 'flex';
    // Trigger reflow to apply transitions
    modal.offsetHeight;
    modal.classList.add('active');
    document.getElementById('staffCode').value = '';
    document.getElementById('staffError').style.display = 'none';
    document.getElementById('staffCode').focus();
}

function closeStaffModal() {
    const modal = document.getElementById('staffModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function submitStaffCode(e) {
    e.preventDefault();
    const code = document.getElementById('staffCode').value;
    const errorDiv = document.getElementById('staffError');
    if (code === '730322') {
        window.location.href = '/admin/';
    } else {
        errorDiv.style.display = 'block';
        errorDiv.innerText = 'Access Denied: Invalid Staff Code';
        document.getElementById('staffCode').value = '';
        document.getElementById('staffCode').focus();
    }
}
