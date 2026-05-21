export const MAPS_LIBRARIES: ("places" | "marker")[] = ["places", "marker"];

export const DEFAULT_CENTER = {
  lat: 35.6812362,
  lng: 139.7671248, // 東京駅
};

export const DEFAULT_ZOOM = 14;

export const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};
