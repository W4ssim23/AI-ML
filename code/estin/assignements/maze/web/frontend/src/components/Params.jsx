import React from "react";
import { useState } from "react";
import useStatus from "../hooks/useStatus";
import useMode from "../hooks/useMode";
import useAgents from "../hooks/useAgents";

export default function Params() {
  const [showDropDown, setShowDropDown] = useState(false);
  const [error, setError] = useState(null);
  const [mode, _] = useMode();
  const [agents, setAgents] = useAgents();

  const {
    type,
    setType,
    mazeParams,
    setMazeParams,
    algorithm,
    setAlgorithm,
    setStep,
  } = useStatus();

  const [params, setParams] = useState(mazeParams);

  const handleSizeChange = (e) => {
    setParams({
      ...params,
      [e.target.name]: e.target.value,
    });

    if (e.target.value < 15 || e.target.value > 25) {
      setError("Size should be between 15 and 25");
      return;
    }

    setError(null);

    setMazeParams({
      ...mazeParams,
      [e.target.name]: parseInt(e.target.value),
    });
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {mode !== "race" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Width:</label>
            <input
              type="number"
              name="width"
              value={params.width}
              onChange={handleSizeChange}
              min="15"
              max="25"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Height:</label>
            <input
              type="number"
              name="height"
              value={params.height}
              onChange={handleSizeChange}
              min="15"
              max="25"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">Algorithm:</label>
            <button
              className="w-full p-2 border rounded bg-white flex justify-between items-center"
              onClick={() => setShowDropDown(!showDropDown)}
            >
              {algorithm === "bfs"
                ? "Breadth-First Search"
                : algorithm === "dfs"
                ? "Depth-First Search"
                : "A* Search"}
              <span>▼</span>
            </button>

            {showDropDown && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10">
                <button
                  className="w-full p-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setAlgorithm("bfs");
                    setShowDropDown(false);
                  }}
                >
                  Breadth-First Search
                </button>
                <button
                  className="w-full p-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setAlgorithm("dfs");
                    setShowDropDown(false);
                  }}
                >
                  Depth-First Search
                </button>
                <button
                  className="w-full p-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setAlgorithm("astar");
                    setShowDropDown(false);
                  }}
                >
                  A* Search
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center w-full">
            <input
              type="checkbox"
              id="animation"
              checked={type !== "directly"}
              onChange={() =>
                setType(type === "directly" ? "step" : "directly")
              }
              className="mr-2"
            />
            <label htmlFor="manualMode" className="text-sm">
              Show Animation
            </label>
          </div>
        </>
      )}
      {mode === "race" && (
        <div className="flex flex-col gap-2">
          <AgentsDropdown
            setStep={setStep}
            setAgents={setAgents}
            agents={agents}
            agent="agent1"
          />
          <AgentsDropdown
            setStep={setStep}
            setAgents={setAgents}
            agents={agents}
            agent="agent2"
          />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

function AgentsDropdown({ setAgents, agents, agent, setStep }) {
  console.log(agents);
  const [showDropDown, setShowDropDown] = useState(false);
  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">{agent}:</label>
      <button
        className="w-full p-2 border rounded bg-white flex justify-between items-center"
        onClick={() => setShowDropDown(!showDropDown)}
      >
        {agents[agent].algorithm === "bfs"
          ? "Breadth-First Search"
          : agents[agent].algorithm === "dfs"
          ? "Depth-First Search"
          : "A* Search"}
        <span>▼</span>
      </button>

      {showDropDown && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10">
          <button
            className="w-full p-2 text-left hover:bg-gray-100"
            onClick={() => {
              setAgents({
                ...agents,
                [agent]: { ...agents[agent], algorithm: "bfs" },
              });
              setStep("ready");
              setShowDropDown(false);
            }}
          >
            Breadth-First Search
          </button>
          <button
            className="w-full p-2 text-left hover:bg-gray-100"
            onClick={() => {
              setAgents({
                ...agents,
                [agent]: { ...agents[agent], algorithm: "dfs" },
              });
              setStep("ready");
              setShowDropDown(false);
            }}
          >
            Depth-First Search
          </button>
          <button
            className="w-full p-2 text-left hover:bg-gray-100"
            onClick={() => {
              setAgents({
                ...agents,
                [agent]: { ...agents[agent], algorithm: "astar" },
              });
              setStep("ready");
              setShowDropDown(false);
            }}
          >
            A* Search
          </button>
        </div>
      )}
    </div>
  );
}
