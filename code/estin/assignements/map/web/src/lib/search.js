import { haversineDistance } from "@/lib/haversine";

// temp
const ANNABA_GRAPH = {
  node1: {
    id: "node1",
    position: { lat: 36.9, lng: 7.76 },
    connections: ["node2", "node3", "node7"],
  },
  node2: {
    id: "node2",
    position: { lat: 36.91, lng: 7.75 },
    connections: ["node1", "node4", "node8"],
  },
  node3: {
    id: "node3",
    position: { lat: 36.89, lng: 7.77 },
    connections: ["node1", "node5", "node9"],
  },
  node4: {
    id: "node4",
    position: { lat: 36.92, lng: 7.74 },
    connections: ["node2", "node6", "node10"],
  },
  node5: {
    id: "node5",
    position: { lat: 36.88, lng: 7.78 },
    connections: ["node3", "node6", "node11"],
  },
  node6: {
    id: "node6",
    position: { lat: 36.89, lng: 7.74 },
    connections: ["node4", "node5", "node12"],
  },
  node7: {
    id: "node7",
    position: { lat: 36.905, lng: 7.765 },
    connections: ["node1", "node8", "node13"],
  },
  node8: {
    id: "node8",
    position: { lat: 36.915, lng: 7.755 },
    connections: ["node2", "node7", "node14"],
  },
  node9: {
    id: "node9",
    position: { lat: 36.895, lng: 7.775 },
    connections: ["node3", "node10", "node15"],
  },
  node10: {
    id: "node10",
    position: { lat: 36.925, lng: 7.745 },
    connections: ["node4", "node9", "node16"],
  },
  node11: {
    id: "node11",
    position: { lat: 36.885, lng: 7.785 },
    connections: ["node5", "node12", "node17"],
  },
  node12: {
    id: "node12",
    position: { lat: 36.895, lng: 7.745 },
    connections: ["node6", "node11", "node18"],
  },
  node13: {
    id: "node13",
    position: { lat: 36.907, lng: 7.767 },
    connections: ["node7", "node14", "node19"],
  },
  node14: {
    id: "node14",
    position: { lat: 36.917, lng: 7.757 },
    connections: ["node8", "node13", "node20"],
  },
  node15: {
    id: "node15",
    position: { lat: 36.897, lng: 7.777 },
    connections: ["node9", "node16"],
  },
  node16: {
    id: "node16",
    position: { lat: 36.927, lng: 7.747 },
    connections: ["node10", "node15"],
  },
  node17: {
    id: "node17",
    position: { lat: 36.887, lng: 7.787 },
    connections: ["node11", "node18"],
  },
  node18: {
    id: "node18",
    position: { lat: 36.897, lng: 7.747 },
    connections: ["node12", "node17"],
  },
  node19: {
    id: "node19",
    position: { lat: 36.908, lng: 7.768 },
    connections: ["node13", "node20"],
  },
  node20: {
    id: "node20",
    position: { lat: 36.918, lng: 7.758 },
    connections: ["node14", "node19"],
  },
};

class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element, priority) {
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (priority < this.items[i].priority) {
        this.items.splice(i, 0, { element, priority });
        added = true;
        break;
      }
    }
    if (!added) {
      this.items.push({ element, priority });
    }
  }

  dequeue() {
    return this.items.shift()?.element;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

function findClosestNode(point) {
  let closestNode = "";
  let minDistance = Infinity;

  for (const nodeId in ANNABA_GRAPH) {
    const node = ANNABA_GRAPH[nodeId];
    const distance = haversineDistance(point, node.position);

    if (distance < minDistance) {
      minDistance = distance;
      closestNode = nodeId;
    }
  }

  return closestNode;
}

function aStarSearch(start, goal) {
  const openSet = new PriorityQueue();
  openSet.enqueue(start, 0);

  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  for (const nodeId in ANNABA_GRAPH) {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  }

  gScore[start] = 0;
  fScore[start] = haversineDistance(
    ANNABA_GRAPH[start].position,
    ANNABA_GRAPH[goal].position
  );

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    if (!current) break;

    if (current === goal) {
      const path = [];
      let currentNode = current;

      while (currentNode) {
        path.unshift(ANNABA_GRAPH[currentNode].position);
        currentNode = cameFrom[currentNode];
      }

      let totalDistance = 0;
      for (let i = 0; i < path.length - 1; i++) {
        totalDistance += haversineDistance(path[i], path[i + 1]);
      }

      const walkingSpeedKmPerHour = 5;
      const durationHours = totalDistance / walkingSpeedKmPerHour;
      const durationMinutes = durationHours * 60;

      return {
        path,
        distance: totalDistance,
        duration: durationMinutes,
      };
    }

    for (const neighborId of ANNABA_GRAPH[current].connections) {
      const tentativeGScore =
        gScore[current] +
        haversineDistance(
          ANNABA_GRAPH[current].position,
          ANNABA_GRAPH[neighborId].position
        );

      if (tentativeGScore < gScore[neighborId]) {
        cameFrom[neighborId] = current;
        gScore[neighborId] = tentativeGScore;
        fScore[neighborId] =
          tentativeGScore +
          haversineDistance(
            ANNABA_GRAPH[neighborId].position,
            ANNABA_GRAPH[goal].position
          );

        openSet.enqueue(neighborId, fScore[neighborId]);
      }
    }
  }

  return null;
}

function validateParams(params) {
  const required = ["startLat", "startLng", "endLat", "endLng"];
  return required.every(
    (key) => params[key] !== undefined && !isNaN(parseFloat(params[key]))
  );
}

export { findClosestNode, aStarSearch, validateParams };
