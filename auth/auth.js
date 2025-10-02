document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.querySelector('#register-form form');
    const loginForm = document.querySelector('#login-form form');
    const showLogin = document.getElementById('show-login');
    const showRegister = document.getElementById('show-register');

    // Formlar o'rtasida o'tish
    showLogin.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    showRegister.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });

    // Ro'yxatdan o'tish formasi
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearRegisterErrors(); // Oldingi xatolarni tozalash

        const name = document.getElementById('name').value.trim();
        const email = registerForm.querySelector('.email').value.trim();
        const password = registerForm.querySelector('.password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        let hasError = false;

        // Client tomonida validatsiya
        if (!name) {
            document.querySelector('.register-name-error').textContent = 'Foydalanuvchi nomi kiritilishi shart!';
            hasError = true;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            document.querySelector('.register-email-error').textContent = 'To\'g\'ri email kiriting!';
            hasError = true;
        }
        if (password.length < 8) {
            document.querySelector('.register-password-error').textContent = 'Parol kamida 8 ta belgi bo\'lishi kerak!';
            hasError = true;
        }
        if (password !== confirmPassword) {
            document.querySelector('.register-confirm-password-error').textContent = 'Parollar mos kelmaydi!';
            hasError = true;
        }

        if (hasError) return;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Muvaffaqiyatli ro'yxatdan o'tish
                alert('Ro\'yxatdan o\'tdingiz! Endi kirishingiz mumkin.'); // Bu yerda alert saqlanadi, chunki muvaffaqiyat
                document.getElementById('register-form').style.display = 'none';
                document.getElementById('login-form').style.display = 'block';
            } else {
                // Server xatolari: nom yoki email mavjudligini tekshirish
                if (data.error.includes('Foydalanuvchi allaqachon mavjud')) {
                    // Qaysi maydon xato ekanligini aniqlash uchun qo'shimcha tekshirish
                    const checkName = await fetch('/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email: 'test@test.com', password: 'test' }) });
                    const nameData = await checkName.json();
                    if (nameData.error && nameData.error.includes(name)) {
                        document.querySelector('.register-name-error').textContent = 'Bu foydalanuvchi nomi allaqachon band!';
                    }
                    const checkEmail = await fetch('/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'test', email, password: 'test' }) });
                    const emailData = await checkEmail.json();
                    if (emailData.error && emailData.error.includes(email)) {
                        document.querySelector('.register-email-error').textContent = 'Bu email allaqachon ro\'yxatdan o\'tgan!';
                    }
                } else {
                    document.querySelector('.register-password-error').textContent = data.error; // Umumiy xato
                }
            }
        } catch (err) {
            document.querySelector('.register-password-error').textContent = 'Server bilan bog\'lanishda xato!';
        }
    });

    // Kirish formasi
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearLoginErrors(); // Oldingi xatolarni tozalash

        const loginEmail = document.getElementById('login-email').value.trim();
        const loginPassword = document.getElementById('login-password').value;

        let hasError = false;

        if (!loginEmail || !/\S+@\S+\.\S+/.test(loginEmail)) {
            document.querySelector('.login-email-error').textContent = 'To\'g\'ri email kiriting!';
            hasError = true;
        }
        if (!loginPassword) {
            document.querySelector('.login-password-error').textContent = 'Parol kiritilishi shart!';
            hasError = true;
        }

        if (hasError) return;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });

            const data = await response.json();

            if (response.ok) {
                // Muvaffaqiyatli kirish
                alert('Kirish muvaffaqiyatli!'); // Bu yerda alert saqlanadi, chunki muvaffaqiyat
                localStorage.setItem('token', data.token); // Token saqlash
                // Bu yerda redirect yoki boshqa harakat
            } else {
                // Login xatolari
                if (data.error.includes('Noto\'g\'ri email yoki parol')) {
                    document.querySelector('.login-email-error').textContent = 'Noto\'g\'ri email!';
                    document.querySelector('.login-password-error').textContent = 'Noto\'g\'ri parol!';
                } else {
                    document.querySelector('.login-password-error').textContent = data.error;
                }
            }
        } catch (err) {
            document.querySelector('.login-password-error').textContent = 'Server bilan bog\'lanishda xato!';
        }
    });

    // Xato span'larini tozalash funksiyalari
    function clearRegisterErrors() {
        document.querySelector('.register-name-error').textContent = '';
        document.querySelector('.register-email-error').textContent = '';
        document.querySelector('.register-password-error').textContent = '';
        document.querySelector('.register-confirm-password-error').textContent = '';
    }

    function clearLoginErrors() {
        document.querySelector('.login-email-error').textContent = '';
        document.querySelector('.login-password-error').textContent = '';
    }
});