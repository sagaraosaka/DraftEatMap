"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useMapsLoaded } from "@/components/layout/MapsProvider";
import StoreSheet from "@/components/store/StoreSheet";
import { getStores } from "@/lib/stores";
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_OPTIONS } from "@/lib/maps";
import type { Store } from "@/types/store";

const MARKER_VISITED = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  fillColor: "#448361",
  fillOpacity: 1,
  strokeColor: "#fff",
  strokeWeight: 1.5,
  scale: 1.6,
  anchor: { x: 12, y: 22 } as google.maps.Point,
};

const MARKER_UNVISITED = {
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
  fillColor: "#C8952A",
  fillOpacity: 1,
  strokeColor: "#fff",
  strokeWeight: 1.5,
  scale: 1.6,
  anchor: { x: 12, y: 22 } as google.maps.Point,
};

export default function MapPage() {
  const isLoaded = useMapsLoaded();
  const [stores, setStores] = useState<Store[]>([]);
  const [selected, setSelected] = useState<Store | null>(null);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  function loadStores() {
    getStores().then(setStores).catch(() => {});
  }

  useEffect(() => {
    loadStores();
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapRef.current?.setZoom(16);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (stores.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        stores.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
        map.fitBounds(bounds, 60);
      }
    },
    [stores]
  );

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-eat-bg">
        <p className="text-sm text-eat-text3">地図を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={{ lat: store.lat, lng: store.lng }}
            icon={store.status === "visited" ? MARKER_VISITED : MARKER_UNVISITED}
            onClick={() => setSelected(store)}
          />
        ))}
      </GoogleMap>

      {/* 現在地ボタン */}
      <button
        onClick={handleLocate}
        disabled={locating}
        className="absolute bottom-6 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-eat-bg shadow-lg border border-eat-border text-lg disabled:opacity-50"
      >
        {locating ? "⏳" : "📍"}
      </button>

      {selected && (
        <StoreSheet
          store={selected}
          onClose={() => setSelected(null)}
          onUpdated={loadStores}
          onDeleted={() => {
            setSelected(null);
            loadStores();
          }}
        />
      )}
    </div>
  );
}
