import React from "react";
import useMaze from "../hooks/useMaze";

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

export default function Maze() {
  const [maze, _] = useMaze();

  const getCellColor = (row, col) => {
    if (row === maze.start[0] && col === maze.start[1]) return COLORS.GREEN;
    if (row === maze.end[0] && col === maze.end[1]) return COLORS.RED;
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
          {/* draw cell  */}
          {maze.state.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <rect
                key={`rect-${rowIndex}-${colIndex}`}
                x={colIndex * CELL_SIZE}
                y={rowIndex * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={getCellColor(rowIndex, colIndex)}
              />
            ))
          )}

          {/* draw walls */}
          {maze.state.map((row, rowIndex) =>
            row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
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
