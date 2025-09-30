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

// Ro'yxatdan o'tish formasini yuborish hodisasi
registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const password = document.querySelector(".password").value;
    const confirmPassword = confirmPasswordInput.value;
    const errorSpan = document.querySelector(".register-confirm-password-error");
    const emailErrorSpan = document.querySelector(".register-email-error");
    const nameErrorSpan = document.querySelector(".register-name-error");
    const registerPasswordErrorSpan = document.querySelector(".register-password-error");
    const emailInput = document.querySelector(".email").value;

    if (document.getElementById("name").value === "") {
        nameErrorSpan.textContent = "Iltimos, ismingizni kiriting";
    } else if (!document.getElementById("name").value.includes("@")) {
        nameErrorSpan.textContent = "Ism @ belgisini o'z ichiga olishi kerak";
    } else if (document.getElementById("name").value.length <= 3 || document.getElementById("name").value.length >= 17) {
        nameErrorSpan.textContent = "Ism 3 dan 17 gacha bo'lgan belgidan iborat bo'lishi kerak";
    } else {
        nameErrorSpan.textContent = "";
    }

    // parol uzunligini tekshirish
    if (password.length <= 8 || password === "") {
        registerPasswordErrorSpan.textContent = "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
    }

    // email manzilining @gmail.com bilan tugashini tekshirish
    if (!emailInput.includes("@gmail.com")) {
        emailErrorSpan.textContent = "Iltimos, Gmail manzilini kiriting";
    } else {
        emailErrorSpan.textContent = "";
    }

    // parollar mos kelishini tekshirish
    if (confirmPassword !== password || confirmPassword === "") {
        errorSpan.textContent = "Parollar mos kelmayapti";
    } else {
        errorSpan.textContent = "";
    }
});

// Kirish formasini yuborish hodisasi
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;
    const loginEmailErrorSpan = document.querySelector(".login-email-error");
    const loginPasswordErrorSpan = document.querySelector(".login-password-error");

    if (loginEmail === "") {
        loginEmailErrorSpan.textContent = "Foydalanuvchi nomi yoki E-mail kiriting";
    } else if (!loginEmail.includes("@") || !loginEmail.includes("@gmail.com")) {
        loginEmailErrorSpan.textContent = "To'g'ri foydalanuvchi nomi yoki e-mail kiriting";
    } else {
        loginEmailErrorSpan.textContent = "";
    }

    if (loginPassword === "") {
        loginPasswordErrorSpan.textContent = "Iltimos, parol kiriting";
    }else if (loginPassword.length < 8) {
        loginPasswordErrorSpan.textContent = "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
    } 
    else {
        loginPasswordErrorSpan.textContent = "";
    }
});

