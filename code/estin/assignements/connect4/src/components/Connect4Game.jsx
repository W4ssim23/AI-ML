import { useState, useEffect } from "react";
import Cell from "./Cell";
import { game_const } from "../lib/game";
import { createEmptyBoard, checkDraw, checkWin } from "../lib/game";
import GameOver from "./GameOver";
import Board from "./Board";

export default function Connect4Game() {
  // this needs to be removed from this component
  const { ROWS, EMPTY, RED_Player, YELLOW_Player } = game_const;

  // will be handled by the game context
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(RED_Player);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const [draw, setDraw] = useState(false);

  // to be moved to cell after completing the game context
  function handleColumnClick(col) {
    if (gameOver) return;

    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === EMPTY) {
        const newBoard = board.map((row) => [...row]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        const win = checkWin(newBoard, row, col, currentPlayer);
        if (win) {
          setWinner(currentPlayer);
          setWinningCells(win);
          setGameOver(true);
          return;
        }

        if (checkDraw(newBoard)) {
          setDraw(true);
          setGameOver(true);
          return;
        }

        setCurrentPlayer(
          currentPlayer === RED_Player ? YELLOW_Player : RED_Player
        );
        return;
      }
    }
  }

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(RED_Player);
    setWinner(null);
    setGameOver(false);
    setWinningCells([]);
    setDraw(false);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <GameOver
        gameOver={gameOver}
        winner={winner}
        currentPlayer={currentPlayer}
      />

      <Board
        board={board}
        winningCells={winningCells}
        handleColumnClick={handleColumnClick}
      />

      <div className="mt-4">
        <button
          onClick={resetGame}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
