import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;

        if (error) {
          await supabase.auth.signOut();
          setHasSession(false);
          return;
        }

        setHasSession(Boolean(data.session));
      } catch {
        if (cancelled) return;
        await supabase.auth.signOut();
        setHasSession(false);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({ title: "Моля, попълнете всички полета.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast({ title: error.message || "Грешен имейл или парола.", variant: "destructive" });
        return;
      }

      navigate("/admin", { replace: true });
    } catch {
      toast({ title: "Грешка при вход. Опитайте отново.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!checkingSession && hasSession) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040404] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0a]/95 p-8 shadow-[0_0_80px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-red-500/25 bg-[#111] shadow-inner shadow-black/60">
              <Lock className="text-red-500" size={34} />
            </div>
            <a href="/" className="inline-block text-3xl font-bold uppercase tracking-[0.32em] text-white">
              VAZOV OS
            </a>
            <p className="mt-3 text-[11px] uppercase tracking-[0.35em] text-gray-500">Secure Admin Access</p>
            <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            <p className="mt-6 text-sm leading-6 text-gray-400">
              Влез със своя Supabase администраторски акаунт, за да управляваш съдържанието и поръчките.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2 text-left">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Имейл</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vazovos.bg"
                className="h-14 rounded-2xl border border-white/10 bg-[#050505] px-5 text-base text-white placeholder:text-gray-600 focus-visible:border-red-500 focus-visible:ring-0"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500">Парола</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Въведи паролата"
                className="h-14 rounded-2xl border border-white/10 bg-[#050505] px-5 text-base text-white placeholder:text-gray-600 focus-visible:border-red-500 focus-visible:ring-0"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || checkingSession}
              className="h-14 w-full rounded-2xl bg-red-600 text-sm font-bold uppercase tracking-[0.25em] text-white transition-all hover:bg-red-500"
            >
              {loading ? "Вход..." : "Влез в панела"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-gray-600">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
