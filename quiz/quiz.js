// A2 English Quiz – 10 ta savol
const questions = [
  {
    question: "1. What do you say when you meet a friend in the morning?",
    options: ["Good evening", "Good night", "Good morning", "Goodbye"],
    correct: 2
  },
  {
    question: "2. My father’s sister is my ______.",
    options: ["uncle", "aunt", "grandmother", "cousin"],
    correct: 1
  },
  {
    question: "3. How many months are there in a year?",
    options: ["10", "11", "12", "13"],
    correct: 2
  },
  {
    question: "4. She ______ a student.",
    options: ["am", "is", "are", "be"],
    correct: 1
  },
  {
    question: "5. What color is the sky on a sunny day?",
    options: ["green", "blue", "red", "black"],
    correct: 1
  },
  {
    question: "6. I usually ______ breakfast at 7 o’clock.",
    options: ["have", "has", "having", "haves"],
    correct: 0
  },
  {
    question: "7. ______ you like pizza?",
    options: ["Do", "Does", "Is", "Are"],
    correct: 0
  },
  {
    question: "8. Cats ______ climb trees.",
    options: ["can", "can’t", "don’t", "doesn’t"],
    correct: 0
  },
  {
    question: "9. There ______ two books on the table.",
    options: ["is", "are", "am", "be"],
    correct: 1
  },
  {
    question: "10. We go to school ______ bus.",
    options: ["on", "by", "in", "at"],
    correct: 1
  }
];

let currentQuestion = 0;
let score = 0;

// Elementlar
const questionTitle = document.querySelector('.question-area h1');
const optionsContainer = document.querySelector('.options');
const submitBtn = document.querySelector('.submit');
const questionNumbers = document.querySelectorAll('.num');

// Chiroyli xabar funksiyasi
function showMessage(text) {
  const old = document.querySelector('.custom-alert');
  if (old) old.remove();

  const div = document.createElement('div');
  div.className = 'custom-alert';
  div.innerHTML = `<div class="alert-content"><span>${text}</span><button onclick="this.parentElement.parentElement.remove()">OK</button></div>`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}
// Variantlarni aralashtirish funksiyasi (Fisher-Yates algoritmi)
function shuffleArray(array) {
  const arr = [...array]; // nusxa olamiz
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Savolni yuklash (YANGI VERSIYA – variantlar random!)
function loadQuestion() {
  const q = questions[currentQuestion];

  questionTitle.textContent = q.question;

  // Variantlarni indeks bilan birga aralashtiramiz
  const optionsWithIndex = q.options.map((opt, index) => ({ opt, index }));
  const shuffled = shuffleArray(optionsWithIndex);

  optionsContainer.innerHTML = '';

  shuffled.forEach((item, i) => {
    const label = document.createElement('label');
    label.className = 'option';
    const letter = String.fromCharCode(65 + i); // A, B, C, D
    const isCorrect = item.index === q.correct;

    label.innerHTML = `
      <input type="radio" name="ans">
      <span class="letter">${letter}</span>
      ${item.opt}
      <span class="check">✔</span>
    `;

    // To'g'ri javobni saqlab qo'yamiz (keyinroq tekshirish uchun)
    label.dataset.correct = isCorrect;

    optionsContainer.appendChild(label);
  });

  // Tanlangan javobni tozalash
  document.querySelectorAll('.option').forEach(o => {
    o.classList.remove('selected');
    o.querySelector('.check').style.display = 'none';
  });

  // Savollar ro'yxatini yangilash
  questionNumbers.forEach((num, index) => {
    num.classList.remove('current', 'active');
    num.textContent = index + 1;
    num.style.color = '';

    if (index === currentQuestion) {
      num.classList.add('current');
    }
    if (index < currentQuestion) {
      num.textContent = '✔';
      num.classList.add('active');
      num.style.color = '#10b981';
    }
  });
}

// Variant tanlash
optionsContainer.addEventListener('click', function(e) {
  const option = e.target.closest('.option');
  if (!option) return;

  document.querySelectorAll('.option').forEach(o => {
    o.classList.remove('selected');
    o.querySelector('.check').style.display = 'none';
  });
  option.classList.add('selected');
  option.querySelector('.check').style.display = 'block';
});

// Submit bosilganda (YANGI – random variantlar uchun)
submitBtn.addEventListener('click', function() {
  const selected = document.querySelector('.option.selected');
  if (!selected) {
    showMessage('Iltimos, javob tanlang!');
    return;
  }

  // To'g'ri yoki noto'g'ri ekanini dataset.correct dan olamiz
  const isCorrect = selected.dataset.correct === 'true';

  if (isCorrect) {
    score++;
  }

  currentQuestion++;

  if (currentQuestion < questions.length) {
    loadQuestion();
    showMessage('Keyingi savolga o\'tildi!');
  } else {
    // Quiz tugadi
    document.querySelector('.main').innerHTML = `
      <div style="text-align:center; padding:100px 0; background:white; border-radius:20px; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
        <h1 style="font-size:48px; color:#10b981; margin-bottom:20px;">Tabriklayman!</h1>
        <p style="font-size:26px; color:#374151; margin-bottom:30px;">
          Siz 10 ta savoldan
        </p>
        <h2 style="font-size:70px; color:#10b981; margin:40px 0;">
          ${score} ta to'g'ri javob berdingiz!
        </h2>
        <p style="font-size:22px; color:#6b7280; margin-bottom:40px;">
          ${score >= 9 ? 'Ajoyib! Ingliz tili zo\'r!' : score >= 7 ? 'Juda yaxshi!' : 'Yana urinib ko\'ring!'}
        </p>
        <button onclick="location.reload()" style="padding:16px 50px; background:#10b981; color:white; border:none; border-radius:50px; font-size:20px; cursor:pointer; font-weight:bold;">
          Yana boshlash
        </button>
      </div>
    `;
  }
});

// Timer – 15 daqiqa (A2 uchun yetarli)
let time = 15 * 60;
const timerElement = document.querySelector('.time');
const progressCircle = document.querySelector('.progress');
const totalLength = 534;

function updateTimer() {
  const mins = String(Math.floor(time / 60)).padStart(2, '0');
  const secs = String(time % 60).padStart(2, '0');
  timerElement.textContent = `${mins}:${secs}`;

  const offset = totalLength * (1 - time / (15 * 60));
  progressCircle.style.strokeDashoffset = offset;

  if (time <= 0) {
    timerElement.textContent = "00:00";
    showMessage(`Vaqt tugadi! Natija: ${score}/10`);
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
  } else {
    time--;
  }
}
setInterval(updateTimer, 1000);
updateTimer();

// Birinchi savolni yuklash
loadQuestion();