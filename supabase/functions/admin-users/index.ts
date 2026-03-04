/* eslint-disable */
// supabase/functions/admin-users/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

type Action =
  | "ping"
  | "debug"
  | "list_users"
  | "invite_user"
  | "create_user"
  | "delete_user"
  | "set_role";

type Body = {
  action: Action;
  page?: number;
  perPage?: number;

  userId?: string;
  email?: string;
  password?: string;
  role?: string;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });

const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  ms = 12000
) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...(init ?? {}), signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
};

const normalizeJwt = (raw: string) => {
  let k = (raw ?? "").trim();
  if (k.toLowerCase().startsWith("bearer ")) k = k.slice(7).trim();
  k = k.replace(/^"+|"+$/g, "").trim(); // маха случайни кавички
  return k;
};

const safePreview = (k: string) => {
  if (!k) return "";
  if (k.length <= 14) return k.slice(0, 6) + "…";
  return k.slice(0, 10) + "…" + k.slice(-4);
};

const expectedRefFromUrl = (supabaseUrl: string) => {
  try {
    const host = new URL(supabaseUrl).hostname; // <ref>.supabase.co
    return host.split(".")[0] || null;
  } catch {
    return null;
  }
};

const decodeJwtPayload = (jwt: string) => {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return { ok: false as const, error: "Not a JWT" };
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const payloadStr = atob(padded);
    const payload = JSON.parse(payloadStr);
    return { ok: true as const, payload };
  } catch (e: any) {
    return { ok: false as const, error: String(e?.message || e) };
  }
};

