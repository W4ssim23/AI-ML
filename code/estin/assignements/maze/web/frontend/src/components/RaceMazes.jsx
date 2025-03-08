import React from "react";
import Maze from "./Maze";
import useAgents from "../hooks/useAgents";
import useMaze from "../hooks/useMaze";
import useStatus from "../hooks/useStatus";

export default function RaceMazes() {
  const [agents, _] = useAgents();

  const naming = (name) => {
    if (name === "dfs") {
      return "Depth First Search";
    } else if (name === "bfs") {
      return "Breadth First Search";
    } else if (name === "astar") {
      return "A* Search";
    }
  };

  const { setStep } = useStatus();
  const [maze, setMaze] = useMaze();
  if (!maze) return;
  if (maze.width > 15 || maze.height > 15) setStep("waiting");

  return (
    <div className="flex w-full h-full min-h-[80vh] items-center justify-center gap-4">
      <div className="flex flex-col itmes-center justify-center w-full gap-2">
        <h2 className="w-full  font-semibold text-center text-2xl">
          {naming(agents.agent1.algorithm)} Algorithm :
        </h2>
        <Maze />
      </div>
      <div className="flex flex-col itmes-center justify-center w-full gap-2">
        <h2 className="w-full  font-semibold text-center text-2xl">
          {naming(agents.agent2.algorithm)} Algorithm :
        </h2>
        <Maze />
      </div>
    </div>
  );
}
