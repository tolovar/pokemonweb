// carico le variabili dal file .env
require('dotenv').config(); 

const http = require('http');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// definisco le chiavi per la firma dei token jwt e dei refresh token
const SECRET = process.env.JWT_SECRET || 'supersecret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsupersecret';

// configurazione del pool di connessioni per PostgreSQL
// lasciato così è rischioso: 
// inserire credenziali d'accesso come parte del codice può causare accessi non autorizzati.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

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

// funzione per verificare la validità di una coppia di api key (public/private) negli header della richiesta
async function checkApiKey(req) {
  const publicKey = req.headers['x-api-public'];
  const privateKey = req.headers['x-api-private'];
  const result = await pool.query(
    'SELECT * FROM api_keys WHERE public_key = $1 AND private_key = $2',
    [publicKey, privateKey]
  );
  return result.rows[0];
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
    try {
      const check = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );
      if (check.rows.length > 0) {
        return send(res, 400, { message: 'Utente già esistente' });
      }
      await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
        [username, email, password]
      );
      return send(res, 200, { message: 'Registrazione avvenuta' });
    } catch (err) {
      return send(res, 500, { message: 'Errore database' });
    }
  }

  // endpoint per il login: verifico le credenziali e restituisco jwt e refresh token
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    const { username, password } = await parseBody(req);
    try {
      // cerco l'utente per username o email e password
      const userResult = await pool.query(
        'SELECT * FROM users WHERE (username = $1 OR email = $1) AND password = $2',
        [username, password]
      );
      if (userResult.rows.length === 0) {
        return send(res, 401, { message: 'Credenziali non valide' });
      }
      const user = userResult.rows[0];
      // genero token jwt e refresh token
      const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ username: user.username }, REFRESH_SECRET, { expiresIn: '7d' });
      // salvo il refresh token nel database
      await pool.query(
        'INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)',
        [refreshToken, user.id]
      );
      return send(res, 200, { token, refreshToken });
    } catch (err) {
      return send(res, 500, { message: 'Errore database' });
    }
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
    if (!refreshToken) {
      return send(res, 403, { message: 'Refresh token non valido' });
    }
    try {
      // controllo che il refresh token sia presente nel database
      const result = await pool.query(
        'SELECT * FROM refresh_tokens WHERE token = $1',
        [refreshToken]
      );
      if (result.rows.length === 0) {
        return send(res, 403, { message: 'Refresh token non valido' });
      }
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
      const token = jwt.sign({ username: decoded.username }, SECRET, { expiresIn: '15m' });
      return send(res, 200, { token });
    } catch {
      return send(res, 403, { message: 'Refresh token scaduto' });
    }
  }

  // endpoint per il recupero password (mock: non invia realmente email)
  if (req.url === '/api/auth/recover' && req.method === 'POST') {
    const { email } = await parseBody(req);
    try {
      const userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      if (userResult.rows.length === 0) {
        return send(res, 404, { message: 'Email non trovata' });
      }
      // qui dovresti inviare una mail reale
      return send(res, 200, { message: 'Email di recupero inviata' });
    } catch (err) {
      return send(res, 500, { message: 'Errore database' });
    }
  }

  // endpoint per generare una nuova coppia di api key pubblica/privata
  if (req.url === '/api/auth/generate-api-key' && req.method === 'POST') {
    const { owner } = await parseBody(req);
    const publicKey = Math.random().toString(36).substring(2, 15);
    const privateKey = Math.random().toString(36).substring(2, 15);
    try {
      await pool.query(
        'INSERT INTO api_keys (public_key, private_key, owner) VALUES ($1, $2, $3)',
        [publicKey, privateKey, owner]
      );
      return send(res, 200, { publicKey, privateKey });
    } catch (err) {
      return send(res, 500, { message: 'Errore database' });
    }
  }

  // endpoint protetto che richiede api key valide
  if (req.url === '/api/protected/data' && req.method === 'GET') {
    const key = await checkApiKey(req);
    if (!key) return send(res, 401, { message: 'API key non valida' });
    return send(res, 200, { message: `Accesso consentito a ${key.owner}` });
  }

  // se nessun endpoint corrisponde
  send(res, 404, { message: 'Not found' });
});

// avvia il server sulla porta 5000 e stampa un messaggio in console
server.listen(5000, () => console.log('Backend Node.js avviato su http://localhost:5000'));