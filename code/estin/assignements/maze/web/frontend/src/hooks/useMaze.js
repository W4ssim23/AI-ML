import { useContext } from "react";
import { GlobalContext } from "../context/global";

export default function useMaze() {
  const { maze, setMaze } = useContext(GlobalContext);

  return [maze, setMaze];
}
