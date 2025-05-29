const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const SECRET = 'supersegreto';
const REFRESH_SECRET = 'refreshsupersegreto';
const users = []; // Sostituisci con un database reale
const refreshTokens = [];

app.use(cors());
app.use(bodyParser.json());

// registrazione utente
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (users.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({ message: 'Utente già esistente' });
  }
  users.push({ username, email, password });
  res.json({ message: 'Registrazione avvenuta' });
});

// login utente
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
  if (!user) return res.status(401).json({ message: 'Credenziali non valide' });
  const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ username: user.username }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.push(refreshToken);
  res.json({ token, refreshToken });
});

// token di verifica
app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
});

// refresh token
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token non valido' });
  }
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const token = jwt.sign({ username: decoded.username }, SECRET, { expiresIn: '15m' });
    res.json({ token });
  } catch {
    res.status(403).json({ message: 'Refresh token scaduto' });
  }
});

// recupero password
app.post('/api/auth/recover', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'Email non trovata' });
  // qui devo implementare l'invio dell'email di recupero
  // per ora simulo l'invio con un log
  res.json({ message: 'Email di recupero inviata' });
});

app.listen(5000, () => console.log('Backend avviato su http://localhost:5000'));