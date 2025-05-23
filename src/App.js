import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PokemonList from './components/PokemonList';
import PokemonDetailWrapper from './components/PokemonDetailWrapper';

// app principale con routing
function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<PokemonList />} />
          <Route path="/pokemon/:name" element={<PokemonDetailWrapper />} />
        </Routes>
      </Router>
  );
}

export default App;
