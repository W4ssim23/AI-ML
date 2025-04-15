const WeeklyTimetable = ({ timetable }) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const timeSlots = ["8:00", "9:30", "11:00", "12:30", "14:00"];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h2 className="text-xl font-semibold p-4 border-b">Weekly Timetable</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHead days={days} />
          <TableBody days={days} timeSlots={timeSlots} timetable={timetable} />
        </table>
      </div>
    </div>
  );
};

export default WeeklyTimetable;

function TableHead({ days }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Time / Day
        </th>
        {days.map((day) => (
          <th
            key={day}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {day}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TableBody({ days, timeSlots, timetable }) {
  const getCellColor = (cellContent) => {
    if (!cellContent) return "bg-gray-50";

    const hash = cellContent.name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);

    const colors = [
      "bg-blue-100",
      "bg-green-100",
      "bg-yellow-100",
      "bg-pink-100",
      "bg-purple-100",
      "bg-indigo-100",
      "bg-red-100",
      "bg-orange-100",
      "bg-teal-100",
    ];

    return colors[hash % colors.length];
  };
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {timeSlots.map((time) => (
        <tr key={time}>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {time}
          </td>
          {days.map((day) => {
            const isDisabled =
              (time === "12:30" || time === "14:00") && day === "Tuesday";

            const cellContent = timetable[day][time];
            const cellId = `${day}-${time}`;

            return (
              <td
                key={cellId}
                className={`px-6 py-4 whitespace-nowrap text-sm hover:ring-2 hover:ring-blue-500 ${
                  isDisabled ? "bg-gray-200" : getCellColor(cellContent)
                }`}
              >
                {isDisabled ? (
                  <span className="text-gray-400">Not Available</span>
                ) : cellContent ? (
                  <div>
                    <div className="font-medium">{cellContent.name}</div>
                    <div className="text-xs text-gray-500">
                      {cellContent.type} - {cellContent.teacher}
                    </div>
                  </div>
                ) : (
                  "Available"
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}
