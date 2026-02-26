import { supabaseAdmin } from "./supabase-admin";
import { normalizeName } from "./chatwork-utils";

let cachedMap: Map<string, string> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5分

export async function getNameMap(): Promise<Map<string, string>> {
  const now = Date.now();
  if (cachedMap && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedMap;
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, name");

  if (error || !data) {
    throw new Error(`users テーブルの読み込みに失敗: ${error?.message}`);
  }

  const map = new Map<string, string>();
  for (const user of data) {
    if (user.id && user.name) {
      map.set(normalizeName(user.name), user.id);
    }
  }

  cachedMap = map;
  cacheTimestamp = now;
  return map;
}
