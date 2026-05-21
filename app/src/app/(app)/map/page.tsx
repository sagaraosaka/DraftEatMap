"use client";

import { useEffect, useState, useCallback } from "react";
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

  function loadStores() {
    getStores().then(setStores).catch(() => {});
  }

  useEffect(() => {
    loadStores();
  }, []);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
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
        onLoad={stores.length > 0 ? onLoad : undefined}
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
