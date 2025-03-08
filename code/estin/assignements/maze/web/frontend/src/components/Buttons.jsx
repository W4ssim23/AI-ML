import React from "react";
import useMode from "../hooks/useMode";
import useStatus from "../hooks/useStatus";
import useMaze from "../hooks/useMaze";
import useAgents from "../hooks/useAgents";
import { createMaze, raceMazeAlgorithms, solveMaze } from "../lib/api";

export default function Buttons() {
  const [maze, setMaze] = useMaze();
  const [agents, setAgents] = useAgents();
  const [mode, setMode] = useMode();
  const normalMode = mode === "normal";

  const { mazeParams, setStep, algorithm } = useStatus();

  const generateMaze = (mazeParams) => {
    const resp = createMaze(mazeParams);
    setMaze(resp);
    setStep("ready");
  };

  const mazeSol = () => {
    const options = {
      maze: maze,
      start: maze.start,
      end: maze.end,
      algorithm,
      withSteps: true,
    };
    const resp = solveMaze(options);
    console.log(resp);
    setMaze(resp);
    setStep("solved");
  };

  const mazeRace = () => {
    const options = {
      maze: maze,
      start: maze.start,
      end: maze.end,
      agent1: agents.agent1.algorithm,
      agent2: agents.agent2.algorithm,
    };
    const resp = raceMazeAlgorithms(options);
    console.log(resp);
    setAgents(resp);
    setStep("solved");
  };

  const resetGame = () => {
    setMaze(null);
    setStep("waiting");
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <button
        className="w-full p-2 bg-blue-500 text-white rounded disabled:bg-gray-400 hover:cursor-pointer"
        onClick={() => generateMaze(mazeParams)}
      >
        Generate Maze
      </button>

      <button
        className="w-full p-2 bg-green-500 text-white rounded disabled:bg-gray-400 hover:cursor-pointer"
        onClick={() => (normalMode ? mazeSol() : mazeRace())}
        disabled={!maze}
      >
        Solve Maze
      </button>

      <button
        className="w-full p-2 bg-red-500 text-white rounded disabled:bg-gray-400 hover:cursor-pointer"
        onClick={resetGame}
        disabled={!maze}
      >
        Reset
      </button>

      <button
        className="w-full p-2 bg-purple-500 text-white rounded hover:cursor-pointer"
        onClick={() => {
          setMode(normalMode ? "race" : "normal");
          if (!maze) {
            setStep("waiting");
          } else {
            setStep("ready");
          }
        }}
      >
        {normalMode ? "Normal Mode" : "Race Mode"}
      </button>
    </div>
  );
}
