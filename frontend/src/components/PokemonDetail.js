import React, { useState, useEffect, useContext } from 'react';
import { capitalize } from '../helpers/text'; 
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api'; // uso apiFetch per includere il token

// creo il componente che mostra i dettagli di un pokémon
function PokemonDetail({ name }) {
  const [details, setDetails] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);
  const [addSuccess, setAddSuccess] = useState(null);

  // quando il componente viene montato o il nome cambia, scarico i dettagli del pokémon
  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then(res => res.json())
      .then(setDetails);
  }, [name]);

  if (!details) return <div>Caricamento</div>;
  if (details.error) return <div>Pokémon non trovato</div>;

  // conversioni
  const pesoKg = (details.weight / 10).toFixed(1); // da libre a chilogrammi
  const altezzaM = (details.height / 10).toFixed(2); // da decimetri a metri
  const nome = capitalize(details.name);

  // aggiungo il pokémon alla squadra dell'utente autenticato
  const handleAddToTeam = async () => {
    try {
      await apiFetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setAddSuccess('Pokémon aggiunto alla tua squadra!');
    } catch (error) {
      setAddSuccess('Errore durante l\'aggiunta del Pokémon');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{
          textTransform: 'capitalize',
          marginBottom: 24
        }}>{nome}</h1>
        <img src={details.sprites.front_default} alt={details.name} style={{ width: 120, height: 120, marginBottom: 16 }} />
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 16,
          padding: 24,
          display: 'inline-block',
          marginBottom: 24,
          boxShadow: '0 2px 12px #3b4cca22'
        }}>
          <p><strong>Altezza:</strong> {altezzaM} m</p>
          <p><strong>Peso:</strong> {pesoKg} kg</p>
          <p>
            <strong>Tipi:</strong> {details.types.map(t => capitalize(t.type.name)).join(', ')}
          </p>
          <p>
            <strong>Abilità:</strong> {details.abilities.map(a => capitalize(a.ability.name)).join(', ')}
          </p>
          <p>
            <strong>Mosse principali:</strong> {details.moves.slice(0, 4).map(m => capitalize(m.move.name)).join(', ')}
            {details.moves.length > 4 ? '...' : ''}
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={handleAddToTeam}
            style={{
              display: 'block',
              margin: '0 auto 24px auto',
              padding: '12px 32px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #ffcb05 60%, #3b4cca 100%)',
              color: '#3b4cca',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #3b4cca33',
              transition: 'background 0.2s'
            }}
          >
            Aggiungi alla squadra
          </button>
        )}
        {addSuccess && (
          <div style={{
            color: addSuccess.startsWith('Errore') ? '#e74c3c' : '#388e3c',
            marginBottom: 12,
            fontWeight: 600
          }}>
            {addSuccess}
          </div>
        )}
        <a href="/pokemon" style={{ color: '#61dafb', fontWeight: 600 }}>Torna alla lista</a>
      </header>
    </div>
  );
}

export default PokemonDetail;