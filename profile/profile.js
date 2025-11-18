const changePasswordModal = document.getElementById("changePasswordModal");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const closeChangePassword = document.getElementById("closeChangePassword")

closeChangePassword.addEventListener("click", function(){
    changePasswordModal.style.display = "none"
})

changePasswordBtn.addEventListener("click", function(){
    changePasswordModal.style.display = "block"
})

