"use client";

import { createContext, useContext } from "react";
import { useLoadScript } from "@react-google-maps/api";

const LIBRARIES: ("places" | "marker")[] = ["places", "marker"];

const MapsContext = createContext(false);

export function useMapsLoaded() {
  return useContext(MapsContext);
}

export default function MapsProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
    language: "ja",
  });
  return <MapsContext.Provider value={isLoaded}>{children}</MapsContext.Provider>;
}
