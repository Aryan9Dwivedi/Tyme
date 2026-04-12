import { useEffect, useRef } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet.heat";

const CHICAGO_CENTER = [41.8781, -87.6298];

function syncMapViewport(map, points) {
  map.invalidateSize({ pan: false, debounceMoveend: true });

  if (!points.length) {
    map.setView(CHICAGO_CENTER, 11, { animate: false });
    return;
  }

  if (points.length === 1) {
    map.setView([points[0].latitude, points[0].longitude], 11, { animate: false });
    return;
  }

  const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]));
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const latSpan = Math.abs(northEast.lat - southWest.lat);
  const lngSpan = Math.abs(northEast.lng - southWest.lng);
  const minLatSpan = 0.08;
  const minLngSpan = 0.1;

  if (latSpan < minLatSpan || lngSpan < minLngSpan) {
    const center = bounds.getCenter();
    const expandedBounds = L.latLngBounds(
      [center.lat - Math.max(latSpan / 2, minLatSpan / 2), center.lng - Math.max(lngSpan / 2, minLngSpan / 2)],
      [center.lat + Math.max(latSpan / 2, minLatSpan / 2), center.lng + Math.max(lngSpan / 2, minLngSpan / 2)],
    );
    map.fitBounds(expandedBounds.pad(0.28), { animate: false });
  } else {
    map.fitBounds(bounds.pad(0.24), { animate: false });
  }

  if (map.getZoom() > 12) {
    map.setZoom(12, { animate: false });
  }
}

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
        radius: 30,
        blur: 26,
        maxZoom: 16,
        minOpacity: 0.4,
        max: strongestWeight,
        gradient: {
          0.2: "#fecaca",
          0.45: "#f87171",
          0.7: "#dc2626",
          1: "#7f1d1d",
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
    const container = map.getContainer();
    let animationFrameId = 0;
    const timeoutId = window.setTimeout(() => {
      syncMapViewport(map, points);
    }, 0);

    const queueSync = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        syncMapViewport(map, points);
      });
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            queueSync();
          })
        : null;

    resizeObserver?.observe(container);
    window.addEventListener("resize", queueSync);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", queueSync);
      resizeObserver?.disconnect();
    };
  }, [map, points]);

  return null;
}

export default function CaptainDemandMap({ points }) {
  return (
    <MapContainer
      center={CHICAGO_CENTER}
      zoom={11}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      preferCanvas
      className="h-full w-full bg-[#f5f1ed]"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        detectRetina
        keepBuffer={4}
        updateWhenIdle={false}
        subdomains="abcd"
      />
      <DemandHeatLayer points={points} />
      <DemandViewport points={points} />
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.latitude, point.longitude]}
          radius={Math.max(8, Math.min(16, 5 + point.demand_score * 1.4))}
          pathOptions={{
            color: "#991b1b",
            fillColor: "#dc2626",
            fillOpacity: 0.42,
            weight: 1.25,
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
