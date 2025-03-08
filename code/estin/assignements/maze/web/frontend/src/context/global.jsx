import React, { createContext, useState } from "react";

export const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [maze, setMaze] = useState(null);
  const [mode, setMode] = useState("normal");
  const [type, setType] = useState("step");
  const [step, setStep] = useState("waiting");
  const [algorithm, setAlgorithm] = useState("dfs");
  const [agents, setAgents] = useState({
    agent1: { algorithm: "dfs" },
    agent2: { algorithm: "astar" },
  });
  const [mazeParams, setMazeParams] = useState({
    width: 15,
    height: 15,
  });

  const contextValue = {
    maze,
    setMaze,
    mode,
    setMode,
    type,
    setType,
    step,
    setStep,
    algorithm,
    setAlgorithm,
    agents,
    setAgents,
    mazeParams,
    setMazeParams,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};
