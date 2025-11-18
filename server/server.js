require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-prod';

// Middleware
app.use(cors({
  origin: '*', // Productionda o‘zgartiring: 'https://deeb.uz'
  credentials: true
}));
app.use(bodyParser.json());

// MongoDB ulanish
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB ga muvaffaqiyatli ulandi'))
  .catch(err => console.error('MongoDB ulanish xatosi:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  selectedCourse: { type: String, default: "Hech qanday dars tanlanmagan" },
  subscriptionPlan: { type: String, default: "Bepul" },
  subscriptionStart: { type: Date },
  subscriptionEnd: { type: Date }
});

const User = mongoose.model('User', userSchema);

// === REGISTER ===
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Barcha maydonlar to‘ldirilishi shart' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email yoki username band' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'Muvaffaqiyatli ro‘yxatdan o‘tildi', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// === LOGIN ===
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email topilmadi' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Parol noto‘g‘ri' });

    const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Kirish muvaffaqiyatli', token });
  } catch (err) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// === VERIFY TOKEN (frontend uchun) ===
app.post('/verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ valid: false });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ valid: false });
    res.json({ valid: true, user: decoded });
  });
});

// === PROFIL MA'LUMOTLARINI OLISH ===
app.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token kerak' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select('-password');
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

    res.json({
      name: user.name,
      email: user.email,
      selectedCourse: user.selectedCourse,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStart: user.subscriptionStart ? user.subscriptionStart.toISOString().split('T')[0] : null,
      subscriptionEnd: user.subscriptionEnd ? user.subscriptionEnd.toISOString().split('T')[0] : null
    });
  } catch (err) {
    res.status(401).json({ error: 'Token xato yoki muddati tugagan' });
  }
});

// === GEMINI AI ===
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post('/generate', async (req, res) => {
  const { prompt, token } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt bo'sh" });
  if (!token) return res.status(401).json({ error: "Token kerak" });

  try {
    // Tokenni tekshirish (ixtiyoriy, lekin tavsiya etiladi)
    jwt.verify(token, JWT_SECRET);

    const fullPrompt = `
    Siz til o‘rganish bo‘yicha yuqori malakali va do‘stona ustozsiz.
    Javobingiz faqat o‘zbek tilida bo‘lsin, inglizcha misollar bilan.
    Hech qachon o‘zingizni AI deb tanitmang. Faqat "Ustoz" sifatida gapiring.
    Agar til o‘rganishdan boshqa savol bo‘lsa: "Kechirasiz, men faqat til o‘rganishda yordam bera olaman 😊" deb javob bering.

    Foydalanuvchi savoli: "${prompt}"
    `;

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    res.json({ response: text });
  } catch (err) {
    console.error("Gemini xatosi:", err);
    res.status(500).json({ error: "AI javob bera olmadi" });
  }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} da ishga tushdi`);
});