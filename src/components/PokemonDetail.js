import { useEffect, useState } from 'react';

// creo il componente che mostra i dettagli di un pokémon
function PokemonDetail({ name }) {
  const [details, setDetails] = useState(null);

  // quando il componente viene montato o il nome cambia, scarico i dettagli del pokémon
  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then(res => res.json())
      .then(setDetails);
  }, [name]);

  if (!details) return <div>caricamento</div>;
  if (details.error) return <div>pokémon non trovato</div>;

  // qui mostro i dettagli del pokémon
  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ textTransform: 'capitalize' }}>{details.name}</h1>
        <img src={details.sprites.front_default} alt={details.name} style={{ width: 120, height: 120 }} />
        <p><strong>altezza:</strong> {details.height}</p>
        <p><strong>peso:</strong> {details.weight}</p>
        <p><strong>tipi:</strong> {details.types.map(t => t.type.name).join(', ')}</p>
        <p><strong>abilità:</strong> {details.abilities.map(a => a.ability.name).join(', ')}</p>
        <p>
          <strong>mosse principali:</strong> {details.moves.slice(0, 5).map(m => m.move.name).join(', ')}
          {details.moves.length > 5 ? '...' : ''}
        </p>
        <a href="/" style={{ color: '#61dafb' }}>torna alla lista</a>
      </header>
    </div>
  );
}

export default PokemonDetail;