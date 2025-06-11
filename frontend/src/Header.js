import React from "react";
import logo from "../assets/logo.png"; // metti qui il tuo logo pokéball

function Header() {
  return (
    <header className="w-full py-6 flex flex-col items-center bg-black/70 shadow-lg">
      <img src={logo} alt="logo" className="w-24 h-24 mb-2 drop-shadow-lg" />
      <h1 className="text-3xl font-bold text-yellow-300 tracking-widest">Pokémon Web</h1>
    </header>
  );
}

export default Header;