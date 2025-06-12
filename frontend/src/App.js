import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import PokemonList from './components/PokemonList';
import PokemonDetailWrapper from './components/PokemonDetailWrapper';
import Login from './components/Login';
import Register from './components/Register';
import PokemonTeam from './components/PokemonTeam';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import PrivateRoute from './components/common/PrivateRoute';
import { Toaster } from 'react-hot-toast';

// app principale con routing
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-red-600 via-red-400 via-70% to-blue-700">
          <Header />
          <Toaster position="top-center" />
          <main className="pt-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pokemon" element={<PokemonList />} />
              <Route path="/pokemon/:name" element={<PokemonDetailWrapper />} />
              <Route path="/pokemon-team" element={
                <PrivateRoute>
                  <PokemonTeam />
                </PrivateRoute>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
