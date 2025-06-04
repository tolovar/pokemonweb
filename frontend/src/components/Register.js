import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // setto i campi del form come vuoti per pulirli quando ricarico la pagina
  useEffect(() => {
    setUsername('');
    setEmail('');
    setPassword('');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password) {
      setError('Tutti i campi sono obbligatori');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Errore nella registrazione');
      }
      alert('Registrazione avvenuta con successo!');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: '60px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0002' }}>
      <h2 style={{ textAlign: 'center' }}>Registrati</h2>
      {error && <div className="custom-error">{error}</div>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome utente"
          value={username}
          required
          onChange={e => setUsername(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <button type="submit" style={{ width: '100%', padding: 10, marginBottom: 8 }}>Registrati</button>
        <div style={{ textAlign: 'right' }}>
          <a href="/" style={{ color: '#3b4cca', textDecoration: 'underline', fontSize: 14 }}>Torna al login</a>
        </div>
      </form>
    </div>
  );
}

export default Register;
