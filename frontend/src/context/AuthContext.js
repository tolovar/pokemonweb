import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // funzione per disconnettere l'utente
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // funzione per effettuare il login e salvare il token jwt nel localstorage
  const handleLogin = async (username, password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.access_token) { 
      // salvo il token nel localStorage
      localStorage.setItem('token', data.access_token);
      console.log('Token JWT salvato:', data.access_token);
      return data.access_token;
    } else {
      throw new Error(data.error || data.message || 'login fallito');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, handleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}