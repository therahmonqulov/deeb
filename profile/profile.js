const changePasswordModal = document.getElementById("changePasswordModal");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const closeChangePassword = document.getElementById("closeChangePassword")

closeChangePassword.addEventListener("click", function(){
    changePasswordModal.style.display = "none"
})

changePasswordBtn.addEventListener("click", function(){
    changePasswordModal.style.display = "block"
})

const token = localStorage.getItem('token'); // login qilganda saqlangan token

if (!token) {
  alert('Iltimos, avval tizimga kiring');
  window.location.href = '/auth.html';
}

// Profil ma'lumotlarini yuklash
async function loadProfile() {
  try {
    const res = await fetch('https://deeb-backend-aw81.onrender.com/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Maʼlumot olishda xato');

    const data = await res.json();

    document.getElementById('username').textContent = data.username;
    document.getElementById('email').textContent = data.email;

    if (data.subscription) {
      document.getElementById('subscription-status').textContent = data.subscription.language;
      document.getElementById('plan').textContent = data.subscription.plan;
      document.getElementById('started-at').textContent = data.subscription.startedAt;
      document.getElementById('expires-at').textContent = data.subscription.expiresAt;

      document.getElementById('subscription-details').style.display = 'block';
    } else {
      document.getElementById('subscription-status').textContent = 'Hozircha obuna yo‘q';
    }
  } catch (err) {
    console.error(err);
    alert('Profil maʼlumotlarini yuklab bo‘lmadi. Qayta urining.');
  }
}

// Parolni o‘zgartirish modal
const modal = document.getElementById('changePasswordModal');
const btn = document.getElementById('changePasswordBtn');
const closeBtn = document.getElementById('closeChangePassword');

btn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = 'none';
};

document.getElementById('changePasswordForm').onsubmit = async (e) => {
  e.preventDefault();

  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmNewPassword').value;

  if (newPass !== confirmPass) {
    document.getElementById('confirmNewPassword-error').textContent = 'Parollar mos emas';
    return;
  }

  try {
    const res = await fetch('https://deeb-backend-aw81.onrender.com/api/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newPassword: newPass })
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message);
      modal.style.display = 'none';
    } else {
      document.getElementById('changePassword-error').textContent = result.error;
    }
  } catch (err) {
    document.getElementById('changePassword-error').textContent = 'Xato yuz berdi';
  }
};

// Sahifa yuklanganda ishga tushadi
window.onload = loadProfile;

