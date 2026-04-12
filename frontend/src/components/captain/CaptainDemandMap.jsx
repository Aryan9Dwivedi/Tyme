import { useEffect, useLayoutEffect, useRef } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet.heat";

const CHICAGO_CENTER = [41.8781, -87.6298];

function syncMapViewport(map, points) {
  map.invalidateSize({ pan: false, debounceMoveend: true });

  if (!points.length) {
    map.setView(CHICAGO_CENTER, 10, { animate: false });
    return;
  }

  if (points.length === 1) {
    map.setView([points[0].latitude, points[0].longitude], 9, { animate: false });
    return;
  }

  const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]));
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const latSpan = Math.abs(northEast.lat - southWest.lat);
  const lngSpan = Math.abs(northEast.lng - southWest.lng);
  const minLatSpan = 0.12;
  const minLngSpan = 0.16;

  if (latSpan < minLatSpan || lngSpan < minLngSpan) {
    const center = bounds.getCenter();
    const expandedBounds = L.latLngBounds(
      [center.lat - Math.max(latSpan / 2, minLatSpan / 2), center.lng - Math.max(lngSpan / 2, minLngSpan / 2)],
      [center.lat + Math.max(latSpan / 2, minLatSpan / 2), center.lng + Math.max(lngSpan / 2, minLngSpan / 2)],
    );
    map.fitBounds(expandedBounds.pad(0.26), {
      animate: false,
      paddingTopLeft: [28, 28],
      paddingBottomRight: [28, 28],
    });
  } else {
    map.fitBounds(bounds.pad(0.22), {
      animate: false,
      paddingTopLeft: [28, 28],
      paddingBottomRight: [28, 28],
    });
  }

  if (map.getZoom() > 9) {
    map.setZoom(9, { animate: false });
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
        radius: 34,
        blur: 30,
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

  useLayoutEffect(() => {
    const container = map.getContainer();
    let animationFrameId = 0;
    const timeoutIds = [0, 150, 450, 1000, 1800].map((delay) =>
      window.setTimeout(() => {
        syncMapViewport(map, points);
        map.eachLayer((layer) => {
          layer.redraw?.();
        });
      }, delay),
    );

    const queueSync = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        syncMapViewport(map, points);
        map.eachLayer((layer) => {
          layer.redraw?.();
        });
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
    map.whenReady(queueSync);

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
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
      zoom={9}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      preferCanvas
      className="absolute inset-0 z-0 bg-[#eef2f5]"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        detectRetina
        keepBuffer={6}
        updateWhenIdle={false}
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
                {point.active_jobs} live jobs | {point.reward_pool} Wild Cash pool
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
