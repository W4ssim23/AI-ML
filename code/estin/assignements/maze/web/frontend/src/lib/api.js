import {
  bfsAgent,
  dfsAgent,
  generateMaze,
  aStarAgent,
  manhattanDistanceHeuristic,
} from "./agents.js";

function createMaze(options = {}) {
  try {
    const width = options.width || 15;
    const height = options.height || 15;
    const start = options.start || [0, 0];

    // Validate inputs
    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width <= 0 ||
      height <= 0
    ) {
      throw new Error("Width and height must be positive integers");
    }

    if (
      !Array.isArray(start) ||
      start.length !== 2 ||
      !start.every((x) => Number.isInteger(x))
    ) {
      throw new Error("Start must be an array of two integers");
    }

    if (
      start[0] < 0 ||
      start[0] >= height ||
      start[1] < 0 ||
      start[1] >= width
    ) {
      throw new Error("Start position is out of bounds");
    }

    const [maze, time] = generateMaze(height, width, start);

    return {
      state: maze["state"],
      start: start,
      width: width,
      height: height,
      time: time,
      end: [height - 1, width - 1],
    };
  } catch (error) {
    return {
      error: "Maze generation failed",
      message: error.message,
    };
  }
}

function solveMaze(options = {}) {
  try {
    const { maze, start, end, algorithm = "bfs", withSteps = false } = options;

    // Validate inputs
    if (!maze || !start || !end) {
      throw new Error("Maze, start, and end are required");
    }

    if (
      !Array.isArray(start) ||
      start.length !== 2 ||
      !start.every((x) => Number.isInteger(x))
    ) {
      throw new Error("Start must be an array of two integers");
    }

    if (
      !Array.isArray(end) ||
      end.length !== 2 ||
      !end.every((x) => Number.isInteger(x))
    ) {
      throw new Error("End must be an array of two integers");
    }

    if (!["bfs", "dfs", "astar"].includes(algorithm.toLowerCase())) {
      throw new Error("Algorithm must be one of 'bfs', 'dfs', or 'astar'");
    }

    if (typeof withSteps !== "boolean") {
      throw new Error("withSteps must be a boolean");
    }

    let result;
    if (algorithm.toLowerCase() === "bfs") {
      result = bfsAgent(maze, start, end, withSteps);
    } else if (algorithm.toLowerCase() === "dfs") {
      result = dfsAgent(maze, start, end, withSteps);
    } else if (algorithm.toLowerCase() === "astar") {
      result = aStarAgent(
        maze,
        start,
        end,
        manhattanDistanceHeuristic,
        withSteps
      );
    }

    if (!result) {
      return { error: "No path found" };
    }

    const response = {
      path: result.path,
      time: result.time,
      visited: result.visited,
      algorithm: algorithm,
      start: start,
      end: end,
      height: maze.height,
      width: maze.width,
      state: maze.state,
    };

    if (withSteps) {
      response.steps = result.steps;
    }

    return response;
  } catch (error) {
    return {
      error: "Maze solving failed",
      message: error.message,
    };
  }
}

function raceMazeAlgorithms(options = {}) {
  try {
    const { maze, start, end, agent1 = "dfs", agent2 = "astar" } = options;

    // Validate inputs
    if (!maze || !start || !end) {
      throw new Error("Maze, start, and end are required");
    }

    if (
      !Array.isArray(start) ||
      start.length !== 2 ||
      !start.every((x) => Number.isInteger(x))
    ) {
      throw new Error("Start must be an array of two integers");
    }

    if (
      !Array.isArray(end) ||
      end.length !== 2 ||
      !end.every((x) => Number.isInteger(x))
    ) {
      throw new Error("End must be an array of two integers");
    }

    if (!["bfs", "dfs", "astar"].includes(agent1.toLowerCase())) {
      throw new Error("Algorithm must be one of 'bfs', 'dfs', or 'astar'");
    }

    if (!["bfs", "dfs", "astar"].includes(agent2.toLowerCase())) {
      throw new Error("Algorithm must be one of 'bfs', 'dfs', or 'astar'");
    }

    let result1, result2;

    if (agent1.toLowerCase() === "bfs") {
      result1 = bfsAgent(maze, start, end, true);
    } else if (agent1.toLowerCase() === "dfs") {
      result1 = dfsAgent(maze, start, end, true);
    } else if (agent1.toLowerCase() === "astar") {
      result1 = aStarAgent(maze, start, end, manhattanDistanceHeuristic, true);
    }

    if (agent2.toLowerCase() === "bfs") {
      result2 = bfsAgent(maze, start, end, true);
    } else if (agent2.toLowerCase() === "dfs") {
      result2 = dfsAgent(maze, start, end, true);
    } else if (agent2.toLowerCase() === "astar") {
      result2 = aStarAgent(maze, start, end, manhattanDistanceHeuristic, true);
    }

    if (!result1 || !result2) {
      return { error: "No path found" };
    }

    const response1 = {
      path: result1.path,
      time: result1.time,
      visited: result1.visited,
      steps: result1.steps,
      algorithm: agent1,
      height: maze.height,
      width: maze.width,
      state: maze.state,
      start: start,
      end: end,
    };

    const response2 = {
      path: result2.path,
      time: result2.time,
      visited: result2.visited,
      steps: result2.steps,
      algorithm: agent2,
      height: maze.height,
      width: maze.width,
      state: maze.state,
      start: start,
      end: end,
    };

    return {
      agent1: response1,
      agent2: response2,
    };
  } catch (error) {
    return {
      error: "Maze solving failed",
      message: error.message,
    };
  }
}

export { createMaze, solveMaze, raceMazeAlgorithms };
