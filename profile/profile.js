const token = localStorage.getItem('token');

if (!token) {
  alert("Iltimos, avval tizimga kiring!");
  window.location.href = "../login.html"; // yoki sizning login sahifangiz
}

// Sahifa yuklanganda profilni yuklash
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Profil yuklanmadi');
    }

    // Profil ma'lumotlarini to'ldirish
    document.getElementById('username').textContent = data.name || 'Noma’lum';
    document.getElementById('email').textContent = data.email || 'Noma’lum';
    document.getElementById('subscription-status').textContent = data.selectedCourse;

    // Obuna mavjud bo'lsa — batafsil ko‘rsatish
    if (data.subscriptionPlan && data.subscriptionPlan !== "Bepul") {
      document.getElementById('plan').textContent = data.subscriptionPlan;
      document.getElementById('started-at').textContent = data.subscriptionStart || "Noma’lum";
      document.getElementById('expires-at').textContent = data.subscriptionEnd || "Noma’lum";
      document.getElementById('subscription-details').style.display = 'block';

      document.getElementById('subscription-status').classList.add('subscription-active');
    } else {
      document.getElementById('subscription-status').textContent = "Obuna yo‘q";
      document.getElementById('subscription-status').classList.add('subscription-inactive');
    }

  } catch (error) {
    console.error("Profil yuklashda xato:", error);
    alert("Profil yuklanmadi. Qayta kirib ko‘ring.");
    // localStorage.removeItem('token');
    // window.location.href = "../login.html";
  }
});