require('dotenv').config(); // .env ni yuklash
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Yangi: JWT import
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios'); // npm install axios qiling

// Proxy endpoint: /api/proxy-config
app.get('/api/proxy-config', async (req, res) => {
  try {
    const response = await axios.get('https://cdn.digitalcaramel.com/configs/deeb.uz.json');
    res.json(response.data); // JSON ni qaytaring
  } catch (error) {
    console.error('Proxy xatosi:', error.message);
    res.status(404).json({ error: 'Fayl topilmadi' });
  }
});

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
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Tez va samarali model

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
            - Javoblaringiz har doim aniq, qisqa, tushunarli va o‘quvchi darajasiga mos bo‘lsin.
            - Grammatikani tushuntirayotganda soddalashtirilgan izohlar va misollar bering.
            - Tarjimalar va tushuntirishlar O‘zbek tilida bo‘lsin, lekin kerakli joyda original til (masalan, inglizcha) matnni ham ko‘rsating.
            - Agar foydalanuvchi sizdan til o‘rganishdan tashqari boshqa mavzuda (masalan, siyosat, texnologiya, shaxsiy maslahatlar, kod yozish va hokazo) yordam so‘rasa, muloyimlik bilan rad eting va shunday javob bering:
            "Kechirasiz 😊 Men faqat til o‘rganish bo‘yicha yordam bera olaman. Keling, til mashqini davom ettiramiz."
            - Har bir javobingiz ustoz sifatida iliq, rag‘batlantiruvchi va professional ohangda bo‘lsin.

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