import { PropsWithChildren } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PageShell = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#040404] text-white">
      <Navbar />
      <main className="pt-24 sm:pt-28">{children}</main>
      <Footer />
    </div>
  );
};

export default PageShell;
