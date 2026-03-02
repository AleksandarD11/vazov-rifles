import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ADMIN_BYPASS_KEY = "admin_bypass";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({ title: "Моля, попълнете всички полета.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const isBypassOk = email.trim().toLowerCase() === "admin" && password === "admin";
    setLoading(false);

    if (!isBypassOk) {
      toast({ title: "Грешен имейл или парола.", variant: "destructive" });
      return;
    }

    localStorage.setItem(ADMIN_BYPASS_KEY, "1");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="text-3xl font-display font-bold tracking-[0.2em] text-gold">Paradise</a>
          <p className="text-primary-foreground/60 font-body mt-2">Администраторски вход</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-lg p-6 border border-border space-y-4">
          <div>
            <label className="text-sm font-body text-muted-foreground mb-1 block">Имейл</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@paradise.bg" />
          </div>
          <div>
            <label className="text-sm font-body text-muted-foreground mb-1 block">Парола</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold-dark text-primary font-body tracking-wider uppercase text-sm py-5">
            {loading ? "Вход..." : "Влез"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
