const CoursesPanel = ({ courses }) => {
  const coursesByName = courses.reduce((acc, course) => {
    if (!acc[course.name]) {
      acc[course.name] = [];
    }
    acc[course.name].push(course);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h2 className="text-xl font-semibold p-4 border-b">Courses</h2>
      <div className="p-4">
        <div className="space-y-4">
          {Object.entries(coursesByName).map(([courseName, coursesList]) => (
            <div
              key={courseName}
              className="border-b pb-3 last:border-b-0 last:pb-0"
            >
              <h3 className="font-medium text-gray-800 mb-1">{courseName}</h3>
              <ul className="space-y-1">
                {coursesList.map((course) => (
                  <li
                    key={course.id}
                    className="text-sm text-gray-600 flex justify-between"
                  >
                    <span>{course.type}</span>
                    <span className="text-gray-500">{course.teacher}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPanel;
