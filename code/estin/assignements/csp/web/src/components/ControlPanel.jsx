import { useState } from "react";
import useTimetable from "../hooks/useTimetable";
import useConstraints from "../hooks/useConstraints";
import { cs_courses, cs_timestable } from "../lib/data";
import CSPSolver from "../lib/engine";

const ControlPanel = () => {
  const [timeTable, setTimetable] = useTimetable();
  const [constraints] = useConstraints();
  const [algorithm, setAlgorithm] = useState("backtracking+AC3+MRV");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [groupCount, setGroupCount] = useState(6);

  const runProgram = () => {
    setLoading(true);

    const useAC3 = algorithm.includes("AC3");
    const useMRV = algorithm.includes("MRV");

    const solver = new CSPSolver(cs_courses, null, constraints, groupCount);

    setTimeout(() => {
      try {
        const result = solver.solve(useAC3, useMRV, true);
        if (result.success) {
          console.log(result);
          setTimetable(result.timetable);
          setStats(result.stats);
        } else {
          alert(
            "No solution found. Try different constraints, algorithm options, or fewer groups."
          );
          setStats(result.stats);
        }
      } catch (error) {
        console.error("Error solving timetable:", error);
        alert("Error solving timetable: " + error.message);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  const exportSchedule = () => {
    const timetableJson = JSON.stringify(timeTable, null, 2);
    const blob = new Blob([timetableJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h2 className="text-xl font-semibold p-4 border-b">Controls</h2>

      <div className="p-4  border-t">
        <div className="flex items-center space-x-4">
          <div>
            <label
              htmlFor="algorithm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Algorithm
            </label>
            <select
              id="algorithm"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="backtracking">Backtracking</option>
              <option value="backtracking+AC3">Backtracking + AC3</option>
              <option value="backtracking+MRV">Backtracking + MRV</option>
              <option value="backtracking+AC3+MRV">
                Backtracking + AC3 + MRV
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="groupCount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Groups
            </label>
            <select
              id="groupCount"
              value={groupCount}
              onChange={(e) => setGroupCount(parseInt(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="1">1 Group</option>
              <option value="2">2 Groups</option>
              <option value="3">3 Groups</option>
              <option value="4">4 Groups</option>
              <option value="5">5 Groups</option>
              <option value="6">6 Groups</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 flex space-x-4">
        <button
          onClick={runProgram}
          disabled={loading}
          className={`${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white font-medium py-2 px-4 rounded transition duration-150`}
        >
          {loading ? "Generating..." : "Generate Schedule"}
        </button>

        <button
          onClick={() => setTimetable(cs_timestable)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition duration-150"
        >
          Clear Schedule
        </button>

        <button
          onClick={exportSchedule}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-150"
        >
          Export Schedule
        </button>
      </div>

      {stats && (
        <div className="p-4 bg-gray-50 border-t">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Performance Stats
          </h3>
          <div className="text-sm text-gray-600">
            <p>Backtrack calls: {stats.backtrackCalls}</p>
            <p>Failed assignments: {stats.failedAssignments}</p>
            <p>Time taken: {stats.timeTaken}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
