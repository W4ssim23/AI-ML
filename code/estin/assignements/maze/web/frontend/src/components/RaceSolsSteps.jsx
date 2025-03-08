import React from "react";
import StepsMazeRace from "./StepsMazeRace";
import useAgents from "../hooks/useAgents";

export default function RaceSolsSteps() {
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

  return (
    <div className="flex w-full h-full min-h-[80vh] items-center justify-center gap-4">
      <div className="flex flex-col itmes-center justify-center w-full gap-2">
        <h2 className="w-full  font-semibold text-center text-2xl">
          {naming(agents.agent1.algorithm)} Algorithm :
        </h2>
        <StepsMazeRace m={agents.agent1} />
      </div>
      <div className="flex flex-col itmes-center justify-center w-full gap-2">
        <h2 className="w-full  font-semibold text-center text-2xl">
          {naming(agents.agent2.algorithm)} Algorithm :
        </h2>
        <StepsMazeRace m={agents.agent2} />
      </div>
    </div>
  );
}
