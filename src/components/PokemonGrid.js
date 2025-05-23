// creo il componente che mostra la griglia dei pokémon
function PokemonGrid({ pokemonList, pokemonDetails, onPokemonClick }) {
  return (
    <ul className="pokemon-grid">
      {pokemonList.map(pokemon => (
        <li key={pokemon.name} className="pokemon-grid-item">
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
          <div>{pokemon.name}</div>
        </li>
      ))}
    </ul>
  );
}

export default PokemonGrid;