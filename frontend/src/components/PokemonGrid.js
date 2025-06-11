import React from 'react';
import Loader from './common/Loader';
import PokemonCard from './PokemonCard';

// creo il componente che mostra la griglia dei pokémon
function PokemonGrid({ pokemonList, loading, onPokemonClick }) {
  return (
    <>
      {loading && <Loader />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {pokemonList.map(p => (
          <PokemonCard
            key={p.id || p.name}
            pokemon={p}
            onClick={() => onPokemonClick(p.name)}
          />
        ))}
      </div>
    </>
  );
}

export default PokemonGrid;