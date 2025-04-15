const ControlPanel = ({ runScheduler }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h2 className="text-xl font-semibold p-4 border-b">Controls</h2>
      <div className="p-4 flex space-x-4">
        <button
          onClick={runScheduler}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150"
        >
          Generate Schedule
        </button>

        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition duration-150">
          Clear Schedule
        </button>

        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-150">
          Export Schedule
        </button>
      </div>

      <div className="p-4 bg-gray-50 border-t">
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
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option>Backtracking</option>
              <option>Backtracking + AC3</option>
              <option>Backtracking + MRV</option>
              <option>Backtracking + AC3 + MRV</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="timeout"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Timeout (seconds)
            </label>
            <input
              type="number"
              id="timeout"
              defaultValue={30}
              min={1}
              max={300}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
