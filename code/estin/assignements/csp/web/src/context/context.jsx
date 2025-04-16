import React, { createContext, useState } from "react";

import { cs_constraints, cs_courses, cs_timestable } from "../lib/data";

export const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [courses, setCourses] = useState(cs_courses);
  const [timetable, setTimetable] = useState(cs_timestable);
  const [constraints, setConstraints] = useState(cs_constraints);
  const [selectedGroup, setSelectedGroup] = useState("G1"); // from 1 to 6

  const contextValue = {
    courses,
    setCourses,
    timetable,
    setTimetable,
    constraints,
    setConstraints,
    selectedGroup,
    setSelectedGroup,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
