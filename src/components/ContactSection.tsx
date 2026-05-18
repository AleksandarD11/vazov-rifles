import { lazy, Suspense, useEffect, useState } from "react";
import { Crosshair, Mail, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIntelStore } from "@/store/useIntelStore";

const TacticalMap = lazy(() => import("./TacticalMap"));

const ContactSection = () => {
  const [phone, setPhone] = useState("0898 123 456");
  const [email, setEmail] = useState("info@vazovrifles.com");
  const [address, setAddress] = useState("Sofia, Bulgaria");
  const markIntelFound = useIntelStore((state) => state.markIntelFound);
  const foundIds = useIntelStore((state) => state.foundIds);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("key,value")
          .in("key", ["contact_phone", "contact_email", "address"]);

        if (error) throw error;
        if (!data) return;

        const phoneSetting = data.find((setting) => setting.key === "contact_phone");
        const emailSetting = data.find((setting) => setting.key === "contact_email");
        const addressSetting = data.find((setting) => setting.key === "address");

        if (phoneSetting) setPhone(phoneSetting.value);
        if (emailSetting) setEmail(emailSetting.value);
        if (addressSetting) setAddress(addressSetting.value);
      } catch (error) {
        console.error("Public contact settings failed to load", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <section id="contact" className="relative overflow-hidden border-t border-[#1a1a1a] bg-[#0a0a0a] py-14 sm:py-20 lg:py-24">
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
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-16">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-red-500/20 bg-red-600/10 px-4 py-2 text-[10px] uppercase leading-tight tracking-[0.2em] text-red-300 sm:text-[11px] sm:tracking-[0.34em]">
            <Crosshair size={14} />
            Operation Sector
          </div>
          <h2 className="mt-6 break-words font-display text-3xl font-black uppercase tracking-[0.12em] text-white sm:text-4xl lg:text-5xl lg:tracking-[0.18em]">
            Tactical Map
          </h2>
          <div className="mx-auto mb-6 mt-6 h-1 w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          <p className="mx-auto max-w-2xl text-xs uppercase leading-relaxed tracking-[0.14em] text-gray-400 sm:text-sm sm:tracking-[0.22em]">
            Classified intel, target positions, and command channels.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="relative min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.45)] sm:rounded-[32px] sm:p-4">
            <button
              type="button"
              onClick={() => markIntelFound("map-cache")}
              className={`absolute right-5 top-5 z-[500] transition ${foundIds.includes("map-cache") ? "text-red-300 opacity-90" : "text-red-500/30 opacity-25 hover:opacity-70"}`}
              aria-label="Recover map intel"
            >
              <Crosshair size={14} />
            </button>

            <div className="relative h-[320px] overflow-hidden rounded-[20px] border border-red-500/20 sm:h-[380px] sm:rounded-[24px] lg:h-[420px] xl:h-[460px]">
              <Suspense
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-[#050505] text-[10px] font-bold uppercase tracking-[0.34em] text-red-300/70">
                    Acquiring tactical map...
                  </div>
                }
              >
                <TacticalMap />
              </Suspense>
            </div>
          </div>

          <div className="grid min-w-0 gap-5">
            <div className="min-w-0 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:rounded-[28px] sm:p-6">
              <div className="text-[10px] uppercase tracking-[0.24em] text-red-300/70 sm:tracking-[0.34em]">Target Alpha</div>
              <div className="mt-3 break-words text-xl font-black uppercase tracking-[0.12em] text-white sm:text-2xl sm:tracking-[0.18em]">HQ Contact Channel</div>
              <div className="mt-6 grid gap-4">
                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Phone className="mt-1 shrink-0 text-red-400" size={18} />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:tracking-[0.3em]">Voice Link</div>
                    <div className="mt-2 break-words text-base font-bold text-white">{phone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Mail className="mt-1 shrink-0 text-red-400" size={18} />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:tracking-[0.3em]">Encrypted Mail</div>
                    <div className="mt-2 break-words text-base font-bold text-white">{email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <MapPin className="mt-1 shrink-0 text-red-400" size={18} />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 sm:tracking-[0.3em]">Coordinates</div>
                    <div className="mt-2 break-words text-base font-bold text-white">{address}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-red-500/20 bg-red-600/10 p-5 sm:rounded-[28px] sm:p-6">
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
