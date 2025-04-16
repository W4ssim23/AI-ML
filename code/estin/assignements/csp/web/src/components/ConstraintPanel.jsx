import useConstraints from "../hooks/useConstraints";

const ConstraintPanel = () => {
  const [constraints, setConstraints] = useConstraints();

  const toggleConstraint = (type, id) => {
    setConstraints((prev) => {
      const updatedConstraints = { ...prev };
      const constraintIndex = updatedConstraints[type].findIndex(
        (c) => c.id === id
      );
      if (constraintIndex !== -1) {
        updatedConstraints[type][constraintIndex] = {
          ...updatedConstraints[type][constraintIndex],
          enabled: !updatedConstraints[type][constraintIndex].enabled,
        };
      }
      return updatedConstraints;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <h2 className="text-xl font-semibold p-4 border-b">Constraints</h2>
      <div className="p-4">
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Hard Constraints</h3>
          <ul className="space-y-2">
            {constraints.hardConstraints.map((constraint) => (
              <li key={constraint.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`hard-${constraint.id}`}
                  checked={constraint.enabled}
                  onChange={() =>
                    toggleConstraint("hardConstraints", constraint.id)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`hard-${constraint.id}`}
                  className="ml-2 text-sm text-gray-600"
                >
                  {constraint.name}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-2">Soft Constraints</h3>
          <ul className="space-y-2">
            {constraints.softConstraints.map((constraint) => (
              <li key={constraint.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`soft-${constraint.id}`}
                  checked={constraint.enabled}
                  onChange={() =>
                    toggleConstraint("softConstraints", constraint.id)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`soft-${constraint.id}`}
                  className="ml-2 text-sm text-gray-600"
                >
                  {constraint.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConstraintPanel;
