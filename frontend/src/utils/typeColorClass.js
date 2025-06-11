// restituisco classi tailwind diverse in base al tipo pokémon
export function typeColorClass(type) {
  switch (type) {
    case 'grass': return 'bg-green-200 text-green-800';
    case 'fire': return 'bg-red-200 text-red-800';
    case 'water': return 'bg-blue-200 text-blue-800';
    case 'electric': return 'bg-yellow-200 text-yellow-800';
    case 'psychic': return 'bg-purple-200 text-purple-800';
    case 'ice': return 'bg-cyan-200 text-cyan-800';
    case 'dragon': return 'bg-orange-200 text-orange-800';
    case 'dark': return 'bg-gray-800 text-white'; 
    case 'fairy': return 'bg-pink-200 text-pink-800';
    case 'fighting': return 'bg-red-300 text-red-900';
    case 'poison': return 'bg-purple-300 text-purple-900';
    case 'ground': return 'bg-brown-200 text-brown-800';
    case 'rock': return 'bg-yellow-300 text-yellow-900';
    case 'bug': return 'bg-green-300 text-green-900';
    case 'ghost': return 'bg-indigo-200 text-indigo-800';
    case 'steel': return 'bg-gray-300 text-gray-900';
    case 'flying': return 'bg-blue-300 text-blue-900';
    case 'normal': return 'bg-gray-100 text-gray-900';
    default: return 'bg-gray-200 text-gray-800';
  }
}