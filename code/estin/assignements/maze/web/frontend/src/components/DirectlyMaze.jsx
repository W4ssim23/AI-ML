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

export default function DirectlyMaze() {
  // temp till the state management is implemented
  const [maze, _] = useMaze();

  console.log(maze);

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
          {/* draw cell  */}
          {maze.state.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <rect
                key={`rect-${rowIndex}-${colIndex}`}
                x={colIndex * CELL_SIZE}
                y={rowIndex * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={getCellColor(rowIndex, colIndex, maze.path, maze.visited)}
              />
            ))
          )}

          {/* draw walls */}
          {maze.state.map((row, rowIndex) =>
            row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
          )}
        </svg>

        {/* Status indicator */}
        {/* <div className="mt-4 text-center font-semibold">
          {gameStatus === "generating" && "Generating maze..."}
          {gameStatus === "solving" && "Solving maze..."}
          {gameStatus === "racing" && "Racing algorithms..."}
          {gameStatus === "won" && "You reached the goal! Congratulations!"}
          {gameStatus === "error" && "An error occurred!"}
        </div> */}
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
