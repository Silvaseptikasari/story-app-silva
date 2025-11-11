let mapInstance;
let clickHandler;

export function createMap(containerId, opts = {}) {
  const { center = [-6.2, 106.8], zoom = 5, onClick } = opts;

  // init map
  const map = L.map(containerId).setView(center, zoom);

  const key = document
    .querySelector('meta[name="map-tiler-key"]')
    ?.content?.trim();
  if (key) {
    L.tileLayer(
      `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`,
      {
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }
    ).addTo(map);
  } else {
    // Fallback OSM (no key)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
  }

  if (onClick) {
    clickHandler = (e) => onClick(e.latlng);
    map.on("click", clickHandler);
  }

  mapInstance = map;
  return map;
}

export function destroyMap() {
  if (mapInstance) {
    if (clickHandler) mapInstance.off("click", clickHandler);
    mapInstance.remove();
    mapInstance = null;
  }
}

export function addMarker(map, lat, lon, popupHtml) {
  const m = L.marker([lat, lon]).addTo(map);
  if (popupHtml) m.bindPopup(popupHtml);
  return m;
}
