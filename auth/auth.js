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

    const password = document.getElementById("password").value;
    const confirmPassword = confirmPasswordInput.value;
    const errorSpan = document.querySelector(".register-confirm-password-error");
    const emailErrorSpan = document.querySelector(".register-email-error");
    const nameErrorSpan = document.querySelector(".register-name-error");
    const registerPasswordErrorSpan = document.querySelector(".register-password-error");
    const emailInput = document.getElementById("email").value;

    if (document.getElementById("name").value === "") {
        nameErrorSpan.textContent = "Iltimos, ismingizni kiriting";
    } else {
        nameErrorSpan.textContent = "";
    }

    // parol uzunligini tekshirish
    if (password.length <= 8 || password === "" ) {
        registerPasswordErrorSpan.textContent = "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
    }

    // email manzilining @gmail.com bilan tugashini tekshirish
    if(!emailInput.includes("@gmail.com")) {
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

