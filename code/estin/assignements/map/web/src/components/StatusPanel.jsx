import React from "react";

export default function StatusPanel({ message, distance, duration, onReset }) {
  return (
    <div className="status-panel">
      <p className="font-medium">{message}</p>

      {distance !== null && (
        <div className="mt-2 text-sm">
          <p>Distance: {distance.toFixed(2)} km</p>
          {duration !== null && (
            <p>Estimated time: {formatDuration(duration)}</p>
          )}
        </div>
      )}

      {onReset && (
        <button className="reset-button" onClick={onReset}>
          Reset
        </button>
      )}
    </div>
  );
}

function formatDuration(minutes) {
  if (minutes < 1) {
    return "Less than a minute";
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  }

  return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} minute${
    mins !== 1 ? "s" : ""
  }`;
}
