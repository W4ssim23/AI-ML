import { useContext } from "react";
import { GlobalContext } from "../context/global";

export default function useStatus() {
  const {
    step,
    setStep,
    type,
    setType,
    mazeParams,
    setMazeParams,
    algorithm,
    setAlgorithm,
  } = useContext(GlobalContext);

  return {
    step,
    setStep,
    type,
    setType,
    mazeParams,
    setMazeParams,
    algorithm,
    setAlgorithm,
  };
}
