import { useEffect, useRef } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const CHICAGO_CENTER = [41.8781, -87.6298];

function DemandHeatLayer({ points }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!points.length) {
      return undefined;
    }

    const strongestWeight = points.reduce(
      (highestWeight, point) => Math.max(highestWeight, point.map_weight || 1),
      1,
    );

    layerRef.current = L.heatLayer(
      points.map((point) => [point.latitude, point.longitude, point.map_weight || 1]),
      {
        radius: 28,
        blur: 24,
        maxZoom: 16,
        minOpacity: 0.35,
        max: strongestWeight,
        gradient: {
          0.25: "#67e8f9",
          0.45: "#14b8a6",
          0.7: "#f59e0b",
          1: "#ef4444",
        },
      },
    );

    layerRef.current.addTo(map);

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points]);

  return null;
}

function DemandViewport({ points }) {
  const map = useMap();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      map.invalidateSize();

      if (!points.length) {
        map.setView(CHICAGO_CENTER, 11, { animate: false });
        return;
      }

      if (points.length === 1) {
        map.setView([points[0].latitude, points[0].longitude], 13, { animate: false });
        return;
      }

      const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]));
      map.fitBounds(bounds.pad(0.18), { animate: false });
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [map, points]);

  return null;
}

export default function CaptainDemandMap({ points }) {
  return (
    <MapContainer
      center={CHICAGO_CENTER}
      zoom={11}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DemandHeatLayer points={points} />
      <DemandViewport points={points} />
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.latitude, point.longitude]}
          radius={Math.max(8, Math.min(18, 6 + point.demand_score * 1.6))}
          pathOptions={{
            color: "#0f766e",
            fillColor: "#14b8a6",
            fillOpacity: 0.3,
            weight: 1.5,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-900">{point.label}</div>
              <div className="text-xs text-slate-700">
                {point.active_jobs} live jobs | {point.reward_pool} TB pool
              </div>
              <div className="text-xs text-slate-700">
                Demand score {point.demand_score} | {point.freshest_request_mins_ago}m ago
              </div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
