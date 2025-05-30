import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonGrid from './PokemonGrid';
import '../App.css';
import useDebounce from '../hooks/useDebounce';

// creo il componente che mostra la lista dei pokémon
function PokemonList() {
  const [allPokemonNames, setAllPokemonNames] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [pokemonDetails, setPokemonDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();

  // debounce handler
  const debouncedSetSearch = useDebounce((value) => {
    setDebouncedSearch(value);
  }, 800, { trailing: true });

  // scarico tutti i pokémon una sola volta
  useEffect(() => {
    const fetchAllPokemonNames = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300');
        const data = await res.json();
        setAllPokemonNames(data.results.map(p => p.name));
      } catch (err) {
        setSearchError('Errore nel caricamento dei nomi Pokémon');
      }
    };
    fetchAllPokemonNames();
  }, []);

  // effettuo la ricerca solo tramite API e anche su corrispondenze parziali
  useEffect(() => {
    if (debouncedSearch.trim() === '') {
      setSearchResults([]);
      setSearchError('');
      return;
    }
    setLoading(true);
    setSearchError('');
    // filtro i nomi che contengono la stringa inserita
    const filteredNames = allPokemonNames.filter(name =>
      name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
    if (filteredNames.length === 0) {
      setSearchResults([]);
      setSearchError('Nessun Pokémon trovato');
      setLoading(false);
      return;
    }
    // Sscarico i dettagli dei Pokémon trovati
    Promise.all(
      // prendo solo 10 risultati per evitare troppi richieste
      filteredNames.slice(0, 10).map(async name => {
        if (pokemonDetails[name]) return pokemonDetails[name];
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        return await res.json();
      })
    ).then(detailsArr => {
      // aggiorno cache dettagli
      const detailsObj = {};
      detailsArr.forEach(d => {
        if (d && d.name) detailsObj[d.name] = d;
      });
      setPokemonDetails(prev => ({ ...prev, ...detailsObj }));
      setSearchResults(detailsArr.filter(d => d && d.name));
      setLoading(false);
    }).catch(() => {
      setSearchError('Errore nella ricerca');
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, allPokemonNames]);

  return (
    <div className="">
      <header className="App-header">
        {/* qui mostro il form per filtrare i pokémon */}
        <form className="search-form" onSubmit={e => e.preventDefault()}>
          <input
            type="text"
            placeholder="cerca pokémon per nome"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              debouncedSetSearch(e.target.value);
            }}
            style={{ padding: '8px', fontSize: '16px' }}
          />
        </form>
        {searchError && (
          <div style={{ color: 'yellow', marginBottom: 10 }}>{searchError}</div>
        )}
        {/* qui uso il nuovo componente per mostrare la griglia dei pokémon */}
        <PokemonGrid
          pokemonList={search.trim() === '' ? [] : searchResults.map(d => ({ name: d.name, url: `https://pokeapi.co/api/v2/pokemon/${d.name}` }))}
          pokemonDetails={pokemonDetails}
          onPokemonClick={name => navigate(`/pokemon/${name}`)}
        />
        {loading && <div style={{ color: 'white', marginTop: 10 }}>Caricamento...</div>}
      </header>
    </div>
  );
}

export default PokemonList;
