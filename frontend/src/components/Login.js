import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext';

function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Inserisci utente e password');
      return;
    }
    try {
      const res = await fetch(''
        // qui devo mettere l'URL del backend
        , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      // validazione della risposta
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Errore di autenticazione');
      }
      const data = await res.json();
      // salvo il token JWT (es: localStorage)
      localStorage.setItem('token', data.token);
      login({ id: username, name: username }); 
      navigate('/pokemon-team');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setError('');
    if (!recoveryEmail || !/\S+@\S+\.\S+/.test(recoveryEmail)) {
      setError('Inserisci una email valida');
      return;
    }
    try {
      const res = await fetch(''
        // qui devo mettere l'URL del backend 
        , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Errore nel recupero password');
      }
      // qui devo implementare l'invio dell'email di recupero
      // per ora simulo l'invio con un alert
      alert('Email di recupero inviata!');
      setShowRecovery(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: '60px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0002' }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {!showRecovery ? (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email o nome utente"
            value={username}
            required
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              required
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: 8, paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#3b4cca'
              }}
              tabIndex={-1}
            >
              {showPassword ? 'Nascondi' : 'Mostra'}
            </button>
          </div>
          <button type="submit" style={{ width: '100%', padding: 10, marginBottom: 8 }}>Accedi</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={() => setShowRecovery(true)} style={{ background: 'none', border: 'none', color: '#3b4cca', cursor: 'pointer', padding: 0 }}>
              Password dimenticata?
            </button>
            <a href="/register" style={{ color: '#3b4cca', textDecoration: 'underline', fontSize: 14 }}>Registrati</a>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRecovery}>
          <input
            type="email"
            placeholder="Inserisci la tua email"
            value={recoveryEmail}
            required
            onChange={e => setRecoveryEmail(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
          <button type="submit" style={{ width: '100%', padding: 10, marginBottom: 8 }}>Recupera password</button>
          <div style={{ textAlign: 'right' }}>
            <button type="button" onClick={() => setShowRecovery(false)} style={{ background: 'none', border: 'none', color: '#3b4cca', cursor: 'pointer' }}>
              Torna al login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Login;