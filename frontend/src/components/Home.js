import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import { AuthContext } from '../context/AuthContext'; // importo il context per sapere se l'utente è autenticato
import { typeColorClass } from '../utils/typeColorClass';
import Loader from './common/Loader';

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // recupero lo stato di autenticazione
  const { isAuthenticated } = useContext(AuthContext); 

  const handleClick = () => {
    navigate('/pokemon');
  };

  // funzione per andare alla pagina della squadra
  const handleTeam = () => {
    navigate('/pokemon-team');
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(/assets/Kanto_Map.png)` }}
    >
      {/* titolo e pokedex */}
      <div className="bg-white/80 rounded-xl shadow-xl p-8 max-w-lg mx-auto mt-20">
        {/* messaggio di benvenuto */}
        <h1 className="font-[Luckiest_Guy,cursive] text-4xl text-yellow-500 drop-shadow-lg mb-6">
          Benvenuto, allenatore!
        </h1>
        <button
          onClick={handleClick}
          className="rounded-full shadow-lg hover:scale-105 transition-transform bg-gradient-to-r from-yellow-400 to-red-400 p-2"
        >
          <img src="/assets/pokedex.gif" alt="Pokédex" className="w-48" loading="lazy" />
        </button>
        {/* mostro il bottone della squadra se autenticato, altrimenti il login */}
        {isAuthenticated ? (
          <button
            onClick={handleTeam}
            style={{
              marginTop: '30px',
              padding: '12px 32px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              background: '#ffcb05',
              color: '#3b4cca',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px #0002'
            }}
          >
            La mia squadra
          </button>
        ) : (
          <Link
            to="/login"
            style={{
              marginTop: '30px',
              padding: '12px 32px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              background: '#3b4cca',
              color: '#ffcb05',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px #0002',
              display: 'inline-block',
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            Login
          </Link>
        )}
        {loading && <Loader />}
      </div>
    </div>
  );
}

export default Home;

