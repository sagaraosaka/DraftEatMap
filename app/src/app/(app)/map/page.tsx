"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useMapsLoaded } from "@/components/layout/MapsProvider";
import AppHeader from "@/components/layout/AppHeader";
import StoreSheet from "@/components/store/StoreSheet";
import AddStore from "@/components/store/AddStore";
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
  const [showAdd, setShowAdd] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState(false);
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
    setLocateError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapRef.current?.setZoom(16);
        setLocating(false);
      },
      () => {
        setLocateError(true);
        setLocating(false);
      },
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
    <div className="relative flex h-full flex-col">
      <AppHeader
        right={
          <button
            onClick={() => setShowAdd(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-eat-text text-sm font-bold text-eat-bg"
          >
            ＋
          </button>
        }
      />
      <div className="relative flex-1">
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

      {/* 空状態カード */}
      {stores.length === 0 && (
        <div className="absolute inset-x-0 top-6 z-10 flex justify-center px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white/95 backdrop-blur-sm border border-eat-border shadow-lg px-5 py-4">
            <p className="text-[15px] font-semibold text-eat-text">行きたいお店を保存しよう</p>
            <p className="mt-1 text-[12px] text-eat-text2 leading-relaxed">
              食べイコはあなただけの飲食店メモ帳。気になるお店を保存して、「どこ行こう？」をすぐ解決。
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-3 w-full rounded-xl bg-eat-text py-2.5 text-[13px] font-semibold text-eat-bg"
            >
              ＋ 最初のお店を追加
            </button>
          </div>
        </div>
      )}

      {/* 現在地エラー */}
      {locateError && (
        <div className="absolute bottom-20 right-4 z-10 max-w-[220px] rounded-xl bg-white px-3 py-2 shadow-md border border-eat-border text-[11px] text-eat-text2 leading-snug">
          位置情報が許可されていません。<br />
          設定 → プライバシー → 位置情報サービス → Safariウェブサイト を「許可」にしてください。
        </div>
      )}

      {/* 現在地ボタン */}
      <button
        onClick={handleLocate}
        disabled={locating}
        className="absolute bottom-6 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md border border-eat-border disabled:opacity-40 active:scale-95 transition-transform"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 ${locating ? "stroke-eat-text3 animate-pulse" : "stroke-eat-accent"}`}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" strokeOpacity="0.2" fill="currentColor" className="fill-eat-accent/10" />
        </svg>
      </button>

      {showAdd && (
        <AddStore
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            loadStores();
          }}
        />
      )}

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
    </div>
  );
}
