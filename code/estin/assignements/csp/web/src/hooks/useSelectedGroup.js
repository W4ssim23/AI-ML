import { useContext } from "react";
import { GlobalContext } from "../context/context";

export default function useSelectedGroup() {
  const { selectedGroup, setSelectedGroup } = useContext(GlobalContext);

  return [selectedGroup, setSelectedGroup];
}
