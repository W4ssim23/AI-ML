import React, { useState, useEffect } from "react";
import mousestanding from "../assets/mousestanding.svg";
import cheese from "../assets/cheese.svg";

const CELL_SIZE = 30;
const COLORS = {
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  RED: "#FF0000",
  GREEN: "#00FF00",
  BLUE: "#0000FF",
  GRAY: "#808080",
  LIGHT_GRAY: "#C8C8C8",
  YELLOW: "#FFFF00",
  PURPLE: "#800080",
  ORANGE: "#FFA500",
};

export default function StepsMazeRace({ m }) {
  const [maze, _] = useState(m);

  const [currentPath, setCurrentPath] = useState(maze.steps[0]);
  const [currentVisited, setCurrentVisited] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setCurrentPath(maze.steps[0]);
    setCurrentVisited([]);
    setFinished(false);
    let index = 0;
    const interval = setInterval(() => {
      setCurrentPath(maze.steps[index]);
      if (index !== 0) {
        setCurrentVisited((prevVisited) => [
          ...prevVisited,
          ...maze.steps[index - 1],
        ]);
      }
      index++;
      if (index === maze.steps.length) {
        clearInterval(interval);
        setFinished(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [maze]);

  const isInPath = (row, col, path) => {
    return path.some((pos) => pos[0] === row && pos[1] === col);
  };

  const isVisited = (row, col, visited) => {
    return visited.some((pos) => pos[0] === row && pos[1] === col);
  };

  const getCellColor = (row, col, path, visited) => {
    if (row === maze.start[0] && col === maze.start[1]) return COLORS.GREEN;
    if (row === maze.end[0] && col === maze.end[1]) return COLORS.RED;
    if (isInPath(row, col, path)) return COLORS.ORANGE;
    if (isVisited(row, col, visited)) return COLORS.LIGHT_GRAY;
    return COLORS.WHITE;
  };

  return (
    <>
      <div className="relative">
        <svg
          width={maze.width * CELL_SIZE}
          height={maze.height * CELL_SIZE}
          className=" border-black border-2"
        >
          {/*  cells  */}
          {maze.state.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <rect
                key={`rect-${rowIndex}-${colIndex}`}
                x={colIndex * CELL_SIZE}
                y={rowIndex * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={getCellColor(
                  rowIndex,
                  colIndex,
                  currentPath,
                  currentVisited
                )}
              />
            ))
          )}

          {/* walls */}
          {maze.state.map((row, rowIndex) =>
            row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
          )}

          {/* mouse */}
          {renderMouse(
            currentPath[currentPath.length - 1][1] * CELL_SIZE + CELL_SIZE / 2,
            currentPath[currentPath.length - 1][0] * CELL_SIZE + CELL_SIZE / 2
          )}

          {/* cheese */}
          {renderCheese(
            maze.end[1] * CELL_SIZE + CELL_SIZE / 2,
            maze.end[0] * CELL_SIZE + CELL_SIZE / 2,
            finished
          )}
        </svg>
      </div>
    </>
  );
}

const renderCell = (cell, row, col) => {
  const x = col * CELL_SIZE;
  const y = row * CELL_SIZE;
  const walls = [];

  // Top
  if (cell.walls[3]) {
    walls.push(
      <line
        key={`${row}-${col}-top`}
        x1={x}
        y1={y}
        x2={x + CELL_SIZE}
        y2={y}
        stroke={COLORS.BLACK}
        strokeWidth={2}
      />
    );
  }

  // Right
  if (cell.walls[0]) {
    walls.push(
      <line
        key={`${row}-${col}-right`}
        x1={x + CELL_SIZE}
        y1={y}
        x2={x + CELL_SIZE}
        y2={y + CELL_SIZE}
        stroke={COLORS.BLACK}
        strokeWidth={2}
      />
    );
  }

  // Bottom
  if (cell.walls[2]) {
    walls.push(
      <line
        key={`${row}-${col}-bottom`}
        x1={x}
        y1={y + CELL_SIZE}
        x2={x + CELL_SIZE}
        y2={y + CELL_SIZE}
        stroke={COLORS.BLACK}
        strokeWidth={2}
      />
    );
  }

  // Left
  if (cell.walls[1]) {
    walls.push(
      <line
        key={`${row}-${col}-left`}
        x1={x}
        y1={y}
        x2={x}
        y2={y + CELL_SIZE}
        stroke={COLORS.BLACK}
        strokeWidth={2}
      />
    );
  }

  return walls;
};

const renderMouse = (x, y) => {
  return (
    <g transform={`translate(${x - 10}, ${y - 10})`}>
      <image href={mousestanding} width="20" height="20" />
    </g>
  );
};

const renderCheese = (x, y, eaten = false) => {
  if (eaten) return null;
  return (
    <g transform={`translate(${x - 10}, ${y - 10})`}>
      <image href={cheese} width="20" height="20" />
    </g>
  );
};
