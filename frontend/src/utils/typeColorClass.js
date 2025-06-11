// restituisco classi tailwind diverse in base al tipo pokémon
export function typeColorClass(type) {
  switch (type) {
    case 'grass': return 'hover:border-green-400';
    case 'fire': return 'hover:border-red-400';
    case 'water': return 'hover:border-blue-400';
    case 'electric': return 'hover:border-yellow-400';
    case 'psychic': return 'hover:border-purple-400';
    case 'ice': return 'hover:border-cyan-400';
    case 'dragon': return 'hover:border-orange-400';
    case 'dark': return 'hover:border-gray-800'; 
    case 'fairy': return 'hover:border-pink-400';
    case 'fighting': return 'hover:border-red-600';
    case 'poison': return 'hover:border-purple-600';
    case 'ground': return 'hover:border-brown-400';
    case 'rock': return 'hover:border-yellow-600';
    case 'bug': return 'hover:border-green-600';
    case 'ghost': return 'hover:border-indigo-400';
    case 'steel': return 'hover:border-gray-600';
    case 'flying': return 'hover:border-blue-600';
    case 'normal': return 'hover:border-gray-300';
    default: return 'hover:border-gray-300';
  }
}