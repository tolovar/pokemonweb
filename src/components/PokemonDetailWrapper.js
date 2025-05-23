import { useParams } from 'react-router-dom';
import PokemonDetail from './PokemonDetail';

// creo un wrapper per usare i parametri del router
function PokemonDetailWrapper() {
  const { name } = useParams();
  return <PokemonDetail name={name} />;
}

export default PokemonDetailWrapper;