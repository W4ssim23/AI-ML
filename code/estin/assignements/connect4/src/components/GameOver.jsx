import React from "react";
import { game_const } from "../lib/game";

export default function GameOver({ gameOver, winner, currentPlayer }) {
  const { RED_Player } = game_const;
  return (
    <div className="mb-4">
      {!gameOver ? (
        <div className="flex items-center">
          <span className="mr-2">Current player:</span>
          <div
            className={`w-6 h-6 rounded-full ${
              currentPlayer === RED_Player ? "bg-red-500" : "bg-yellow-500"
            }`}
          ></div>
        </div>
      ) : winner ? (
        <div className="font-bold text-xl flex items-center">
          <span className="mr-2">Winner:</span>
          <div
            className={`w-6 h-6 rounded-full ${
              winner === RED_Player ? "bg-red-500" : "bg-yellow-500"
            } mr-2`}
          ></div>
          <span>{winner === RED_Player ? "Red" : "Yellow"}</span>
        </div>
      ) : (
        <div className="font-bold text-xl">Draw!</div>
      )}
    </div>
  );
}
