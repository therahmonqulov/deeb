const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Yangi: JWT import
require('dotenv').config();

const app = express();
const PORT = 3000;
const JWT_SECRET = 'sizingizning_maxfiy_kalitingiz_o_zgartiring'; // Yangi: Secret kalit (xavfsiz qiling!)

app.use(cors());
app.use(bodyParser.json());

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

app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlamoqda`));