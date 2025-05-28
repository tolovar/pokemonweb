import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import PokemonList from './components/PokemonList';
import PokemonDetailWrapper from './components/PokemonDetailWrapper';
import Login from './components/Login';
import PokemonTeam from './components/PokemonTeam';

// app principale con routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pokemon" element={<PokemonList />} />
        <Route path="/pokemon/:name" element={<PokemonDetailWrapper />} />
        <Route path="/pokemon-team" element={<PokemonTeam />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
