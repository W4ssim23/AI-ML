import { useState } from "react";
import WeeklyTimetable from "./components/WeeklyTimetable";
import ConstraintPanel from "./components/ConstraintPanel";
import CoursesPanel from "./components/CoursesPanel";
import ControlPanel from "./components/ControlPanel";
import { cs_constraints, cs_courses, cs_timeTable } from "./lib/data";

function App() {
  const [courses, setCourses] = useState(cs_courses);
  const [timetable, setTimetable] = useState(cs_timeTable);
  const [constraints, setConstraints] = useState(cs_constraints);

  const runScheduler = () => {
    console.log("Running scheduler with constraints:", constraints);
    alert("Not inplemented yet lol !");
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center">
        1CS Timetable Scheduler
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <WeeklyTimetable timetable={timetable} />
        </div>
        <div className="space-y-6">
          <ConstraintPanel
            constraints={constraints}
            setConstraints={setConstraints}
          />
          {/* <CoursesPanel courses={courses} /> */}
        </div>
      </div>

      <div className="mt-8">
        <ControlPanel runScheduler={runScheduler} />
      </div>
    </div>
  );
}

export default App;
