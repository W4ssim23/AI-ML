import React from "react";
import Connect4Game from "./components/Connect4Game";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center">
      <Connect4Game />
    </div>
  );
}
