import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { typeColorClass } from '../utils/typeColorClass';
import Loader from './common/Loader';
import Input from './common/Input';
import { toast } from 'react-hot-toast';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setError('');
    setSuccess('');
    if (!username || !email || !password || !repeatPassword) {
      setError('Compila tutti i campi');
      return;
    }
    if (password !== repeatPassword) {
      setError('Le password non coincidono');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      setLoading(false);
      if (!res.ok) {
        const data = await res.json();
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
    <div className="flex items-center justify-center min-h-[70vh]">
      <form className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6 border-4 border-yellow-400" onSubmit={handleRegister}>
        <h2 className="text-2xl font-bold text-center text-yellow-500">Registrati</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}
        {success && <div className="text-green-600 text-center">{success}</div>}
        <Input
          type="text"
          placeholder="Nome utente"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Ripeti password"
          value={repeatPassword}
          onChange={e => setRepeatPassword(e.target.value)}
        />
        <button
          className="w-full bg-yellow-400 text-blue-900 py-2 rounded-lg font-bold hover:bg-blue-700 hover:text-yellow-200 transition"
          type="submit"
        >
          Registrati
        </button>
        {loading && <Loader />}
        <div className="flex justify-between text-sm">
          <a href="/login" className="text-blue-600 hover:underline">Hai già un account?</a>
          <a href="/" className="text-blue-600 hover:underline">Torna alla home</a>
        </div>
      </form>
    </div>
  );
}

export default Register;
