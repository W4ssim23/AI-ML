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

const hamiltonCycle = (cellsOnX, cellsOnY) => {
  const grid = Array.from({ length: cellsOnY }, () =>
    Array.from({ length: cellsOnX }, () => false)
  );

  let counter = 1;

  grid[0][0] = 0;

  for (let y = 0; y < cellsOnY; y++) {
    if (y % 2 === 0) {
      for (let x = 1; x < cellsOnX; x++) {
        grid[y][x] = counter++;
      }
    } else {
      for (let x = cellsOnX - 1; x > 0; x--) {
        grid[y][x] = counter++;
      }
    }
  }

  for (let y = cellsOnY - 1; y > 0; y--) grid[y][0] = counter++;

  const positions = new Map();
  for (let y = 0; y < cellsOnY; y++) {
    for (let x = 0; x < cellsOnX; x++) {
      positions.set(grid[y][x], [x, y]);
    }
  }

  const path = [];
  const totalCells = cellsOnX * cellsOnY;

  for (let i = 0; i < totalCells; i++) {
    const [x, y] = positions.get(i);
    path.push([x * 20, y * 20]);
  }

  path.push(path[0]);

  return path;
};

const nextHamiltonBlock = (a, cycle) => {
  const currentIndex = cycle.findIndex(
    (val) => val[0] === a[0] && val[1] === a[1]
  );
  if (currentIndex < cycle.length - 1) return cycle[currentIndex + 1];
  return cycle[0];
};

const takeShortcut = (shortCut, cycle, arena) => {
  const { head, body } = arena;
  const tail = body[body.length - 1];

  if (body.some((val) => val[0] === shortCut[0] && val[1] === shortCut[1])) {
    return false;
  }

  const headIndex = cycle.findIndex(
    (val) => val[0] === head[0] && val[1] === head[1]
  );
  const tailIndex = cycle.findIndex(
    (val) => val[0] === tail[0] && val[1] === tail[1]
  );
  const shortCutIndex = cycle.findIndex(
    (val) => val[0] === shortCut[0] && val[1] === shortCut[1]
  );

  if (headIndex === -1 || tailIndex === -1 || shortCutIndex === -1) {
    console.log("failed to get indexes");
    return false;
  }

  if (tailIndex > headIndex) {
    return shortCutIndex > headIndex && shortCutIndex + 1 < tailIndex;
  } else {
    if (shortCutIndex > headIndex) {
      return shortCutIndex + 1 < cycle.length || tailIndex > 0;
    } else {
      return shortCutIndex + 1 < tailIndex;
    }
  }
};

const agent = (currentDirection, fruit, arena, cycle) => {
  const start = arena.head;
  const end = fruit;

  try {
    const path = a_star(start, end, arena);
    let nextDirection = currentDirection;

    if (
      path &&
      path.length >= 2 &&
      getDirection(arena.head, path[1]) &&
      takeShortcut(path[1], cycle, arena)
    )
      nextDirection = getDirection(arena.head, path[1]);
    else
      nextDirection = getDirection(arena.head, nextHamiltonBlock(start, cycle));

    return nextDirection;
  } catch (error) {
    console.error("Error in agent:", error);
    return currentDirection;
  }
};

export { agent, hamiltonCycle };
