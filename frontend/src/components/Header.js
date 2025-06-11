import React from "react";

function Header() {
  return (
    <header className="w-full py-2 px-4 flex items-center justify-center bg-gradient-to-r from-yellow-300 via-blue-200 to-red-200 shadow-sm">
      <img src={process.env.PUBLIC_URL + "/assets/pokeball.png"} alt="Pokeball" className="w-7 h-7 mr-3 drop-shadow" />
      <h1 className="text-2xl font-extrabold tracking-widest text-blue-700 drop-shadow-sm font-[Luckiest_Guy,cursive] uppercase">
        Pokémon Web
      </h1>
    </header>
  );
}

export default Header;