require('dotenv').config(); // .env ni yuklash
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Yangi: JWT import
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'sizingizning_maxfiy_kalitingiz_o_zgartiring'; // Yangi: Secret kalit (xavfsiz qiling!)

// Middleware
app.use(cors()); // Front-end dan so'rovlarga ruxsat
app.use(bodyParser.json()); // JSON body ni parse qilish

// MongoDB ulanish
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB ga ulandi'))
  .catch(err => console.error('MongoDB xatosi:', err));

// Foydalanuvchi modeli
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// ==== YANGI: Foydalanuvchi profil ma'lumotlarini olish uchun middleware ====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Token topilmadi' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Noto‘g‘ri token' });
    req.user = user;
    next();
  });
};

// ==== Obuna (subscription) modeli qo‘shish ====
const subscriptionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  language: { type: String, required: true },       // masalan: "Ingliz tili", "Rus tili"
  plan: { type: String, default: "30 kunlik" },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ==== Profil ma'lumotlarini olish ====
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('-password');
    const subscription = await Subscription.findOne({ userEmail: req.user.email });

    res.json({
      username: user.name,
      email: user.email,
      subscription: subscription ? {
        language: subscription.language,
        plan: subscription.plan,
        startedAt: subscription.startedAt.toISOString().split('T')[0],
        expiresAt: subscription.expiresAt.toISOString().split('T')[0]
      } : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// ==== Parolni o‘zgartirish ====
app.post('/api/change-password', authenticateToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Parol kamida 8 belgi bo‘lishi kerak' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email: req.user.email }, { password: hashed });

    res.json({ message: 'Parol muvaffaqiyatli o‘zgartirildi' });
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Ro'yxatdan o'tish
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ name }, { email }] });
    if (existingUser) {
      if (existingUser.name === name) {
        return res.status(400).json({ error: 'name_exists', message: 'Bu foydalanuvchi nomi allaqachon mavjud' });
      } else if (existingUser.email === email) {
        return res.status(400).json({ error: 'email_exists', message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
      }
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Ro\'yxatdan o\'tdingiz', token });
  } catch (err) {
    res.status(500).json({ error: 'server_error', message: 'Server xatosi' });
  }
});

// Kirish endpointi (token bilan)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'email_not_found', message: 'Bu email ro\'yxatdan o\'tmagan' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'invalid_password', message: 'Noto\'g\'ri parol' });
    }

    const token = jwt.sign({ name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Kirish muvaffaqiyatli', token });
  } catch (err) {
    res.status(500).json({ error: 'server_error', message: 'Server xatosi' });
  }
});

// Yangi: Token ni tekshirish endpointi
app.post('/verify', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Noto\'g\'ri yoki muddati tugagan token' });
  }
});

// === AI INTEGRATSIYASI (Gemini) ===
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // .env dan API key
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Tez va samarali model

// API endpoint: /generate (ai.js tomonidan chaqiriladi)
app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt bo\'sh emas' });
  }

  try {
    const fullPrompt = (userMessage) => `
    Siz til o‘rganish bo‘yicha yuqori malakali va do‘stona ustozsiz.
    Sizning yagona vazifangiz — foydalanuvchiga chet tillarini (ayniqsa ingliz tilini) tushunishga, tarjima qilishga, grammatikani o‘rganishga va mashq qilishga yordam berishdir.

    Qoidalar:
    1.Foydalanuvchi “Siz kimsiz?”, “Siz AI misiz?”, “ChatGPTmisiz?” desa — doim quyidagicha javob ber: “Men sizning til o‘rganish bo‘yicha Ustozingizman.”
    2.Hech qachon o‘zingizni AI, model, ChatGPT, Gemini yoki shunga o‘xshash texnologiya sifatida tanitmang.
    3.Faqat Til o‘rgatuvchi Ustoz bo‘lib qoling.
    4.Javoblar har doim:
    -qisqa,
    -aniq,
    -sodda,
    foydalanuvchi darajasiga mos bo‘lsin.
    5.Tushuntirishlar o‘zbek tilida, lekin kerak joyda inglizcha matnni ham ko‘rsating.
    6.Grammatikani tushuntirganda soddalashtirilgan izohlar va aniq misollar foydalaning.
    7.Agar foydalanuvchi til o‘rganishdan boshqa mavzu (kod yozish, siyosat, texnologiya, maslahat, biznes, matematika va h.k.) bo‘yicha so‘rasa, muloyim rad eting va quyidagicha javob bering:
    “Kechirasiz 😊 Men faqat til o‘rganish bo‘yicha yordam bera olaman. Keling, til mashqini davom ettiramiz.”
    8.Ohang: do‘stona, iliq, rag‘batlantiruvchi va professional bo‘lsin.

    Foydalanuvchi yozgan xabar:
    "${userMessage}"
    `;

    const result = await model.generateContent(fullPrompt(prompt));
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Gemini xatosi:', error);
    res.status(500).json({ error: 'AI javob berolmadi. API key ni tekshiring.' });
  }
});

// Server ishga tushirish
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} da ishlamoqda`);
});
