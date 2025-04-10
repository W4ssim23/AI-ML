"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { toast } from "react-toastify";
import { haversineDistance } from "@/lib/haversine";
import { fetchRoute } from "@/lib/api";
import StatusPanel from "./StatusPanel";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icons
const startIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const endIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Coordinates
const ANNABA_CENTER = [36.9, 7.76];
const DEFAULT_ZOOM = 14.2;

// Define the bounds (limits)
const LATITUDE_BOUNDS = [36.91479, 36.93698];
const LONGITUDE_BOUNDS = [7.73897, 7.78986];

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
}

export default function Map({ onStatusChange, onPathFound }) {
  const [markers, setMarkers] = useState([]);
  const [path, setPath] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const resetMap = () => {
    setMarkers([]);
    setPath([]);
    onStatusChange("Click on the map to select start point");
    onPathFound(0, 0);
  };

  const handleMapClick = async (latlng) => {
    if (isLoading) return;

    if (markers.length >= 2) {
      setMarkers([latlng]);
      setPath([]);
      onStatusChange("Select destination point");
      onPathFound(0, 0);
    } else if (markers.length === 0) {
      setMarkers([latlng]);
      onStatusChange("Select destination point");
    } else {
      const updatedMarkers = [...markers, latlng];
      setMarkers(updatedMarkers);
      onStatusChange("Calculating path...");
      setIsLoading(true);

      try {
        const start = {
          lat: updatedMarkers[0].lat,
          lng: updatedMarkers[0].lng,
        };
        const end = { lat: updatedMarkers[1].lat, lng: updatedMarkers[1].lng };

        const result = await fetchRoute(start, end);
        setPath(result.path);
        onStatusChange("Path found!");
        onPathFound(result.distance, result.duration);
      } catch (error) {
        console.error("Error finding path:", error);
        toast.error("Failed to find path. Please try again.");
        onStatusChange("Error finding path. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <StatusPanel
          message={
            isLoading
              ? "Calculating path..."
              : markers.length === 0
              ? "Select start point"
              : markers.length === 1
              ? "Select destination point"
              : "Path found!"
          }
          distance={path.length > 0 ? calculatePathDistance(path) : null}
          duration={path.length > 0 ? calculatePathDuration(path) : null}
          onReset={resetMap}
        />
      </div>

      <MapContainer
        center={ANNABA_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full z-0"
        maxBounds={[
          [LATITUDE_BOUNDS[0], LONGITUDE_BOUNDS[0]],
          [LATITUDE_BOUNDS[1], LONGITUDE_BOUNDS[1]],
        ]}
        maxBoundsViscosity={1.0}
        minZoom={DEFAULT_ZOOM}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            position={marker}
            icon={index === 0 ? startIcon : endIcon}
          />
        ))}

        {path.length > 0 && (
          <Polyline
            positions={path.map((p) => [p.lat, p.lng])}
            color="#3b82f6"
            weight={5}
            opacity={0.7}
          />
        )}

        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>
    </>
  );
}

function calculatePathDistance(path) {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += haversineDistance(path[i], path[i + 1]);
  }
  return totalDistance;
}

function calculatePathDuration(path) {
  const distance = calculatePathDistance(path);
  const walkingSpeedKmPerHour = 5;
  const durationHours = distance / walkingSpeedKmPerHour;
  return durationHours * 60;
}
