import { useContext } from "react";
import { GlobalContext } from "../context/global";

export default function useMode() {
  const { mode, setMode } = useContext(GlobalContext);

  return [mode, setMode];
}
