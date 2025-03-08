import React from "react";
import useStatus from "../hooks/useStatus";
import RaceMazes from "./RaceMazes";
import RaceSolsSteps from "./RaceSolsSteps";

export default function RaceMode() {
  const { step } = useStatus();

  if (step === "waiting") {
    return (
      <h1 className="font-bold text-2xl">
        Genrate the Mazes and get started !
      </h1>
    );
  }

  if (step === "ready") {
    return <RaceMazes />;
  }

  if (step === "solved") {
    return <RaceSolsSteps />;
  }
}
