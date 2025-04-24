import { useContext } from "react";
import { GlobalContext } from "../context/context";

export default function useGameState() {
  const { gameState, setGameState } = useContext(GlobalContext);

  return [gameState, setGameState];
}
