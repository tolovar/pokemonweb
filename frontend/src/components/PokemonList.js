import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonGrid from './PokemonGrid';
import '../App.css';
import useDebounce from '../hooks/useDebounce';
import { typeColorClass } from '../utils/typeColorClass';
import Loader from './common/Loader';
import toast from 'react-hot-toast';
import Input from './common/Input';
import Header from './Header';

const PAGE_SIZE = 18;

function PokemonList() {
  const [allPokemonNames, setAllPokemonNames] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [pokemonDetails, setPokemonDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // debounce handler
  const debouncedSetSearch = useDebounce((value) => {
    setDebouncedSearch(value);
  }, 800, { trailing: true });

  // scarico tutti i nomi dei Pokémon una sola volta
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

  // effettuo la ricerca solo tramite API e solo su corrispondenze parziali
  useEffect(() => {
    // cerco solo quando debouncedSearch cambia
    if (debouncedSearch.trim() === '') {
      setSearchResults([]);
      setSearchError('');
      // resetto la pagina quando la barra di ricerca è vuota
      setPage(1); 
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
    // scarico i dettagli dei Pokémon trovati 
    Promise.all(
      // prendo solo 10 risultati alla volta per evitare troppe richieste
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
  }, [debouncedSearch, allPokemonNames]);

  // quando la barra è vuota, carico la lista di pokémon
  useEffect(() => {
    if (search.trim() !== '' || allPokemonNames.length === 0) return;
    setLoading(true);
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageNames = allPokemonNames.slice(start, end);

    Promise.all(
      pageNames.map(async name => {
        if (pokemonDetails[name]) return pokemonDetails[name];
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        return await res.json();
      })
    ).then(detailsArr => {
      const detailsObj = {};
      detailsArr.forEach(d => {
        if (d && d.name) detailsObj[d.name] = d;
      });
      setPokemonDetails(prev => ({ ...prev, ...detailsObj }));
      setLoading(false);
    }).catch(() => {
      setSearchError('Errore nel caricamento della pagina');
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, allPokemonNames]);

  // pokémon da mostrare
  const pokemonToShow = search.trim() === ''
    ? allPokemonNames.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(name => {
        const details = pokemonDetails[name];
        return {
          name,
          id: details?.id,
          // solo il primo tipo altrimenti non funziona l'hovering
          type: details?.types?.[0]?.type?.name || '', 
          sprite: details?.sprites?.front_default ||
                  `https://img.pokemondb.net/sprites/home/normal/${name.toLowerCase()}.png`,
          types: details?.types?.map(t => t.type.name).join(' / ') || ''
        };
      })
    : searchResults.map(d => ({
        name: d.name,
        // solo il primo tipo anche nei risultati ricerca
        type: d.types?.[0]?.type?.name || '', 
        sprite: d.sprites?.front_default ||
                `https://img.pokemondb.net/sprites/home/normal/${d.name.toLowerCase()}.png`,
        types: d.types?.map(t => t.type.name).join(' / ') || ''
      }));

  // paginazione, per non appesantire la lista
  const totalPages = Math.ceil(allPokemonNames.length / PAGE_SIZE);

  const handleSearch = (e) => {
    e.preventDefault();
    debouncedSetSearch(search);
  };

  const handleChange = (e) => {
    setUsername(e.target.value);
  };

  if (loading) return <Loader />;

  return (
    <div className="">
      <Header />
      <main className="pt-12">
        <header className="App-header">
          <div className="flex items-center justify-center my-8">
            <Input
              type="text"
              placeholder="Cerca Pokémon..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);         
                debouncedSetSearch(e.target.value); 
              }}
              name="search"
            />
          </div>
          {searchError && <div className="custom-error">{searchError}</div>}
          <PokemonGrid
            pokemonList={pokemonToShow}
            loading={loading}
            onPokemonClick={name => navigate(`/pokemon/${name}`)}
          />
          {loading && <Loader />}
          {search.trim() === '' && totalPages > 1 && (
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ marginRight: 8 }}
              >
                &lt; Prev
              </button>
              Pagina {page} di {totalPages}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ marginLeft: 8 }}
              >
                Next &gt;
              </button>
            </div>
          )}
        </header>
      </main>
    </div>
  );
}

export default PokemonList;