const fail = (stage: string, status: number, message: string, extra: Record<string, unknown> = {}) => {
  console.error(`[admin-users] ${stage}: ${message}`, extra);
  return json({ error: message, stage, ...extra }, status);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const RAW_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") ?? "";
  const SERVICE_ROLE_KEY = normalizeJwt(RAW_SERVICE_ROLE_KEY);

  const expectedRef = SUPABASE_URL ? expectedRefFromUrl(SUPABASE_URL) : null;

  const decoded = SERVICE_ROLE_KEY
    ? decodeJwtPayload(SERVICE_ROLE_KEY)
    : ({ ok: false, error: "missing" } as const);

  const tokenRef = decoded.ok ? (decoded.payload as any)?.ref ?? null : null;
  const tokenRole = decoded.ok ? (decoded.payload as any)?.role ?? null : null;

  const debugPayload = async () => {
    const base: any = {
      ok: true,
      supabase_url_present: !!SUPABASE_URL,
      anon_present: !!SUPABASE_ANON_KEY,
      service_role_present: !!SERVICE_ROLE_KEY,
      expected_ref: expectedRef,
      token_ref: tokenRef,
      token_role: tokenRole,
      key_preview: safePreview(SERVICE_ROLE_KEY),
      jwt_format_ok: decoded.ok,
      jwt_decode_error: decoded.ok ? null : (decoded as any).error,
    };

    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      try {
        const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
          global: { fetch: (i, init) => fetchWithTimeout(i, init, 12000) },
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        });

        const { error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
        base.service_role_admin_api_ok = !error;
        base.service_role_admin_api_error = error?.message ?? null;
      } catch (e: any) {
        base.service_role_admin_api_ok = false;
        base.service_role_admin_api_error = String(e?.message || e);
      }
    }
    return base;
  };

  // GET healthcheck + GET debug (без auth)
  if (req.method === "GET") {
    const url = new URL(req.url);
    if (url.searchParams.get("debug") === "1") {
      return json(await debugPayload(), 200);
    }
    return json({ ok: true, name: "admin-users", ts: new Date().toISOString() }, 200);
  }

  // Missing envs
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    return fail("boot", 500, "Missing SUPABASE_URL / SUPABASE_ANON_KEY / SERVICE_ROLE_KEY", {
      supabase_url_present: !!SUPABASE_URL,
      anon_present: !!SUPABASE_ANON_KEY,
      service_role_present: !!SERVICE_ROLE_KEY,
    });
  }

  if (SERVICE_ROLE_KEY.includes("(") || SERVICE_ROLE_KEY.includes("твоя")) {
    return fail("boot", 500, "SERVICE_ROLE_KEY looks like a placeholder. Set the real service_role key.");
  }

  // Ако ref mismatch -> “Invalid JWT” гаранция
  if (expectedRef && tokenRef && tokenRef !== expectedRef) {
    return fail("boot", 500, "SERVICE_ROLE_KEY is for a different Supabase project (ref mismatch).", {
      expected_ref: expectedRef,
      token_ref: tokenRef,
      token_role: tokenRole,
      key_preview: safePreview(SERVICE_ROLE_KEY),
    });
  }

  if (tokenRole && tokenRole !== "service_role") {
    return fail("boot", 500, "SERVICE_ROLE_KEY is not a service_role key (wrong role).", {
      expected_ref: expectedRef,
      token_ref: tokenRef,
      token_role: tokenRole,
      key_preview: safePreview(SERVICE_ROLE_KEY),
    });
  }

  // Parse body
  let body: Body | null = null;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail("request", 400, "Invalid JSON body");
  }

  if (!body?.action) return fail("request", 400, "Missing action");

  // POST debug без auth
  if (body.action === "debug") {
    return json(await debugPayload(), 200);
  }

  // ✅ Authorization header (тук падаш с 401 ако го няма)
  const rawAuth =
    req.headers.get("authorization") ||
    req.headers.get("Authorization") ||
    req.headers.get("x-supabase-authorization");

  if (!rawAuth) {
    return fail("auth", 401, "Missing Authorization header", {
      header_names: [...req.headers.keys()].sort(),
      hint: "Client must send Authorization: Bearer <access_token>",
    });
  }

  const authHeader = rawAuth.toLowerCase().startsWith("bearer ")
    ? rawAuth
    : `Bearer ${rawAuth}`;

  // User client: валидира JWT
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: authHeader },
      fetch: (i, init) => fetchWithTimeout(i, init, 12000),
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return fail("auth_get_user", 401, userErr?.message || "Invalid session", {
      hint: "If you see 'Invalid JWT' => project mismatch (URL/keys) OR old token.",
    });
  }

  const actorId = userData.user.id;
  const actorEmail = userData.user.email ?? null;

  // Admin client: service_role
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { fetch: (i, init) => fetchWithTimeout(i, init, 12000) },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  // RBAC: admin only
  const { data: roleRow, error: roleErr } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", actorId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleErr) {
    return fail("admin_check_db", 500, roleErr.message, {
      hint: "If this says Invalid JWT => wrong SERVICE_ROLE_KEY secret (old/mismatched project).",
    });
  }
  if (!roleRow) return fail("rbac", 403, "Forbidden (admin only)");

  const audit = async (action: string, entity: string, entity_id: string | null, meta: Record<string, unknown> = {}) => {
    const { error } = await adminClient.from("audit_logs").insert([
      { actor_user_id: actorId, actor_email: actorEmail, action, entity, entity_id, meta },
    ]);
    if (error) console.error("[admin-users] audit insert failed:", error.message);
  };

  // Actions
  if (body.action === "ping") return json({ ok: true, authed: true });

  if (body.action === "list_users") {
    const page = Math.max(1, body.page ?? 1);
    const perPage = Math.min(200, Math.max(1, body.perPage ?? 50));

    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) return fail("auth_admin_list", 500, error.message);

    const userIds = data.users.map((u) => u.id);
    const { data: roles, error: rolesErr } = await adminClient
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", userIds);

    if (rolesErr) return fail("roles_map", 500, rolesErr.message);

    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });

    const enriched = data.users.map((u: any) => ({
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
      confirmed_at: u.confirmed_at ?? null,
      roles: roleMap.get(u.id) ?? [],
      banned_until: u.banned_until ?? null,
    }));

    return json({ users: enriched, page, perPage });
  }

  if (body.action === "invite_user") {
    if (!body.email) return fail("invite", 400, "Missing email");

    const { error } = await adminClient.auth.admin.inviteUserByEmail(body.email);
    if (error) return fail("auth_admin_invite", 500, error.message);

    await audit("user.invite", "auth.users", null, { email: body.email });
    return json({ ok: true });
  }

  if (body.action === "create_user") {
    if (!body.email || !body.password) return fail("create_user", 400, "Missing email/password");

    const { data, error } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });
    if (error) return fail("auth_admin_create", 500, error.message);

    await audit("user.create", "auth.users", data.user?.id ?? null, { email: body.email });
    return json({ ok: true });
  }

  if (body.action === "delete_user") {
    if (!body.userId) return fail("delete_user", 400, "Missing userId");

    const { error } = await adminClient.auth.admin.deleteUser(body.userId);
    if (error) return fail("auth_admin_delete", 500, error.message);

    const { error: delRolesErr } = await adminClient.from("user_roles").delete().eq("user_id", body.userId);
    if (delRolesErr) console.error("[admin-users] delete roles failed:", delRolesErr.message);

    await audit("user.delete", "auth.users", body.userId, {});
    return json({ ok: true });
  }

  if (body.action === "set_role") {
    if (!body.userId || !body.role) return fail("set_role", 400, "Missing userId/role");

    const { error: delErr } = await adminClient.from("user_roles").delete().eq("user_id", body.userId);
    if (delErr) return fail("roles_delete", 500, delErr.message);

    const { error: insErr } = await adminClient.from("user_roles").insert([{ user_id: body.userId, role: body.role }]);
    if (insErr) return fail("roles_insert", 500, insErr.message);

    await audit("user.role.set", "user_roles", body.userId, { role: body.role });
    return json({ ok: true });
  }

  return fail("request", 400, "Unknown action");
});