import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";
import { typeColorClass } from '../utils/typeColorClass';
import Loader from './common/Loader';
import Input from './common/Input';
import Header from "./Header";

function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // setto i campi del form come vuoti per pulirli quando ricarico la pagina
  useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Inserisci utente e password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/login', {
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
      localStorage.setItem('token', data.access_token); 
      login({ id: username, name: username });
      // reindirizzo l'utente alla pagina personale 
      navigate('/pokemon-team');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      const res = await fetch('http://localhost:5000/api/recover', { // qui devo mettere l'url del backend
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
    <div>
      <Header />
      <div className="flex items-center justify-center min-h-[70vh] pt-12">
        <form className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6 border-4 border-red-500" onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold text-center text-red-600">Accedi</h2>
          {error && <div className="text-red-600 text-center">{error}</div>}
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            name="username"
          />
          <Input
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            name="password"
          />
          <button
            className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-yellow-400 hover:text-red-700 transition"
            type="submit"
          >
            {loading ? <Loader /> : 'Accedi'}
          </button>
          <div className="flex justify-between text-sm">
            <Link to="/recover" className="text-blue-600 hover:underline">Password dimenticata?</Link>
            <Link to="/register" className="text-blue-600 hover:underline">Registrati</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;