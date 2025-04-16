import WeeklyTimetable from "./components/WeeklyTimetable";
import ConstraintPanel from "./components/ConstraintPanel";
import ControlPanel from "./components/ControlPanel";

function App() {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">
        1CS Timetable Scheduler
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <WeeklyTimetable />
        </div>
        <div className="space-y-6">
          <ConstraintPanel />
        </div>
      </div>

      <div className="mt-8">
        <ControlPanel />
      </div>
    </div>
  );
}

export default App;
