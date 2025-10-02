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

// Ro'yxatdan o'tish formasini yuborish hodisasi (mavjud validatsiyadan keyin qo'shing)
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
    if (document.getElementById("name").value === "") {
        nameErrorSpan.textContent = "Iltimos, ismingizni kiriting";
    } else if (document.getElementById("name").value.length <= 3 || document.getElementById("name").value.length >= 17) {
        nameErrorSpan.textContent = "Ism 3 dan 17 gacha bo'lgan belgidan iborat bo'lishi kerak";
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
    if (nameErrorSpan.textContent === "" 
        && emailErrorSpan.textContent === "" 
        && registerPasswordErrorSpan.textContent === "" 
        && errorSpan.textContent === "") {
        try {
            const response = await fetch('https://deeb-backend-aw81.onrender.com/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token); // Yangi: Token saqlash
                window.location.href = 'index.html';
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Xato:', err);
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
    } else if (!loginEmail.includes("@gmail.com") || loginEmail.length >= 17) {
        loginEmailErrorSpan.textContent = "To'g'ri foydalanuvchi nomi yoki e-mail kiriting";
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

    // Agar validatsiya o'tsa, serverga yubor (email va password ishlat)
    if (loginEmailErrorSpan.textContent === "" && loginPasswordErrorSpan.textContent === "") {
        try {
            const response = await fetch('https://deeb-backend-aw81.onrender.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token); // Yangi: Token saqlash
                window.location.href = 'index.html';
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Xato:', err);
        }
    }
});