import { capitalize } from '../helpers/text'; 
import { typeColorClass } from '../utils/typeColorClass';

// creo il componente che mostra la griglia dei pokémon
function PokemonGrid({ pokemonList, pokemonDetails, onPokemonClick }) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6 bg-white/60 rounded-2xl shadow-xl max-w-4xl mx-auto my-8">
      {pokemonList.map(pokemon => (
        <li
          key={pokemon.id}
          className={`flex flex-col items-center bg-white/80 rounded-xl p-4 shadow-md border-4 border-transparent hover:border-yellow-400 transition`}
        >
          <img src={pokemon.sprite} alt={pokemon.name} className="w-20 h-20 drop-shadow-lg" />
          <span className="mt-2 font-semibold text-lg text-gray-800">{pokemon.name}</span>
          <span className={`mt-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${typeColorClass(pokemon.type)}`}>
            {pokemon.type}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default PokemonGrid;

