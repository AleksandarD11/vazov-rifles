import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProtectedAdminRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (!cancelled) setIsLoading(false);
    };

    const deny = () => {
      if (!cancelled) setIsAllowed(false);
    };

    const allow = () => {
      if (!cancelled) setIsAllowed(true);
    };

    const safeSignOut = async () => {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore sign-out failures while guarding the route.
      }
    };

    const checkSession = async () => {
      timeoutId = setTimeout(() => {
        if (cancelled || resolved) return;
        resolved = true;
        deny();
        finish();
        void safeSignOut();
      }, 2000);

      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled || resolved) return;

        const user = data.session?.user;
        if (error || !user) {
          resolved = true;
          deny();
          await safeSignOut();
          return;
        }

        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (cancelled || resolved) return;

        resolved = true;
        if (isAdmin === true) {
          allow();
        } else {
          deny();
          await safeSignOut();
        }
      } catch {
        if (cancelled || resolved) return;
        resolved = true;
        deny();
        await safeSignOut();
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        finish();
      }
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session?.user) {
        setIsAllowed(false);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6">
        <div className="text-gray-500 uppercase tracking-widest text-xs animate-pulse">Проверка на сесия...</div>
      </div>
    );
  }

  if (!isAllowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
