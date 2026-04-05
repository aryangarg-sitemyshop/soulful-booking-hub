import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Create admin user
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: "aryangarg@radianceskin.com",
    password: "aryangarg",
    email_confirm: true,
    user_metadata: { full_name: "Aryan Garg" },
  });

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), { status: 400 });
  }

  // Assign admin role
  const { error: roleError } = await supabase
    .from("user_roles")
    .insert({ user_id: userData.user.id, role: "admin" });

  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.message }), { status: 400 });
  }

  // Create profile
  await supabase.from("profiles").insert({
    id: userData.user.id,
    full_name: "Aryan Garg",
  });

  return new Response(JSON.stringify({ success: true, email: "aryangarg@radianceskin.com" }), {
    headers: { "Content-Type": "application/json" },
  });
});
