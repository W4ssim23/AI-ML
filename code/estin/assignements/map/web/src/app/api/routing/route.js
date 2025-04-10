import { NextResponse } from "next/server";
import { haversineDistance } from "@/lib/haversine";
import fs from "fs";
import path from "path";

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

let ANNABA_GRAPH;

try {
  const filePath = path.join(
    process.cwd(),
    "./src/app/api/routing/annaba_map_merged.json"
  );
  console.log("Loading graph from:", filePath);
  ANNABA_GRAPH = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  //   console.log("Graph loaded from file:", ANNABA_GRAPH);
} catch (error) {
  console.error("Error reading the graph file:", error);
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

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const query = Object.fromEntries(searchParams.entries());

  if (!validateParams(query)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const startPoint = {
    lat: parseFloat(searchParams.get("startLat") || "0"),
    lng: parseFloat(searchParams.get("startLng") || "0"),
  };

  const endPoint = {
    lat: parseFloat(searchParams.get("endLat") || "0"),
    lng: parseFloat(searchParams.get("endLng") || "0"),
  };

  console.log("executed to this point");

  try {
    const startNodeId = findClosestNode(startPoint);
    const endNodeId = findClosestNode(endPoint);
    const result = aStarSearch(startNodeId, endNodeId);

    // console.log(
    //   "startPoint:",
    //   startPoint,
    //   "endPoint:",
    //   endPoint,
    //   "startId:",
    //   startNodeId,
    //   "endId:",
    //   endNodeId,
    //   "result",
    //   result
    // );

    if (result) {
      return NextResponse.json(result);
    } else {
      console.log("didnt find a path ! ");
      console.log("start and end", startPoint, endPoint);
      console.log("start node & end node ids:", startNodeId, endNodeId);
      return NextResponse.json(
        {
          error: "No path found",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        error: "Failed to find path",
      },
      { status: 500 }
    );
  }
}
