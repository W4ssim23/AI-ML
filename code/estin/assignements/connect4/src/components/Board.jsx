import React from "react";
import Cell from "./Cell";

export default function Board({ board, winningCells, handleColumnClick }) {
  return (
    <div className="bg-blue-300 p-4 rounded-lg shadow-lg">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => {
            const isWinning = winningCells.some(
              ([r, c]) => r === rowIndex && c === colIndex
            );
            return (
              <Cell
                key={colIndex}
                value={cell}
                row={rowIndex}
                col={colIndex}
                isWinning={isWinning}
                handleColumnClick={handleColumnClick}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
