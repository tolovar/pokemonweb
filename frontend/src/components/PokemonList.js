import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonGrid from './PokemonGrid';
import '../App.css';

// creo il componente che mostra la lista dei pokémon
function PokemonList() {
  // imposto il numero di pokémon per pagina
  const PAGE_SIZE = 18;
  const [pokemonList, setPokemonList] = useState([]);
  const [search, setSearch] = useState('');
  // uso la porta 5000 per il server locale (è quella default di flask)
  const [nextUrl, setNextUrl] = useState(`http://localhost:5000/api/pokemon?limit=${PAGE_SIZE}`);
  const [loading, setLoading] = useState(false);
  const [pokemonDetails, setPokemonDetails] = useState({});
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const navigate = useNavigate();

  // quando chiamo questa funzione, scarico una pagina di pokémon e i loro dettagli per mostrare lo sprite
  const fetchPokemonPage = async () => {
    if (!nextUrl) return;
    setLoading(true);
    try {
      const response = await fetch(nextUrl);
      const data = await response.json();
      setPokemonList(prev => {
        // aggiungo solo i pokémon che non sono già presenti
        const existingNames = new Set(prev.map(p => p.name));
        console.log(data);
        const newPokemon = data.results.filter(p => !existingNames.has(p.name));
        return [...prev, ...newPokemon];
      });
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
  }, []);

  // nuova funzione per la ricerca 
  // ora dovrebbe cercare tra i pokémon già caricati 
  // e se non trova nulla lì, cercare tramite API
  useEffect(() => {
    if (search.trim() === '') {
      setSearchResult(null);
      setSearchError('');
      return;
    }
    // cerca tra quelli già caricati
    const found = pokemonList.find(p => p.name.toLowerCase() === search.toLowerCase());
    if (found) {
      setSearchResult(null);
      setSearchError('');
      return;
    }
    // cerca tramite API
    const fetchSearchedPokemon = async () => {
      setSearchError('');
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${search.toLowerCase()}`);
        if (!res.ok) {
          setSearchResult(null);
          setSearchError('Pokémon non trovato');
          return;
        }
        const details = await res.json();
        setPokemonDetails(prev => ({
          ...prev,
          [details.name]: details
        }));
        // imposta il risultato solo dopo aver scaricato i dettagli
        setSearchResult({
          name: details.name,
          url: `https://pokeapi.co/api/v2/pokemon/${details.name}`
        });
      } catch (err) {
        setSearchResult(null);
        setSearchError('Pokémon non trovato');
      }
    };
    fetchSearchedPokemon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // filtro i pokémon già caricati in base al testo inserito dall'utente
  const filteredPokemon = searchResult
    ? [searchResult]
    : searchError
      ? []
      : search.trim() === ''
      ? pokemonList
    : pokemonList.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <div className="">
      <header className="App-header">
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
        {searchError && (
          <div style={{ color: 'yellow', marginBottom: 10 }}>{searchError}</div>
        )}
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
            {loading ? 'caricamento' : 'carica altri'}
          </button>
        )}
      </header>
    </div>
  );
}

export default PokemonList;
