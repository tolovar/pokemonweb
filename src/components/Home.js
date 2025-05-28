import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pokedexGif from '../assets/pokedex.gif';
import '../App.css';

function Home() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/pokemon');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Benvenuto, allenatore!</h1>
      <button
        onClick={handleClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0
        }}
      >
        <img src={pokedexGif} alt="Pokédex" style={{ width: '200px' }} />
      </button>
    </div>
  );
}



export default Home;

