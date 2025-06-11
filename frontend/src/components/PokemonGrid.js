import React from 'react';
import Loader from './common/Loader';
import PokemonCard from './PokemonCard';

// creo il componente che mostra la griglia dei pokémon
function PokemonGrid({ pokemonList, loading }) {
  return (
    <>
      {loading && <Loader />}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {pokemonList.map(p => (
          <PokemonCard key={p.id || p.name} pokemon={p} />
        ))}
      </div>
    </>
  );
}

export default PokemonGrid;