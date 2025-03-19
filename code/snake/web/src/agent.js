// priority queu
class Heapq {
  constructor() {
    this.value = [];
  }
  push(val, p) {
    this.value.push({ val, p });
    this.value.sort((obj1, obj2) => obj1.p - obj2.p);
  }
  pop() {
    return this.value.shift().val;
  }
  isEmpty() {
    return this.value.length === 0;
  }
}

const getReachableNeighbours = (arena) => {
  const { head, body, cellSize, cellsOnX, cellsOnY } = arena;

  const neighbours = [
    [head[0] + cellSize, head[1]], // right
    [head[0] - cellSize, head[1]], // left
    [head[0], head[1] + cellSize], // down
    [head[0], head[1] - cellSize], // up
  ];

  return neighbours.filter(
    (val) =>
      0 <= val[0] &&
      val[0] < cellSize * cellsOnX &&
      0 <= val[1] &&
      val[1] < cellSize * cellsOnY &&
      !body.some((part) => part[0] === val[0] && part[1] === val[1])
  );
};

const heuristic = (a, b) => {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
};

const a_star = (start, end, arena) => {
  console.log(start, end, arena);
  const gScore = new Map();
  const openSet = new Heapq();
  const visited = new Set();

  gScore.set(JSON.stringify(start), 0);
  openSet.push([heuristic(start, end), start, [start]], heuristic(start, end));

  while (!openSet.isEmpty()) {
    const [f, current, path] = openSet.pop();

    const currentStr = JSON.stringify(current);

    if (current[0] === end[0] && current[1] === end[1]) return path;

    if (visited.has(currentStr)) continue;

    visited.add(currentStr);

    const updatedArena = {
      ...arena,
      head: current,
    };

    const neighbors = getReachableNeighbours(updatedArena);

    for (const neighbor of neighbors) {
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
};

const getDirection = (current, next) => {
  if (current[1] > next[1] && current[0] === next[0]) return "up";
  if (current[1] < next[1] && current[0] === next[0]) return "down";
  if (current[1] === next[1] && current[0] < next[0]) return "right";
  if (current[1] === next[1] && current[0] > next[0]) return "left";
  return null;
};

// temp agent till upgrading with the hamlton solution
const agent = (currentDirection, fruit, arena) => {
  const start = arena.head;
  const end = fruit;

  try {
    const path = a_star(start, end, arena);
    let nextDirection = currentDirection;

    if (path && path.length >= 2 && getDirection(arena.head, path[1])) {
      nextDirection = getDirection(arena.head, path[1]);
    }

    return nextDirection;
  } catch (error) {
    console.error("Error in agent:", error);
    return currentDirection;
  }
};

export { agent };
