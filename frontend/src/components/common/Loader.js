import React from "react";

//  loader animato 
function Loader() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-blue-700 rounded-full animate-spin"></div>
    </div>
  );
}

export default Loader;