import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonGrid from './PokemonGrid';
import logo from './logo.svg';
import './App.css';

// creo il componente che mostra la lista dei pokémon
function PokemonList() {
  const PAGE_SIZE = 50;
  const [pokemonList, setPokemonList] = useState([]);
  const [search, setSearch] = useState('');
  const [nextUrl, setNextUrl] = useState(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=0`);
  const [loading, setLoading] = useState(false);
  const [pokemonDetails, setPokemonDetails] = useState({});
  const navigate = useNavigate();

  // quando chiamo questa funzione, scarico una pagina di pokémon e i loro dettagli per mostrare lo sprite
  const fetchPokemonPage = async () => {
    if (!nextUrl) return;
    setLoading(true);
    try {
      const response = await fetch(nextUrl);
      const data = await response.json();
      setPokemonList(prev => [...prev, ...data.results]);
      setNextUrl(data.next);

      // per ogni nuovo pokémon, scarico i dettagli solo se non li ho già
      data.results.forEach(async (pokemon) => {
        if (!pokemonDetails[pokemon.name]) {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          setPokemonDetails(prev => ({
            ...prev,
            [pokemon.name]: details
          }));
        }
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // quando il componente viene montato, scarico la prima pagina di pokémon
  useEffect(() => {
    fetchPokemonPage();
    // eslint-disable-next-line
  }, []);

  // filtro i pokémon già caricati in base al testo inserito dall'utente
  const filteredPokemon = pokemonList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>pokémon</h1>
        {/* qui mostro il form per filtrare i pokémon */}
        <form onSubmit={e => e.preventDefault()}>
          <input
            type="text"
            placeholder="cerca pokémon per nome"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px', fontSize: '16px' }}
          />
        </form>
        {/* qui uso il nuovo componente per mostrare la griglia dei pokémon */}
        <PokemonGrid
          pokemonList={filteredPokemon}
          pokemonDetails={pokemonDetails}
          onPokemonClick={name => navigate(`/pokemon/${name}`)}
        />
        {/* qui mostro il bottone per caricare altri pokémon */}
        {nextUrl && (
          <button
            onClick={fetchPokemonPage}
            disabled={loading}
            style={{ marginTop: 16, padding: '8px 16px', fontSize: '16px' }}
          >
            {loading ? 'caricamento...' : 'carica altri'}
          </button>
        )}
      </header>
    </div>
  );
}

export default PokemonList;