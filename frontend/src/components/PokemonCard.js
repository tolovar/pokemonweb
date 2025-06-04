import React from 'react';

// card del pokemon 
function PokemonCard({ pokemon, onRemove }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c9e7ff 100%)',
      border: '3px solid #3b4cca',
      borderRadius: 16,
      boxShadow: '0 4px 16px #3b4cca33',
      padding: 16,
      textAlign: 'center',
      width: 140,
      margin: 8
    }}>
      {/* icona di rimozione, visibile solo se onRemove ha risolto */}
      {onRemove && (
        <button
          onClick={onRemove}
          title="rimuovi dalla squadra"
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 28,
            height: 28,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 16,
            boxShadow: '0 2px 6px #e74c3c33'
          }}
        >×</button>
      )}
      <img
        src={pokemon.sprite}
        alt={pokemon.name}
        style={{ width: 96, height: 96, filter: 'drop-shadow(0 0 8px #3b4cca88)' }}
      />
      <div style={{ marginTop: 8, fontWeight: 'bold', textTransform: 'capitalize', color: '#3b4cca' }}>
        {pokemon.name}
      </div>
    </div>
  );
}

export default PokemonCard;