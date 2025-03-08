import React from "react";
import NormalMode from "./NormalMode";
import RaceMode from "./RaceMode";
import useMode from "../hooks/useMode";

export default function MazeDisplay() {
  const [mode, _] = useMode();
  const normalMode = mode === "normal";
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4">
      {normalMode ? <NormalMode /> : <RaceMode />}
    </div>
  );
}
