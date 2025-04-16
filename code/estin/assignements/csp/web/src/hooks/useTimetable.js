import { useContext } from "react";
import { GlobalContext } from "../context/context";

export default function useTimetable() {
  const { timetable, setTimetable } = useContext(GlobalContext);

  return [timetable, setTimetable];
}
