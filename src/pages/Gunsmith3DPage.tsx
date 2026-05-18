import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Gunsmith3D from "@/components/Gunsmith3D";

const Gunsmith3DPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#040404]">
      <div className="fixed left-4 top-4 z-30 md:left-8 md:top-8">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-3 py-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-200 backdrop-blur-xl transition hover:border-red-500/40 hover:text-white sm:px-4 sm:tracking-[0.28em]"
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
