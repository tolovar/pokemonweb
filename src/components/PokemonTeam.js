import React, { useState } from 'react';

const MAX_TEAM_SIZE = 6;

function PokemonTeam() {
  // quui devo inserire la logica che verifica se l'utente è loggato
  // e mostrare il messaggio di errore se non lo è
  const [team, setTeam] = useState([]);
  const [pokemonName, setPokemonName] = useState('');
  const [ability, setAbility] = useState('');

  const handleAddPokemon = () => {
    if (team.length >= MAX_TEAM_SIZE || !pokemonName || !ability) return;
    setTeam([...team, { name: pokemonName, ability }]);
    setPokemonName('');
    setAbility('');
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0002' }}>
      <h2>La tua squadra Pokémon</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Nome Pokémon"
          value={pokemonName}
          onChange={e => setPokemonName(e.target.value)}
          style={{ marginRight: 8, padding: 6 }}
        />
        <input
          type="text"
          placeholder="Abilità"
          value={ability}
          onChange={e => setAbility(e.target.value)}
          style={{ marginRight: 8, padding: 6 }}
        />
        <button onClick={handleAddPokemon} disabled={team.length >= MAX_TEAM_SIZE}>
          Aggiungi
        </button>
      </div>
      <ul>
        {team.map((p, idx) => (
          <li key={idx} style={{ marginBottom: 8 }}>
            <strong>{p.name}</strong> — Abilità: {p.ability}
          </li>
        ))}
      </ul>
      {team.length === MAX_TEAM_SIZE && (
        <div style={{ color: '#3b4cca', fontWeight: 'bold' }}>Hai raggiunto il massimo di 6 Pokémon!</div>
      )}
    </div>
  );
}

export default PokemonTeam;