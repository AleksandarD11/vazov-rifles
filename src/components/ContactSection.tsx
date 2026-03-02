import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail } from "lucide-react";

const ContactSection = () => {
  const [phone, setPhone] = useState("0898 123 456");
  const [email, setEmail] = useState("info@vazovrifles.com");
  const [address, setAddress] = useState("гр. София, ул. Еърсофт 1");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const phoneSetting = data.find(s => s.key === "contact_phone");
        const emailSetting = data.find(s => s.key === "contact_email");
        const addressSetting = data.find(s => s.key === "address");
        
        if (phoneSetting) setPhone(phoneSetting.value);
        if (emailSetting) setEmail(emailSetting.value);
        if (addressSetting) setAddress(addressSetting.value);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section id="contact" className="py-24 bg-[#0a0a0a] border-t border-[#1a1a1a]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-wider mb-4">
            Контакти
          </h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6"></div>
          <p className="text-gray-400 uppercase tracking-widest text-sm max-w-2xl mx-auto">
            Свържете се с нас за консултация, въпроси или запитвания. Ние сме на ваше разположение.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* ТЕЛЕФОН */}
          <div className="bg-[#040404] border border-[#1a1a1a] p-8 rounded-md text-center group hover:border-gold/50 transition-colors">
            <Phone className="w-10 h-10 text-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold uppercase tracking-wider mb-2">Телефон</h3>
            <p className="text-gray-400 font-mono text-lg">{phone}</p>
          </div>
          
          {/* ИМЕЙЛ */}
          <div className="bg-[#040404] border border-[#1a1a1a] p-8 rounded-md text-center group hover:border-gold/50 transition-colors">
            <Mail className="w-10 h-10 text-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold uppercase tracking-wider mb-2">Имейл</h3>
            <p className="text-gray-400">{email}</p>
          </div>
          
          {/* АДРЕС */}
          <div className="bg-[#040404] border border-[#1a1a1a] p-8 rounded-md text-center group hover:border-gold/50 transition-colors">
            <MapPin className="w-10 h-10 text-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-bold uppercase tracking-wider mb-2">Локация</h3>
            <p className="text-gray-400">{address}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;