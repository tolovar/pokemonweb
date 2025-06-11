import { capitalize } from '../helpers/text'; 
import { typeColorClass } from '../utils/typeColorClass';
import Loader from '../common/Loader';
import PokemonCard from './PokemonCard';

// creo il componente che mostra la griglia dei pokémon
function PokemonGrid({ pokemonList, pokemonDetails, onPokemonClick, loading }) {
  return (
    <>
      {loading && <Loader />}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {pokemonList.map(p => <PokemonCard key={p.id} pokemon={p} />)}
      </div>
    </>
  );
}

export default PokemonGrid;