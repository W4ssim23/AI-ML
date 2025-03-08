const directions = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

function initialMaze(width = 10, height = 10) {
  return {
    state: Array(height)
      .fill()
      .map(() =>
        Array(width)
          .fill()
          .map(() => ({
            visited: false,
            walls: [true, true, true, true],
          }))
      ),
    width: width,
    height: height,
  };
}

function getNeighbors(x, y, maze) {
  const canVisit = [];
  for (const [dx, dy] of directions) {
    if (
      0 <= x + dx &&
      x + dx < maze.height &&
      0 <= y + dy &&
      y + dy < maze.width
    ) {
      if (maze.state[x + dx][y + dy].visited === false) {
        canVisit.push([x + dx, y + dy]);
      }
    }
  }
  return canVisit;
}

function newWalls(currentCell, x, y, adjX, adjY) {
  const walls = currentCell.walls;
  if (x === adjX && y < adjY) {
    // right
    walls[0] = false;
  }
  if (x === adjX && y > adjY) {
    // left
    walls[1] = false;
  }
  if (x < adjX && y === adjY) {
    // down
    walls[2] = false;
  }
  if (x > adjX && y === adjY) {
    // up
    walls[3] = false;
  }
  return walls;
}

function generateMaze(height = 10, width = 10, start = [0, 0]) {
  const maze = initialMaze(width, height);
  const stack = [start];

  const startTime = Date.now();

  while (stack.length > 0) {
    const current = stack.pop();
    const [x, y] = current;
    maze.state[x][y].visited = true;
    const adjs = getNeighbors(x, y, maze);

    if (adjs.length > 0) {
      const adj = adjs[Math.floor(Math.random() * adjs.length)];
      const [adjX, adjY] = adj;
      maze.state[x][y].walls = newWalls(maze.state[x][y], x, y, adjX, adjY);
      maze.state[adjX][adjY].walls = newWalls(
        maze.state[adjX][adjY],
        adjX,
        adjY,
        x,
        y
      );
      stack.push([x, y]);
      stack.push([adjX, adjY]);
    }
  }

  const endTime = Date.now();

  return [maze, (endTime - startTime) / 1000];
}

function getReachableNeighbours(maze, cred) {
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]; // right left down up
  const [i, j] = cred;
  const canVisit = [];

  for (let idx = 0; idx < maze.state[i][j].walls.length; idx++) {
    if (maze.state[i][j].walls[idx] === false) {
      const [x, y] = directions[idx];
      canVisit.push([x + i, y + j]);
    }
  }

  return canVisit;
}

function euclidianDistanceHeuristic(a, b) {
  return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2));
}

function manhattanDistanceHeuristic(a, b) {
  return Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
}

// Agents

function bfsAgent(maze, start, end, withSteps = false) {
  const visited = new Set();
  const queue = [[start]];

  const steps = []; // has nothing to do with the algorithm, just for visualization
  const startTime = Date.now();

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];
    steps.push([...path]);

    const nodeStr = JSON.stringify(node); // for Set comparison

    if (!visited.has(nodeStr)) {
      visited.add(nodeStr);

      if (node[0] === end[0] && node[1] === end[1]) {
        const endTime = Date.now();
        if (!withSteps) {
          return {
            path: path,
            time: (endTime - startTime) / 1000,
            visited: Array.from(visited).map((v) => JSON.parse(v)),
          };
        }
        return {
          path: path,
          time: (endTime - startTime) / 1000,
          visited: Array.from(visited).map((v) => JSON.parse(v)),
          steps: steps,
        };
      }

      const neighbours = getReachableNeighbours(maze, node);
      for (const neighbour of neighbours) {
        const neighbourStr = JSON.stringify(neighbour);
        if (!visited.has(neighbourStr)) {
          const newPath = [...path];
          newPath.push(neighbour);
          queue.push(newPath);
        }
      }
    }
  }

  return null;
}

function dfsAgent(maze, start, end, withSteps = false) {
  const visited = new Set();
  const stack = [[start]];

  const steps = [];
  const startTime = Date.now();

  while (stack.length > 0) {
    const path = stack.pop();
    const node = path[path.length - 1];
    steps.push([...path]);

    const nodeStr = JSON.stringify(node); // for Set comparison

    if (!visited.has(nodeStr)) {
      visited.add(nodeStr);

      if (node[0] === end[0] && node[1] === end[1]) {
        const endTime = Date.now();
        if (!withSteps) {
          return {
            path: path,
            time: (endTime - startTime) / 1000,
            visited: Array.from(visited).map((v) => JSON.parse(v)),
          };
        }
        return {
          path: path,
          time: (endTime - startTime) / 1000,
          visited: Array.from(visited).map((v) => JSON.parse(v)),
          steps: steps,
        };
      }

      const neighbours = getReachableNeighbours(maze, node);
      for (const neighbour of neighbours) {
        const neighbourStr = JSON.stringify(neighbour);
        if (!visited.has(neighbourStr)) {
          const newPath = [...path];
          newPath.push(neighbour);
          stack.push(newPath);
        }
      }
    }
  }

  return null;
}

function aStarAgent(maze, start, end, heuristic, withSteps = false) {
  class PriorityQueue {
    constructor() {
      this.elements = [];
    }

    push(item, priority) {
      this.elements.push({ item, priority });
      this.elements.sort((a, b) => a.priority - b.priority);
    }

    pop() {
      return this.elements.shift().item;
    }

    isEmpty() {
      return this.elements.length === 0;
    }
  }

  const gScore = new Map();
  const openSet = new PriorityQueue();
  const visited = new Set();

  gScore.set(JSON.stringify(start), 0);
  openSet.push([heuristic(start, end), start, [start]], heuristic(start, end));

  const startTime = Date.now();
  const steps = [];

  while (!openSet.isEmpty()) {
    const [f, current, path] = openSet.pop();
    steps.push([...path]);

    const currentStr = JSON.stringify(current);

    if (current[0] === end[0] && current[1] === end[1]) {
      const endTime = Date.now();
      if (!withSteps) {
        return {
          path: path,
          time: (endTime - startTime) / 1000,
          visited: Array.from(visited).map((v) => JSON.parse(v)),
        };
      }
      return {
        path: path,
        time: (endTime - startTime) / 1000,
        visited: Array.from(visited).map((v) => JSON.parse(v)),
        steps: steps,
      };
    }

    if (visited.has(currentStr)) {
      continue;
    }

    visited.add(currentStr);

    for (const neighbor of getReachableNeighbours(maze, current)) {
      const neighborStr = JSON.stringify(neighbor);

      const tentativeG = gScore.get(currentStr) + 1;

      if (!gScore.has(neighborStr) || tentativeG < gScore.get(neighborStr)) {
        gScore.set(neighborStr, tentativeG);

        const h = heuristic(neighbor, end);
        const f = tentativeG + h;
        openSet.push([f, neighbor, [...path, neighbor]], f);
      }
    }
  }

  return null;
}

export {
  bfsAgent,
  dfsAgent,
  generateMaze,
  aStarAgent,
  manhattanDistanceHeuristic,
  euclidianDistanceHeuristic,
};
