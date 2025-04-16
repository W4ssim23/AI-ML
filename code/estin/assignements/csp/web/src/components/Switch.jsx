import { useState } from "react";

export default function Switch({ onClick = () => {} }) {
  const [isOn, setIsOn] = useState(false);

  const toggleSwitch = () => {
    const newState = !isOn;
    onClick(newState);
    setIsOn(newState);
  };

  return (
    <button
      onClick={toggleSwitch}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
        isOn ? "bg-blue-600" : "bg-gray-200"
      }`}
      aria-pressed={isOn}
      aria-label="Toggle switch"
    >
      <span className="sr-only">{isOn ? "On" : "Off"}</span>
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isOn ? "translate-x-9" : "translate-x-1"
        }`}
      />
    </button>
  );
}
