import { useContext } from "react";
import { GlobalContext } from "../context/context";

export default function useConstraints() {
  const { constraints, setConstraints } = useContext(GlobalContext);

  return [constraints, setConstraints];
}
