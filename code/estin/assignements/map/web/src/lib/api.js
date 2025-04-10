import axios from "axios";

export async function fetchRoute(start, end) {
  try {
    const response = await axios.get(`/api/routing`, {
      params: {
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching route:", error);
    throw new Error("Failed to fetch route");
  }
}
