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

class TableCell {
  constructor() {
    this.idx = null;
    this.direc = null;
  }
  reset() {
    this.idx = null;
    this.direc = null;
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

const hamiltonCycle = (cellsOnX, cellsOnY, cellSize = 20) => {
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
    path.push([x * cellSize, y * cellSize]);
  }

  path.cellsOnX = cellsOnX;
  path.cellsOnY = cellsOnY;
  return path;
};

const nextHamiltonBlock = (a, cycle) => {
  const currentIndex = cycle.findIndex(
    (val) => val[0] === a[0] && val[1] === a[1]
  );
  if (currentIndex === -1) return null;
  const nextIndex = (currentIndex + 1) % cycle.length;
  return cycle[nextIndex];
};

const relativeDistance = (a, b, len) => {
  if (a > b) b += len;
  return b - a;
};

const takeShortCut = (fruit, cycle, arena) => {
  const { head, body } = arena;
  const tail = body[body.length - 1];
  const next = nextHamiltonBlock(head, cycle);

  const headIndex = cycle.findIndex(
    (val) => val[0] === head[0] && val[1] === head[1]
  );
  const tailIndex = cycle.findIndex(
    (val) => val[0] === tail[0] && val[1] === tail[1]
  );
  const fruitIndex = cycle.findIndex(
    (val) => val[0] === fruit[0] && val[1] === fruit[1]
  );
  const nextIndex = cycle.findIndex(
    (val) => val[0] === next[0] && val[1] === next[1]
  );

  if (
    headIndex === -1 ||
    tailIndex === -1 ||
    nextIndex === -1 ||
    fruitIndex === -1
  ) {
    return false;
  }

  const len = cycle.length;
  const head_rel = relativeDistance(tailIndex, headIndex, len);
  const fruit_rel = relativeDistance(tailIndex, fruitIndex, len);
  const next_rel = relativeDistance(tailIndex, nextIndex, len);

  // return next_rel > head_rel && next_rel <= fruit_rel;
  return next_rel > head_rel;
};

const agent = (currentDirection, fruit, arena, cycle) => {
  const start = arena.head;
  const end = fruit;

  try {
    const path = a_star(start, end, arena);
    let nextDirection = currentDirection;

    const cellsOnX = cycle.cellsOnX;
    const cellsOnY = cycle.cellsOnY;
    const mapCapacity = cellsOnX * cellsOnY;
    const snakeLen = arena.body.length;
    const shouldCheckShortcut = snakeLen < 0.5 * mapCapacity;

    let allowShortcut = shouldCheckShortcut;
    if (shouldCheckShortcut && path && path.length === 1) {
      const tail = arena.body[arena.body.length - 1];
      const dx = Math.abs(fruit[0] - tail[0]);
      const dy = Math.abs(fruit[1] - tail[1]);
      const isAdjacent =
        (dx === arena.cellSize && dy === 0) ||
        (dy === arena.cellSize && dx === 0);
      if (isAdjacent) {
        allowShortcut = false;
      }
    }

    if (allowShortcut && path && path.length >= 2) {
      const nextDir = getDirection(arena.head, path[1]);
      if (nextDir && takeShortCut(fruit, cycle, arena)) {
        nextDirection = nextDir;
      } else {
        const nextBlock = nextHamiltonBlock(start, cycle);
        nextDirection = getDirection(arena.head, nextBlock);
      }
    } else {
      const nextBlock = nextHamiltonBlock(start, cycle);
      nextDirection = getDirection(arena.head, nextBlock);
    }

    return nextDirection;
  } catch (error) {
    return currentDirection;
  }
};

export { agent, hamiltonCycle };
