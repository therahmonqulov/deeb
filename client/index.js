document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await response.json();
        if (data.valid) {
            // Headerdagi user nomini almashtir
            const userSpan = document.querySelector('.user span');
            if (userSpan) {
                userSpan.textContent = data.user.name;
            }
        } else {
            localStorage.removeItem('token');
            window.location.href = 'auth.html';
        }
    } catch (err) {
        localStorage.removeItem('token');
        window.location.href = 'auth.html';
    }
});