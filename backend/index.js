const http = require('http');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// definisco le chiavi per la firma dei token jwt e dei refresh token
const SECRET = 'supersecret';
const REFRESH_SECRET = 'refreshsupersecret';

// array in memoria per memorizzare utenti, refresh token e api key 
// temporanei, da sostituire con un database PostgreSQL
const users = [];
const refreshTokens = [];
const apiKeys = [
  { public: 'publicKey123', private: 'privateKeyABC', owner: 'utente1' }
];

// funzione asincrona per leggere e parsare la richiesta http
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

// funzione per inviare una risposta http con status e dati json
function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

// funzione per verificare la validità di una coppia di api key (public/private) 
// negli header della richiesta
function checkApiKey(req) {
  const publicKey = req.headers['x-api-public'];
  const privateKey = req.headers['x-api-private'];
  return apiKeys.find(k => k.public === publicKey && k.private === privateKey);
}

// creo il server http
const server = http.createServer(async (req, res) => {
  // gestisco la preflight request per il cors
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,x-api-public,x-api-private'
    });
    return res.end();
  }

  // endpoint per la registrazione di un nuovo utente
  if (req.url === '/api/auth/register' && req.method === 'POST') {
    const { username, email, password } = await parseBody(req);
    // controllo se esiste già un utente con lo stesso username o email
  if (users.find(u => u.username === username || u.email === email)) {
      return send(res, 400, { message: 'Utente già esistente' });
  }
    // aggiungo il nuovo utente all'array users
  users.push({ username, email, password });
    return send(res, 200, { message: 'Registrazione avvenuta' });
  }

  // endpoint per il login: verifico le credenziali e restituisce jwt e refresh token
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    const { username, password } = await parseBody(req);
    // cerco l'utente per username o email e password
  const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
    if (!user) return send(res, 401, { message: 'Credenziali non valide' });
    // genero token jwt e refresh token
  const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ username: user.username }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.push(refreshToken);
    return send(res, 200, { token, refreshToken });
  }

  // endpoint per verificare la validità di un token jwt
  if (req.url === '/api/auth/verify' && req.method === 'POST') {
    const { token } = await parseBody(req);
  try {
    const decoded = jwt.verify(token, SECRET);
      return send(res, 200, { valid: true, user: decoded });
  } catch {
      return send(res, 401, { valid: false });
  }
  }

  // endpoint per ottenere un nuovo token jwt tramite refresh token
  if (req.url === '/api/auth/refresh' && req.method === 'POST') {
    const { refreshToken } = await parseBody(req);
    // controllo che il refresh token sia valido e presente
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
      return send(res, 403, { message: 'Refresh token non valido' });
  }
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const token = jwt.sign({ username: decoded.username }, SECRET, { expiresIn: '15m' });
      return send(res, 200, { token });
  } catch {
      return send(res, 403, { message: 'Refresh token scaduto' });
  }
  }

  // endpoint per il recupero password (non invia realmente email)
  if (req.url === '/api/auth/recover' && req.method === 'POST') {
    const { email } = await parseBody(req);
  const user = users.find(u => u.email === email);
    if (!user) return send(res, 404, { message: 'Email non trovata' });
    // qui devo implementare la logica per inviare una mail di recupero
    // per ora simulo l'invio con un messaggio 
    return send(res, 200, { message: 'Email di recupero inviata' });
  }

  // endpoint per generare una nuova coppia di api key pubblica/privata
  if (req.url === '/api/auth/generate-api-key' && req.method === 'POST') {
    const { owner } = await parseBody(req);
    const publicKey = Math.random().toString(36).substring(2, 15);
    const privateKey = Math.random().toString(36).substring(2, 15);
    apiKeys.push({ public: publicKey, private: privateKey, owner });
    return send(res, 200, { publicKey, privateKey });
  }

  // endpoint protetto che richiede api key valide 
  if (req.url === '/api/protected/data' && req.method === 'GET') {
    const key = checkApiKey(req);
    if (!key) return send(res, 401, { message: 'API key non valida' });
    return send(res, 200, { message: `Accesso consentito a ${key.owner}` });
  }

  // se nessun endpoint corrisponde
  send(res, 404, { message: 'Not found' });
});

// avvia il server sulla porta 5000 e stampa un messaggio in console
server.listen(5000, () => console.log('Backend Node.js avviato su http://localhost:5000'));

// configurazione del pool di connessioni per PostgreSQL
const pool = new Pool({
  // inserisco come valori le mie credenziali 
  user: 'ales',        
  host: 'localhost',
  database: 'pokemonweb',   
  password: 'supersecretpassword',  
  port: 5432,
});