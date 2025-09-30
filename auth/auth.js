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

confirmPasswordInput.addEventListener("input", () => {
    const password = document.getElementById("password").value;
    const confirmPassword = confirmPasswordInput.value;
    const errorSpan = document.querySelector(".register-confirm-password-error");

    if (confirmPassword !== password) {
        errorSpan.textContent = "Parollar mos kelmayapti";
    } else {
        errorSpan.textContent = "";
    }
});

