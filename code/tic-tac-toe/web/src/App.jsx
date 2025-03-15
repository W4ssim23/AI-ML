import { useState, useEffect } from "react";
import agentPhoto from "../src/assets/agentPhoto.webp";
import { agent } from "./lib/agent";
import { checkWinner, getRandomPhrase } from "./lib/func";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerRole, setPlayerRole] = useState(null); // null initially to allow role selection
  const [isAgentTurn, setIsAgentTurn] = useState(false);
  const [message, setMessage] = useState("Choose your role to begin.");
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      const winner = checkWinner(board);
      if (winner) {
        setMessage(getRandomPhrase(winner === "tie" ? "tie" : "win"));
      } else if (isAgentTurn) {
        const agentRole = playerRole === "X" ? "O" : "X";
        const move = agent([...board], agentRole);
        if (move !== null) {
          setTimeout(() => {
            const newBoard = [...board];
            newBoard[move] = agentRole;
            setBoard(newBoard);
            setIsAgentTurn(false);
            setMessage(getRandomPhrase("move"));
          }, 1000);
        }
      }
    }
  }, [board, isAgentTurn, gameStarted]);

  const handleClick = (index) => {
    if (board[index] || checkWinner(board) || isAgentTurn) return;
    const newBoard = [...board];
    newBoard[index] = playerRole;
    setBoard(newBoard);
    setIsAgentTurn(true);
    setMessage(getRandomPhrase("opponentMove"));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsAgentTurn(playerRole === "X" ? false : true);
    setMessage("Let us begin.");
    setGameStarted(true);
  };

  const selectRole = (role) => {
    setPlayerRole(role);
    setIsAgentTurn(role === "X" ? false : true);
    setMessage(
      role === "X" ? "You are X. Your move!" : "You are O. Agent starts."
    );
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-100">
        <div className="flex flex-col gap-3 items-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className=" text-2xl font-bold text-gray-800 mb-2">
            Elder Thalorin's Challenge
          </h1>
          <img
            src={agentPhoto}
            alt="Wise AI"
            width={120}
            height={120}
            className="rounded-xl"
          />
          <p className="text-lg font-semibold mt-2 text-center">
            Choose your role to begin.
          </p>
          <div className="flex gap-4 mt-4">
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              onClick={() => selectRole("X")}
            >
              Play as X
            </button>
            <button
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
              onClick={() => selectRole("O")}
            >
              Play as O
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="flex flex-col gap-3 items-center bg-white p-8 rounded-lg shadow-lg">
        <img
          src={agentPhoto}
          alt="Wise AI"
          width={120}
          height={120}
          className="rounded-xl"
        />
        <p className="text-lg font-semibold mt-2 text-center max-w-[310px]">
          {message}
        </p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {board.map((cell, index) => (
            <button
              key={index}
              className="w-20 h-20 flex items-center justify-center border border-gray-700 text-2xl font-bold hover:bg-gray-100 transition duration-300"
              onClick={() => handleClick(index)}
            >
              {cell}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
            onClick={resetGame}
          >
            Reset Game
          </button>
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            onClick={() => {
              setBoard(Array(9).fill(null));
              setIsAgentTurn(playerRole === "X" ? false : true);
              setMessage("Let us begin.");
              setGameStarted(false);
            }}
          >
            Select Roles
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
