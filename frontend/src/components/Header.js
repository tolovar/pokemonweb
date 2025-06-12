import React from "react";

function Header() {
  return (
    <header className="w-full py-2 px-4 flex items-center justify-center bg-white/70 backdrop-blur-md shadow-sm fixed top-0 left-0 z-50">
      <img
        src={process.env.PUBLIC_URL + "/assets/pokeball.png"}
        alt="Pokeball"
        className="w-7 h-7 mr-3 drop-shadow"
        style={{ filter: "drop-shadow(0 2px 4px #3b4cca55)" }}
      />
      <h1 className="text-xl font-bold tracking-widest text-yellow-500 drop-shadow-sm font-[Luckiest_Guy,cursive] uppercase">
        Pokémon Web
      </h1>
    </header>
  );
}

export default Header;