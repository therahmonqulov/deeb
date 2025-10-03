const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");
const confirmPasswordInput = document.getElementById("confirm-password");

showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
});

showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
});

// Ro'yxatdan o'tish formasi
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.querySelector(".email").value; // register email
    const password = document.querySelector(".password").value;
    const confirmPassword = confirmPasswordInput.value;

    const errorSpan = document.querySelector(".register-confirm-password-error");
    const emailErrorSpan = document.querySelector(".register-email-error");
    const nameErrorSpan = document.querySelector(".register-name-error");
    const registerPasswordErrorSpan = document.querySelector(".register-password-error");

    // Mavjud validatsiya kodlari (tegmasdan saqlang)
    const nameValue = document.getElementById("name").value.trim();
    if (nameValue === "") {
        nameErrorSpan.textContent = "Iltimos, ismingizni kiriting";
    } else if (!nameValue.startsWith("@")) {
        nameErrorSpan.textContent = "Ism @ belgisi bilan boshlanishi kerak";
    } else if (nameValue.length <= 4) {
        nameErrorSpan.textContent = "Ism @ dan keyin kamida 4 ta belgi bo'lishi kerak";
    } else if (nameValue.length >= 16) {
        nameErrorSpan.textContent = "Ism @ bilan birga jami 16 ta belgidan oshmasligi kerak";
    } else {
        nameErrorSpan.textContent = "";
    }

    if (password.length <= 8 || password === "") {
        registerPasswordErrorSpan.textContent = "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
    }

    if (!email.includes("@gmail.com")) {
        emailErrorSpan.textContent = "Iltimos, Gmail manzilini kiriting";
    } else {
        emailErrorSpan.textContent = "";
    }

    if (confirmPassword !== password || confirmPassword === "") {
        errorSpan.textContent = "Parollar mos kelmayapti";
    } else {
        errorSpan.textContent = "";
    }

    // Yangi qism: Agar validatsiya o'tsa, serverga yubor
    if (nameErrorSpan.textContent === "" && emailErrorSpan.textContent === "" && registerPasswordErrorSpan.textContent === "" && errorSpan.textContent === "") {
        try {
            const response = await fetch('https://deeb-backend-aw81.onrender.com/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = 'index.html';
            } else {
                // Yangi: Error turiga qarab mos span ga yoz
                if (data.error === 'name_exists') {
                    nameErrorSpan.textContent = data.message;
                } else if (data.error === 'email_exists') {
                    emailErrorSpan.textContent = data.message;
                } else if (data.error === 'server_error') {
                    alert(data.message); // Umumiy xato uchun alert
                }
            }
        } catch (err) {
            alert('Ulanish xatosi'); // Tarmoq xatosi uchun
        }
    }
});

// Kirish formasini yuborish hodisasi (mavjud validatsiyadan keyin qo'shing)
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    const loginEmailErrorSpan = document.querySelector(".login-email-error");
    const loginPasswordErrorSpan = document.querySelector(".login-password-error");

    // Mavjud validatsiya kodlari (tegmasdan saqlang)
    if (loginEmail === "") {
        loginEmailErrorSpan.textContent = "Foydalanuvchi nomi yoki E-mail kiriting";
    } else {
        loginEmailErrorSpan.textContent = "";
    }

    if (loginPassword === "") {
        loginPasswordErrorSpan.textContent = "Iltimos, parol kiriting";
    } else if (loginPassword.length < 8) {
        loginPasswordErrorSpan.textContent = "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
    } else {
        loginPasswordErrorSpan.textContent = "";
    }

    // Yangilangan qism: Agar validatsiya o'tsa, serverga yubor va error ni span da ko'rsat
    if (loginEmailErrorSpan.textContent === "" && loginPasswordErrorSpan.textContent === "") {
        try {
            const response = await fetch('https://deeb-backend-aw81.onrender.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = 'index.html';
            } else {
                // Yangi: Error turiga qarab mos span ga yoz
                if (data.error === 'email_not_found') {
                    loginEmailErrorSpan.textContent = data.message;
                } else if (data.error === 'invalid_password') {
                    loginPasswordErrorSpan.textContent = data.message;
                } else if (data.error === 'server_error') {
                    alert(data.message); // Umumiy xato uchun alert
                }
            }
        } catch (err) {
            alert('Ulanish xatosi'); // Tarmoq xatosi uchun
        }
    }
});