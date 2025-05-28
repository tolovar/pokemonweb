import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MAX_TEAM_SIZE = 6;

function PokemonTeam() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [team, setTeam] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTeam() {
      if (isAuthenticated) {
        const res = await fetch(`/api/team?userId=${user.id}`);
        const data = await res.json();
        // recupero gli sprite dalla API per ogni pokemon
        const teamWithSprites = await Promise.all(
          data.map(async (p) => {
            const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.name.toLowerCase()}`);
            const pokeData = await pokeRes.json();
            return {
              ...p,
              sprite: pokeData.sprites.front_default,
            };
          })
        );
        setTeam(teamWithSprites);
      }
    }
    fetchTeam();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <div>Devi essere loggato per vedere la tua squadra.</div>;

  // divido il team in due file da tre elementi
  const rows = [team.slice(0, 3), team.slice(3, 6)];

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0002' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontWeight: 'bold', fontSize: 20 }}>Benvenuto, {user?.name}</span>
        <button onClick={logout} style={{ padding: '6px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Logout
        </button>
      </header>
      <h2>La tua squadra</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 16 }}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
            {row.map((p, idx) => (
              <div
                key={idx}
                style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => navigate(`/pokemon/${p.name.toLowerCase()}`)}
                title={p.name}
              >
                <img src={p.sprite} alt={p.name} style={{ width: 96, height: 96 }} />
                <div style={{ marginTop: 8, fontWeight: 'bold', textTransform: 'capitalize' }}>{p.name}</div>
              </div>
            ))}
            {/* placeholder invisibili che occupano i posti vuoti se una riga ha meno di tre elementi */}
            {Array.from({ length: 3 - row.length }).map((_, i) => (
              <div key={`empty-${i}`} style={{ width: 96, height: 96 }} />
            ))}
          </div>
        ))}
      </div>
      {team.length === MAX_TEAM_SIZE && (
        <div style={{ color: '#3b4cca', fontWeight: 'bold' }}>Hai raggiunto il massimo di 6 Pokémon!</div>
      )}
    </div>
  );
}

export default PokemonTeam;