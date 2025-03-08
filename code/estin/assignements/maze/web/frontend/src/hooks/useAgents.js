import { useContext } from "react";
import { GlobalContext } from "../context/global";

export default function useAgents() {
  const { agents, setAgents } = useContext(GlobalContext);

  return [agents, setAgents];
}
