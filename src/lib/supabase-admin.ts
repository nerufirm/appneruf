import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "[supabase-admin] NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が未設定です。" +
      " web/.env.local を確認してください。"
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder"
);
