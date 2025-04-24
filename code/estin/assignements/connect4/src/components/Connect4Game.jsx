import { useEffect, useState, useRef } from "react";
import { game_const } from "../lib/game";
import { createEmptyBoard, checkDraw, checkWin } from "../lib/game";
import GameOver from "./GameOver";
import Board from "./Board";
import useGameState from "../hooks/useGameState";
import { Connect4Interface } from "../lib/agent";

export default function Connect4Game() {
  const { ROWS, EMPTY, RED_Player, YELLOW_Player } = game_const;

  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(RED_Player);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const [draw, setDraw] = useState(false);

  const [gameState, setGameState] = useGameState();

  const solverRef = useRef(new Connect4Interface());

  function handleColumnClick(col) {
    if (gameOver || currentPlayer === YELLOW_Player) return;

    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === EMPTY) {
        const newBoard = board.map((row) => [...row]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);

        const newGameState = gameState + String(col + 1);
        setGameState(newGameState);

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

        setCurrentPlayer(YELLOW_Player);
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
    setGameState("");
    solverRef.current.reset();
  };

  useEffect(() => {
    if (!gameOver && currentPlayer === YELLOW_Player) {
      solverRef.current.reset();
      solverRef.current.setPosition(gameState);

      const movesPlayed = gameState.length;

      const maxDepth = movesPlayed >= 16 ? Infinity : 100;

      const { column, score } = solverRef.current.getBestMove(false, maxDepth);

      console.log(`Best move: column ${column + 1} with score ${score}`);
      console.log(`Current player: YELLOW`);
      console.log("Current board state:");
      console.log(solverRef.current.getBoardString());

      // Simulate the AI move after a small delay for better UX
      const timer = setTimeout(() => {
        if (column >= 0 && column < board[0].length) {
          for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][column] === EMPTY) {
              const newBoard = board.map((row) => [...row]);
              newBoard[row][column] = YELLOW_Player;
              setBoard(newBoard);

              const newGameState = gameState + String(column + 1);
              setGameState(newGameState);

              const win = checkWin(newBoard, row, column, YELLOW_Player);
              if (win) {
                setWinner(YELLOW_Player);
                setWinningCells(win);
                setGameOver(true);
                return;
              }

              if (checkDraw(newBoard)) {
                setDraw(true);
                setGameOver(true);
                return;
              }

              setCurrentPlayer(RED_Player);
              return;
            }
          }
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [board, gameOver, currentPlayer, gameState]);

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
