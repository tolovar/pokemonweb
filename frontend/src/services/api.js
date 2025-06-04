// funzione helper per effettuare richieste autenticata con il token jwt
export async function apiFetch(url, options = {}) {
  // recupero il token dal localstorage
  const token = localStorage.getItem('token');
  // aggiungo l'header Authorization se il token è presente
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, { ...options, headers });
  // restituisco la risposta come json
  return res.json();
}