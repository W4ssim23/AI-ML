"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import StatusPanel from "@/components/StatusPanel";

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function Home() {
  const [status, setStatus] = useState(
    "Click on the map to select start point"
  );
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="map-container">
        <MapWithNoSSR
          onStatusChange={setStatus}
          onPathFound={(dist, dur) => {
            setDistance(dist);
            setDuration(dur);
          }}
        />
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-1 z-50">
        Made by Zouiten Ouassim
      </div>
    </main>
  );
}
