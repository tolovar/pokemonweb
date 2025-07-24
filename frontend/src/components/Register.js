import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from './common/Input';
import Loader from './common/Loader';
import { toast } from 'react-hot-toast';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // setto i campi del form come vuoti per pulirli quando ricarico la pagina
  useEffect(() => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRepeatPassword('');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !repeatPassword) {
      toast.error('Compila tutti i campi');
      return;
    }
    if (password !== repeatPassword) {
      toast.error('Le password non coincidono');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      setLoading(false);
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Errore durante la registrazione');
        throw new Error(data.error || 'Errore durante la registrazione');
      }
      toast.success('Registrazione avvenuta!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  return (
    <div>
      <form className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6 border-4 border-yellow-400" onSubmit={handleRegister}>
        <h2 className="text-2xl font-bold text-center text-yellow-500">Registrati</h2>
        <label htmlFor="username" className="sr-only">Nome utente</label>
        <Input
          id="username"
          type="text"
          placeholder="Nome utente"
          value={username}
          onChange={e => setUsername(e.target.value)}
          name="username"
        />
        <label htmlFor="email" className="sr-only">Email</label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          name="email"
        />
        <label htmlFor="password" className="sr-only">Password</label>
        <Input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          name="password"
        />
        <label htmlFor="repeatPassword" className="sr-only">Ripeti password</label>
        <Input
          id="repeatPassword"
          type="password"
          placeholder="Ripeti password"
          value={repeatPassword}
          onChange={e => setRepeatPassword(e.target.value)}
          name="repeatPassword"
        />
        <button
          className="w-full bg-yellow-400 text-blue-900 py-2 rounded-lg font-bold hover:bg-blue-700 hover:text-yellow-200 transition"
          type="submit"
        >
          Registrati
        </button>
        {loading && <Loader />}
        <div className="flex justify-between text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">Hai già un account?</Link>
          <Link to="/" className="text-blue-600 hover:underline">Torna alla home</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
