import { useEffect, useState } from 'react';
import { capitalize } from '../helpers/text'; 

// creo il componente che mostra i dettagli di un pokémon
function PokemonDetail({ name }) {
  const [details, setDetails] = useState(null);

  // quando il componente viene montato o il nome cambia, scarico i dettagli del pokémon
  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then(res => res.json())
      .then(setDetails);
  }, [name]);

  if (!details) return <div>Caricamento...</div>;
  if (details.error) return <div>Pokémon non trovato</div>;

  // conversioni
  const pesoKg = (details.weight / 10).toFixed(1); // da hectogrammi a kg
  const altezzaM = (details.height / 10).toFixed(2); // da decimetri a metri
  const nome = capitalize(details.name);

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ textTransform: 'capitalize' }}>{nome}</h1>
        <img src={details.sprites.front_default} alt={details.name} style={{ width: 120, height: 120 }} />
        <p><strong>Altezza:</strong> {altezzaM} m</p>
        <p><strong>Peso:</strong> {pesoKg} kg</p>
        <p>
          <strong>Tipi:</strong> {details.types.map(t => capitalize(t.type.name)).join(', ')}
        </p>
        <p>
          <strong>Abilità:</strong> {details.abilities.map(a => capitalize(a.ability.name)).join(', ')}
        </p>
        <p>
          <strong>Mosse principali:</strong> {details.moves.slice(0, 5).map(m => capitalize(m.move.name)).join(', ')}
          {details.moves.length > 5 ? '...' : ''}
        </p>
        <a href="/" style={{ color: '#61dafb' }}>Torna alla lista</a>
      </header>
    </div>
  );
}

export default PokemonDetail;