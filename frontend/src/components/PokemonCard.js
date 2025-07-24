import React from 'react';
import { typeColorClass } from '../utils/typeColorClass';
import Loader from './common/Loader';

// card del pokemon 
function PokemonCard({ pokemon, onRemove, loading, onClick }) {
  return (
    <div
      className={`flex flex-col items-center bg-white/90 rounded-xl p-4 shadow-xl border-4 border-transparent hover:scale-105 transition-transform duration-200 cursor-pointer ${typeColorClass(pokemon.type)}`}
      onClick={onClick}
      style={{ position: 'relative', minWidth: 140, minHeight: 180 }}
    >
      {/* icona di rimozione, visibile solo se onRemove ha risolto */}
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
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
      {/* se il pokemon non ha tipo o sprite, mostro un loader */}
      {(!pokemon.type || !pokemon.sprite) ? (
        <Loader />
      ) : (
        <>
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="w-20 h-20 drop-shadow-lg"
            loading="lazy"
          />
          <span className="mt-2 font-semibold text-lg text-gray-800">{pokemon.name}</span>
          <span className={`mt-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${typeColorClass(pokemon.type)}`}>
            {pokemon.types}
          </span>
        </>
      )}
    </div>
  );
}

export default PokemonCard;