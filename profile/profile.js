let token = localStorage.getItem('token');

if (!token) {
  alert("Iltimos, avval tizimga kiring");
  window.location.href = "../login.html";
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Maʼlumot yuklanmadi');
    }

    const data = await response.json();

    document.getElementById('username').textContent = data.name;
    document.getElementById('email').textContent = data.email;
    document.getElementById('subscription-status').textContent = data.selectedCourse || "Tanlanmagan";

    if (data.subscriptionPlan && data.subscriptionPlan !== "Bepul") {
      document.getElementById('plan').textContent = data.subscriptionPlan;
      document.getElementById('started-at').textContent = data.subscriptionStart || "-";
      document.getElementById('expires-at').textContent = data.subscriptionEnd || "-";
      document.getElementById('subscription-details').style.display = 'block';
    }

  } catch (error) {
    console.error(error);
    alert("Profil yuklanmadi. Qayta kirib ko‘ring.");
    localStorage.removeItem('token');
    window.location.href = "../login.html";
  }
});