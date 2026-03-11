import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Crosshair, Mail, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIntelStore } from "@/store/useIntelStore";

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

const ContactSection = () => {
  const [phone, setPhone] = useState("0898 123 456");
  const [email, setEmail] = useState("info@vazovrifles.com");
  const [address, setAddress] = useState("Sofia, Bulgaria");
  const markIntelFound = useIntelStore((state) => state.markIntelFound);
  const foundIds = useIntelStore((state) => state.foundIds);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (!data) return;

      const phoneSetting = data.find((setting) => setting.key === "contact_phone");
      const emailSetting = data.find((setting) => setting.key === "contact_email");
      const addressSetting = data.find((setting) => setting.key === "address");

      if (phoneSetting) setPhone(phoneSetting.value);
      if (emailSetting) setEmail(emailSetting.value);
      if (addressSetting) setAddress(addressSetting.value);
    };

    fetchSettings();
  }, []);

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
    <section id="contact" className="relative overflow-hidden border-t border-[#1a1a1a] bg-[#0a0a0a] py-24">
      <style>
        {`
          @keyframes tacticalPulse {
            0% { transform: scale(0.9); opacity: 0.75; }
            70% { transform: scale(2.1); opacity: 0; }
            100% { transform: scale(2.1); opacity: 0; }
          }
        `}
      </style>

      <div className="absolute left-1/4 top-10 h-80 w-80 rounded-full bg-red-600/10 blur-[140px]" />
      <div className="container relative z-10 mx-auto px-4 md:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-600/10 px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-red-300">
            <Crosshair size={14} />
            Operation Sector
          </div>
          <h2 className="mt-6 text-3xl font-display font-black uppercase tracking-[0.18em] text-white md:text-5xl">
            Tactical Map
          </h2>
          <div className="mx-auto mb-6 mt-6 h-1 w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          <p className="mx-auto max-w-2xl text-sm uppercase tracking-[0.22em] text-gray-400">
            Classified intel, target positions, and command channels.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <button
              type="button"
              onClick={() => markIntelFound("map-cache")}
              className={`absolute right-5 top-5 z-[500] transition ${foundIds.includes("map-cache") ? "text-red-300 opacity-90" : "text-red-500/30 opacity-25 hover:opacity-70"}`}
              aria-label="Recover map intel"
            >
              <Crosshair size={14} />
            </button>

            <div className="relative h-[460px] overflow-hidden rounded-[24px] border border-red-500/20">
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
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
              <div className="text-[10px] uppercase tracking-[0.34em] text-red-300/70">Target Alpha</div>
              <div className="mt-3 text-2xl font-black uppercase tracking-[0.18em] text-white">HQ Contact Channel</div>
              <div className="mt-6 grid gap-4">
                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Phone className="mt-1 text-red-400" size={18} />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">Voice Link</div>
                    <div className="mt-2 text-base font-bold text-white">{phone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Mail className="mt-1 text-red-400" size={18} />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">Encrypted Mail</div>
                    <div className="mt-2 text-base font-bold text-white">{email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <MapPin className="mt-1 text-red-400" size={18} />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">Coordinates</div>
                    <div className="mt-2 text-base font-bold text-white">{address}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-red-500/20 bg-red-600/10 p-6">
              <div className="text-[10px] uppercase tracking-[0.34em] text-red-300/70">Field Brief</div>
              <p className="mt-4 text-sm leading-7 text-gray-200">
                Click each marker to reveal classified intel. Alpha is the command node; Bravo is the live field sector.
                Recover the hidden crosshair cache nearby to unlock one-third of the classified reward sequence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
