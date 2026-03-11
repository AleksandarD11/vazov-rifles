import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Gunsmith3D from "@/components/Gunsmith3D";

const Gunsmith3DPage = () => {
  return (
    <div className="min-h-screen bg-[#040404]">
      <div className="fixed left-4 top-4 z-30 md:left-8 md:top-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.28em] text-gray-200 backdrop-blur-xl transition hover:border-red-500/40 hover:text-white"
        >
          <ArrowLeft size={16} />
          Назад
        </Link>
      </div>
      <Gunsmith3D />
    </div>
  );
};

export default Gunsmith3DPage;
