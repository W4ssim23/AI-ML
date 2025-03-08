import React from "react";
import DirectlyMaze from "./DirectlyMaze";
import Maze from "./Maze";
import useStatus from "../hooks/useStatus";
import MazeSteps from "./MazeSteps";

export default function NormalMode() {
  const { type, step } = useStatus();

  if (step === "waiting") {
    return (
      <h1 className="font-bold text-2xl">Genrate a Maze and get started !</h1>
    );
  }

  if (step === "ready") {
    return <Maze />;
  }

  if (type === "directly") {
    if (step === "solved") {
      return <DirectlyMaze />;
    }
  } else {
    if (step === "solved") {
      return <MazeSteps />;
    }
  }
}
