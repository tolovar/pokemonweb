import { capitalize } from '../helpers/text'; 

// creo il componente che mostra la griglia dei pokémon
function PokemonGrid({ pokemonList, pokemonDetails, onPokemonClick }) {
  return (
    <ul className="pokemon-grid">
      {pokemonList.map(pokemon => (
        <li
          key={pokemon.name}
          className="pokemon-grid-item"
          // aggiungo un data-type per il colore di sfondo
          // in modo da poterlo usare in CSS
          data-type={pokemonDetails[pokemon.name]?.types?.[0]?.type?.name || ''}
        >
          <div
            className="pokemon-card"
            onClick={() => onPokemonClick(pokemon.name)}
          >
            <button
              className="pokemon-sprite-btn"
              onClick={() => onPokemonClick(pokemon.name)}
              aria-label={`dettagli di ${pokemon.name}`}
            >
              {pokemonDetails[pokemon.name] ? (
                <img
                  src={pokemonDetails[pokemon.name].sprites.front_default}
                  alt={pokemon.name}
                  className="pokemon-sprite"
                />
              ) : (
                <div className="pokemon-sprite-placeholder" />
              )}
            </button>
            <div className="pokemon-name">{capitalize(pokemon.name)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default PokemonGrid;

