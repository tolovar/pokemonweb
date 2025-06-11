export function typeColorClass(type) {
  switch (type) {
    case 'grass': return 'bg-green-200 text-green-800';
    case 'fire': return 'bg-red-200 text-red-800';
    case 'water': return 'bg-blue-200 text-blue-800';
    case 'electric': return 'bg-yellow-200 text-yellow-800';
    // ...altri tipi...
    default: return 'bg-gray-200 text-gray-800';
  }
}