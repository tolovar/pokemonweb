import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from './common/Input';
import Loader from './common/Loader';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Header from "./Header";

function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUsername('');
    setPassword('');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Inserisci utente e password');
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
        toast.error(data.message || 'Errore di autenticazione');
        throw new Error(data.message || 'Errore di autenticazione');
      }
      const data = await res.json();
      localStorage.setItem('token', data.access_token); 
      login({ id: username, name: username });
      // reindirizzo l'utente alla pagina personale
      toast.success('Login effettuato!');
      navigate('/pokemon-team');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center min-h-[70vh] pt-12">
        <form className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6 border-4 border-red-500" onSubmit={handleLogin}>
          <h2 className="text-2xl font-bold text-center text-red-600">Accedi</h2>
          <label htmlFor="username" className="sr-only">Username</label>
          <Input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            name="username"
          />
          <label htmlFor="password" className="sr-only">Password</label>
          <Input
            id="password"
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