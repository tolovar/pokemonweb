import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Header() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // gestisco il click su login/logout
  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="w-full py-2 px-4 flex items-center justify-between bg-white/70 backdrop-blur-md shadow-sm fixed top-0 left-0 z-50">
      {/* pulsanti navigazione */}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 rounded bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold"
          onClick={() => navigate("/team")}
        >
          Pokemon Team
        </button>
        <button
          className="px-3 py-1 rounded bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold"
          onClick={() => navigate("/pokemon")}
        >
          Pokemon List
        </button>
      </div>
      {/* logo e titolo */}
      <div className="flex items-center">
        <img
          src={process.env.PUBLIC_URL + "/assets/pokeball.png"}
          alt="Pokeball"
          className="w-7 h-7 mr-3 drop-shadow"
          style={{ filter: "drop-shadow(0 2px 4px #3b4cca55)" }}
        />
        <h1 className="text-xl tracking-widest text-yellow-500 drop-shadow-sm font-[Luckiest_Guy,cursive] uppercase">
          Pokémon Web
        </h1>
      </div>
      {/* login/logout */}
      <div>
        <button
          className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white font-bold"
          onClick={handleAuthClick}
        >
          {isAuthenticated ? "Logout" : "Login"}
        </button>
      </div>
    </header>
  );
}

export default Header;