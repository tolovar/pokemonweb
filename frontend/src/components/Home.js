import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pokedexGif from '../assets/pokedex.gif';
import kantoMap from '../assets/Kanto_Map.png';
import '../App.css';
import { AuthContext } from '../context/AuthContext'; // importo il context per sapere se l'utente è autenticato
import { typeColorClass } from '../utils/typeColorClass';
import Loader from '../common/Loader';

function Home() {
  const navigate = useNavigate();
  // recupero lo stato di autenticazione
  const { isAuthenticated } = useContext(AuthContext); 

  const handleClick = () => {
    navigate('/pokemon');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // funzione per andare alla pagina della squadra
  const handleTeam = () => {
    navigate('/pokemon-team');
  };

  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '0px',
        minHeight: '100vh',
        backgroundImage: `url(${kantoMap})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <h1
        style={{
          fontFamily: "'Luckiest Guy', cursive",
          fontWeight: 'bold',
          fontSize: '3.5rem',
          marginBottom: '80px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          textShadow: '2px 2px 0 #3b4cca, 4px 4px 0 #3b4cca',
          color: '#ffcb05'
        }}
      >
        Benvenuto, allenatore!
      </h1>
      <button
        onClick={handleClick}
        style={{
          background: 'none',
          outline: 'none',
          borderRadius: '50%',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s',
          marginBottom: '20px',
          border: 'none',
          cursor: 'pointer',
          padding: 0
        }}
      >
        <img src={pokedexGif} alt="Pokédex" style={{ width: '260px' }} />
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
        <button
          onClick={handleLogin}
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
            boxShadow: '0 2px 6px #0002'
          }}
        >
          Login
        </button>
      )}
      {loading && <Loader />}
    </div>
  );
}

export default Home;

