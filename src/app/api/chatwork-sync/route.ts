import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  normalizeName,
  toJSTTimestamp,
  inferCategoryTag,
} from "@/lib/chatwork-utils";
import { getNameMap } from "@/lib/name-map";

const WEBHOOK_SECRET = process.env.CHATWORK_WEBHOOK_SECRET;

type ChatLogEntry = {
  datetime: string;
  resident_name: string;
  message: string;
  staff_name: string;
  message_id: string;
};

export async function POST(request: NextRequest) {
  // 1. 認証チェック
  const authHeader = request.headers.get("x-webhook-secret");
  if (!WEBHOOK_SECRET || authHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. リクエストボディのパース
  let entries: ChatLogEntry[];
  try {
    const body = await request.json();
    entries = Array.isArray(body) ? body : [body];
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (entries.length === 0) {
    return NextResponse.json({ message: "No entries to process", inserted: 0 });
  }

  // 3. 名寄せマップの読み込み
  let nameMap: Map<string, string>;
  try {
    nameMap = await getNameMap();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `名寄せマップの読み込みに失敗: ${message}` },
      { status: 500 }
    );
  }

  // 4. データ変換（seed.ts と同じロジック）
  const records: {
    id: string;
    user_id: string;
    staff_name: string | null;
    message: string;
    send_time: string;
    category_tag: string;
  }[] = [];
  const skipped: string[] = [];

  for (const entry of entries) {
    const id = entry.message_id?.trim();
    const message = entry.message?.trim();
    if (!id || !message) continue;

    const sendTime = toJSTTimestamp(entry.datetime);
    if (!sendTime) continue;

    const rawName = entry.resident_name ?? "";
    const normalizedName = normalizeName(rawName);
    const userId = normalizedName ? nameMap.get(normalizedName) : undefined;

    if (!userId) {
      skipped.push(rawName || "(empty)");
      continue;
    }

    records.push({
      id,
      user_id: userId,
      staff_name: entry.staff_name?.trim() || null,
      message,
      send_time: sendTime,
      category_tag: inferCategoryTag(message),
    });
  }

  // 5. Supabase に upsert
  if (records.length > 0) {
    const { error } = await supabaseAdmin
      .from("chat_logs")
      .upsert(records, { onConflict: "id" });

    if (error) {
      return NextResponse.json(
        { error: `Upsert failed: ${error.message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    message: "Sync complete",
    inserted: records.length,
    skipped: skipped.length,
    skippedNames: skipped,
  });
}
