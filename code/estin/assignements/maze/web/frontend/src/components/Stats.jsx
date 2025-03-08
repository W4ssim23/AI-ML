import React from "react";
import useMaze from "../hooks/useMaze";
import useMode from "../hooks/useMode";

export default function Stats() {
  const [maze, _] = useMaze();
  const [mode, setMode] = useMode();
  const normalMode = mode === "normal";

  if (!normalMode) return;

  if (!maze) return;
  if (!maze.visited) return;
  if (!maze.path) return;

  return (
    <div className="flex flex-col gap-1 items-center justify-center text-center">
      <p>visited nodes : {maze.visited.length}</p>
      <p>path length : {maze.path.length}</p>
    </div>
  );
}
