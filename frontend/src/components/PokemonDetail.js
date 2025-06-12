import React, { useState, useEffect, useContext } from 'react';
import { capitalize } from '../helpers/text'; 
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api'; // uso apiFetch per includere il token
import { typeColorClass } from '../utils/typeColorClass';
import Loader from './common/Loader';
import Input from './common/Input';
import Header from './Header';

// creo il componente che mostra i dettagli di un pokémon
function PokemonDetail({ name }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const [addSuccess, setAddSuccess] = useState(null);

  // quando il componente viene montato o il nome cambia, scarico i dettagli del pokémon
  useEffect(() => {
    setLoading(true);
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then(res => res.json())
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [name]);

  const handleAddToTeam = async () => {
    try {
      await apiFetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setAddSuccess('Pokémon aggiunto alla tua squadra!');
    } catch (error) {
      setAddSuccess('Errore durante l\'aggiunta del Pokémon');
    }
  };

  if (loading) return <Loader />;
  if (!details) return <div>Caricamento</div>;
  if (details.error) return <div>Pokémon non trovato</div>;

  // conversioni
  const pesoKg = (details.weight / 10).toFixed(1); // da libre a chilogrammi
  const altezzaM = (details.height / 10).toFixed(2); // da decimetri a metri
  const nome = capitalize(details.name);

  return (
    <div className="App">
      <Header />
      <main className="pt-12">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 max-w-lg mx-auto border-4 border-blue-500">
          <div className="flex flex-col items-center">
            <img src={details.sprites.front_default} alt={details.name} className="w-32 h-32 drop-shadow-lg" />
            <h2 className="text-3xl font-bold text-blue-700 mt-4">{nome}</h2>
            <div className="flex gap-2 mt-2">
              {details.types.map(t => (
                <span
                  key={t.type.name}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${typeColorClass(t.type.name)}`}
                >
                  {t.type.name}
                </span>
              ))}
            </div>
            <div className="mt-6 w-full">
              <p><strong>Altezza:</strong> {altezzaM} m</p>
              <p><strong>Peso:</strong> {pesoKg} kg</p>
              <p>
                <strong>Tipi:</strong> {details.types.map(t => capitalize(t.type.name)).join(', ')}
              </p>
              <p>
                <strong>Abilità:</strong> {details.abilities.map(a => capitalize(a.ability.name)).join(', ')}
              </p>
              <p>
                <strong>Mosse principali:</strong> {details.moves.slice(0, 4).map(m => capitalize(m.move.name)).join(', ')}
                {details.moves.length > 4 ? '...' : ''}
              </p>
            </div>
          </div>
        </div>
        {isAuthenticated && (
          <button
            onClick={handleAddToTeam}
            style={{
              display: 'block',
              margin: '24px auto',
              padding: '12px 32px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #ffcb05 60%, #3b4cca 100%)',
              color: '#3b4cca',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #3b4cca33',
              transition: 'background 0.2s'
            }}
          >
            Aggiungi alla squadra
          </button>
        )}
        {addSuccess && (
          <div style={{
            color: addSuccess.startsWith('Errore') ? '#e74c3c' : '#388e3c',
            marginBottom: 12,
            fontWeight: 600
          }}>
            {addSuccess}
          </div>
        )}
        <a href="/pokemon" style={{ color: '#61dafb', fontWeight: 600 }}>Torna alla lista</a>
      </main>
    </div>
  );
}

export default PokemonDetail;