import { useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const targets = [
  {
    id: "alpha",
    label: "Target Alpha",
    status: "ONLINE",
    coords: [42.6977, 23.3219] as [number, number],
    intel: "HQ uplink stable. Civilian access masked. Priority communications green.",
  },
  {
    id: "bravo",
    label: "Target Bravo",
    status: "ACTIVE",
    coords: [42.6812, 23.3187] as [number, number],
    intel: "Field deployment zone live. Elevated movement signatures detected at dusk.",
  },
];

const TacticalMap = () => {
  const pulsingMarker = useMemo(
    () =>
      divIcon({
        className: "tactical-map-marker",
        html: `
          <div style="position:relative;width:22px;height:22px;">
            <span style="position:absolute;inset:0;border-radius:9999px;background:rgba(220,38,38,0.28);animation:tacticalPulse 1.8s infinite;"></span>
            <span style="position:absolute;left:50%;top:50%;width:10px;height:10px;border-radius:9999px;background:#ef4444;transform:translate(-50%,-50%);box-shadow:0 0 24px rgba(239,68,68,0.9);"></span>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    []
  );

  return (
    <MapContainer center={targets[0].coords} zoom={13} className="h-full w-full" zoomControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap contributors &copy; CARTO" />
      {targets.map((target) => (
        <Marker key={target.id} position={target.coords} icon={pulsingMarker}>
          <Popup closeButton={false} className="tactical-popup">
            <div className="min-w-[220px] rounded-2xl border border-red-500/20 bg-[#050505]/95 p-4 text-white">
              <div className="text-[10px] uppercase tracking-[0.32em] text-red-300/70">Classified Intel</div>
              <div className="mt-2 text-lg font-black uppercase tracking-[0.18em] text-white">{target.label}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.24em] text-red-400">Status: {target.status}</div>
              <div className="mt-3 text-xs leading-6 text-gray-300">
                Coordinates: {target.coords[0].toFixed(4)}, {target.coords[1].toFixed(4)}
              </div>
              <div className="mt-2 text-xs leading-6 text-gray-300">{target.intel}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TacticalMap;
