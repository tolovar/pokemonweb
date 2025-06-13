// funzione helper per effettuare richieste autenticata con il token jwt
export async function apiFetch(url, options = {}) {
  // recupero il token dal localstorage
  const token = localStorage.getItem('token');
  console.log('Token inviato nella richiesta:', token); 
  // aggiungo l'header authorization se il token è presente
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  // se c'è un body e non è già impostato, aggiungo content-type
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    // provo a leggere json, altrimenti testo
    let errorBody;
    try {
      errorBody = contentType && contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch {
      errorBody = await response.text();
    }
    // gestione robusta della stringificazione
    let stringifiedErrorBody;
    try {
      stringifiedErrorBody = JSON.stringify(errorBody);
    } catch (e) {
      stringifiedErrorBody = String(errorBody);
    }
    throw new Error(
      `errore http! status: ${response.status}, body: ${stringifiedErrorBody}`
    );
  }
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    const text = await response.text();
    throw new Error(`risposta non-json, body: ${text}`);
  }
}