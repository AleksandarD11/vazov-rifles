import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-authorization",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    // ТУК Е МАГИЯТА: Дърпаме нашия ръчно сложен ключ!
    const serviceRoleKey = Deno.env.get("MY_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error("Липсват сървърни ключове. Провери Secrets!");
    }

    // Изрична проверка дали ключът е валиден JWT!
    if (!serviceRoleKey.startsWith("eyJ")) {
       throw new Error("СЪРВЪРНИЯТ КЛЮЧ НЕ Е ВАЛИДЕН JWT! Увери се, че си копирал service_role ключа от API настройките.");
    }

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Липсва Authorization хедър (JWT на потребителя).");
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      throw new Error("Твоята сесия е невалидна. Моля, излез и влез отново в админ панела.");
    }

    const actorId = userData.user.id;

    // Проверка за админ
    const { data: roleRow, error: roleErr } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", actorId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleErr || !roleRow) {
      throw new Error("Нямаш администраторски права да правиш това.");
    }

    const body = await req.json();
    const action = body.action;

    if (action === "list_users") {
      const { data, error } = await adminClient.auth.admin.listUsers({ page: body.page ?? 1, perPage: body.perPage ?? 100 });
      if (error) throw error;

      const userIds = data.users.map((u) => u.id);
      const { data: roles } = await adminClient.from("user_roles").select("user_id, role").in("user_id", userIds);
      
      const roleMap = new Map<string, string[]>();
      (roles || []).forEach((r: any) => {
        const arr = roleMap.get(r.user_id) || [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      });

      const enriched = data.users.map((u) => ({
        id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at, confirmed_at: u.confirmed_at, roles: roleMap.get(u.id) || ["user"], banned_until: u.banned_until,
      }));

      return new Response(JSON.stringify({ users: enriched }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "invite_user") {
      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(body.email);
      if (error) throw error;
      if (data.user?.id) await adminClient.from("user_roles").insert([{ user_id: data.user.id, role: "user" }]);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "create_user") {
      const { data, error } = await adminClient.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true });
      if (error) throw error;
      if (data.user?.id) await adminClient.from("user_roles").insert([{ user_id: data.user.id, role: "user" }]);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete_user") {
      const { error } = await adminClient.auth.admin.deleteUser(body.userId);
      if (error) throw error;
      await adminClient.from("user_roles").delete().eq("user_id", body.userId);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "set_roles") {
      const cleanRoles = Array.from(new Set((body.roles || []).map((r: string) => r?.trim().toLowerCase()).filter(Boolean)));
      if (body.userId === actorId && !cleanRoles.includes("admin")) throw new Error("Не можеш да премахнеш собствените си admin права!");
      await adminClient.from("user_roles").delete().eq("user_id", body.userId);
      if (cleanRoles.length > 0) await adminClient.from("user_roles").insert(cleanRoles.map((r) => ({ user_id: body.userId, role: r })));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Непознато действие.");

  } catch (err: any) {
    console.error("Backend Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { 
      status: 400, // Връщаме 400, за да го хване фронтенда чисто
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});