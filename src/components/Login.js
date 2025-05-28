import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // qui va la logica di autenticazione
    // se il login ha successo:
    login({ id: username, name: username });
    navigate('/pokemon-team');
  };

  const handleRecovery = (e) => {
    e.preventDefault();
    // qui devo mettere la logica di recupero password
    
  };

  return (
    <div style={{ maxWidth: 350, margin: '60px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0002' }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      {!showRecovery ? (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Nome utente"
            value={username}
            required
            onChange={e => setUsername(e.target.value)}
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
          <button type="submit" style={{ width: '100%', padding: 10, marginBottom: 8 }}>Accedi</button>
          <div style={{ textAlign: 'right' }}>
            <button type="button" onClick={() => setShowRecovery(true)} style={{ background: 'none', border: 'none', color: '#3b4cca', cursor: 'pointer' }}>
              Password dimenticata?
            </button>
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