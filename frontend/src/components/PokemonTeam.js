import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PokemonCard from './PokemonCard';
import { apiFetch } from '../services/api';
import { typeColorClass } from '../utils/typeColorClass';
import Loader from './common/Loader';
import Input from './common/Input';
import Header from './Header';
import { toast } from 'react-hot-toast';

const MAX_TEAM_SIZE = 6;

function PokemonTeam() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [team, setTeam] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allPokemon, setAllPokemon] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // recupero la squadra dell'utente loggato usando il token
  useEffect(() => {
    async function fetchTeam() {
      if (isAuthenticated) {
        setLoading(true);
        try {
          // uso il wrapper che lancia già in caso di errore
          const data = await apiFetch('/api/team');
          const teamWithSprites = await Promise.all(
            data.map(async (p) => {
              // recupero lo sprite del pokémon da pokeapi
              const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`);
              const pokeData = await pokeRes.json();
              return {
                ...p,
                sprite: pokeData.sprites.front_default,
              };
            })
          );
          setTeam(teamWithSprites);
        } catch (error) {
          console.error('dettaglio errore:', error);
          // provo a capire se è un errore di autenticazione
          if (
            error.message.includes('401') ||
            error.message.includes('Sessione scaduta') ||
            error.message.includes('Not enough segments')
          ) {
            logout();
            navigate('/login');
          } else {
            alert('errore nel caricamento della squadra: ' + error.message);
          }
        }
        finally {
          setLoading(false);
        }
      } else {
        // se l'utente non è loggato, lo reindirizzo al login
        navigate('/login');
      }
    }
    fetchTeam();
  }, [isAuthenticated, user, navigate]);

  // recupero la lista di tutti i pokemon solo quando serve
  useEffect(() => {
    async function fetchAllPokemon() {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
      const data = await res.json();
      // salvo solo nome e id, che estraggo dall'url
      setAllPokemon(data.results.map(p => ({
        name: p.name,
        id: p.url.split('/').filter(Boolean).pop()
      })));
    }
    if (showAddModal && allPokemon.length === 0) fetchAllPokemon();
  }, [showAddModal, allPokemon.length]);

  // filtro i pokemon in base alla ricerca
  const filteredPokemon = allPokemon
    .filter(p => p.name.includes(search))
    .slice(0, 60); // limito a 60 risultati per performance

  // rimuovo un pokémon dalla squadra
  const handleRemove = async (pokemonId) => {
    await apiFetch(`/api/team/${pokemonId}`, { method: 'DELETE' });
    toast.success('Pokémon rimosso dalla squadra!');
    setTeam(team.filter(p => p.id !== pokemonId));
  };

  // apro la modale per aggiungere un pokémon
  const handleAddClick = () => setShowAddModal(true);

  // aggiungo un pokémon selezionato dalla modale
  const handleAddPokemon = async (pokemonName) => {
    await apiFetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pokemonName })
    });
    toast.success('Pokémon aggiunto alla squadra!');
    setShowAddModal(false);
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <div style={{ position: 'relative', minHeight: 400 }}>
      <Header />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {team.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            onRemove={() => handleRemove(p.id)}
          />
        ))}
      </div>
      {/* bottone flottante per aggiungere pokemon */}
      {team.length < MAX_TEAM_SIZE && (
        <button
          onClick={handleAddClick}
          title="aggiungi un pokemon"
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffde00 60%, #3b4cca 100%)',
            color: '#3b4cca',
            fontSize: 36,
            border: 'none',
            boxShadow: '0 4px 16px #3b4cca55',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >+</button>
      )}
      {/* modale per aggiungere pokemon */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24, minWidth: 320, maxHeight: 500, overflowY: 'auto'
          }}>
            <h3 style={{ color: '#3b4cca', marginBottom: 16 }}>scegli un pokémon</h3>
            <div>
              <label htmlFor="search-pokemon" className="sr-only">Cerca Pokémon</label>
              <Input
                id="search-pokemon"
                type="text"
                placeholder="cerca pokémon"
                value={search}
                onChange={e => setSearch(e.target.value.toLowerCase())}
                style={{
                  width: '100%',
                  padding: 8,
                  marginBottom: 16,
                  borderRadius: 8,
                  border: '1px solid #3b4cca',
                  fontSize: 16
                }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, maxHeight: 350, overflowY: 'auto' }}>
              {filteredPokemon.length === 0 && <div style={{ color: '#e74c3c' }}>nessun pokémon trovato</div>}
              {filteredPokemon.map(p => (
                <div key={p.id} style={{ cursor: 'pointer' }} onClick={() => handleAddPokemon(p.name)}>
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                    alt={p.name}
                    style={{ width: 56, height: 56 }}
                  />
                  <div style={{ textAlign: 'center', color: '#3b4cca', fontWeight: 600 }}>{p.name}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAddModal(false)} style={{
              marginTop: 16, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', cursor: 'pointer'
            }}>chiudi</button>
          </div>
        </div>
      )}
      {loading && <Loader />}
    </div>
  );
}

export default PokemonTeam;