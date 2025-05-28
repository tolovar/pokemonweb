import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pokedexGif from '../assets/pokedex.gif';
import kantoMap from '../assets/Kanto_Map.png';
import '../App.css';


function Home() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/pokemon');
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
            '&:hover': {
              transform: 'scale(1.05)'
            },
          border: 'none',
          cursor: 'pointer',
          padding: 0
        }}
      >
        <img src={pokedexGif} alt="Pokédex" style={{ width: '260px' }} />
      </button>
    </div>
  );
}

export default Home;

