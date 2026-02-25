import {
  AlertTriangle,
  Activity,
  MessageCircle,
  Clock,
  FileText,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { DailyRecord, ChatLog } from "@/types";

type UserRef = { id: string; name: string; building_room: string | null };
type RecordWithUser = DailyRecord & { users: UserRef | null };
type ChatLogWithUser = ChatLog & { users: UserRef | null };

type TimelineEntry =
  | { type: "daily_record"; time: string; data: RecordWithUser }
  | { type: "chat_log"; time: string; data: ChatLogWithUser };

const CATEGORY_COLORS: Record<string, string> = {
  排泄: "bg-amber-100 text-amber-700",
  体調: "bg-red-100 text-red-700",
  睡眠: "bg-indigo-100 text-indigo-700",
  食事: "bg-green-100 text-green-700",
  その他: "bg-gray-100 text-gray-600",
};

function getTodayRange(): { start: string; end: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const dateStr = `${get("year")}-${get("month")}-${get("day")}`;
  return {
    start: `${dateStr}T00:00:00+09:00`,
    end: `${dateStr}T23:59:59+09:00`,
  };
}

function formatTodayHeader(): string {
  const now = new Date();
  const date = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);
  const weekday = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(now);
  return `${date} (${weekday})`;
}

function formatDateTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "-";
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return `${get("month")}/${get("day")} ${get("hour")}:${get("minute")}`;
  } catch {
    return "-";
  }
}

function UserBadge({ user, userId }: { user: UserRef | null; userId: string }) {
  const name = user?.name ?? "不明";
  const room = user?.building_room ?? "";
  const id = user?.id ?? userId;
  return (
    <Link href={`/?userId=${id}`} className="inline-flex items-center gap-1">
      <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-200 transition-colors">
        {name}
      </span>
      {room && (
        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
          {room}
        </span>
      )}
    </Link>
  );
}

export default async function Dashboard() {
  const { start, end } = getTodayRange();

  const [todayRecordsRes, todayChatLogsRes, latestRecordsRes, latestChatLogsRes] =
    await Promise.all([
      supabase
        .from("daily_records")
        .select("*, users(id, name, building_room)")
        .gte("record_time", start)
        .lte("record_time", end)
        .order("record_time", { ascending: false }),
      supabase
        .from("chat_logs")
        .select("*, users(id, name, building_room)")
        .gte("send_time", start)
        .lte("send_time", end)
        .order("send_time", { ascending: false }),
      supabase
        .from("daily_records")
        .select("*, users(id, name, building_room)")
        .order("record_time", { ascending: false })
        .limit(20),
      supabase
        .from("chat_logs")
        .select("*, users(id, name, building_room)")
        .order("send_time", { ascending: false })
        .limit(20),
    ]);

  const todayRecords = (todayRecordsRes.data ?? []) as unknown as RecordWithUser[];
  const todayChatLogs = (todayChatLogsRes.data ?? []) as unknown as ChatLogWithUser[];
  const latestRecords = (latestRecordsRes.data ?? []) as unknown as RecordWithUser[];
  const latestChatLogs = (latestChatLogsRes.data ?? []) as unknown as ChatLogWithUser[];

  // アラート: 体温 >= 37.0 or 血圧（上） >= 140
  const alertRecords = todayRecords.filter(
    (r) =>
      (r.body_temp != null && r.body_temp >= 37.0) ||
      (r.bp_high != null && r.bp_high >= 140)
  );

  // 全体タイムライン（最新20件）
  const globalTimeline: TimelineEntry[] = [
    ...latestRecords.map((r) => ({
      type: "daily_record" as const,
      time: r.record_time,
      data: r,
    })),
    ...latestChatLogs.map((c) => ({
      type: "chat_log" as const,
      time: c.send_time,
      data: c,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 20);

  const todayLabel = formatTodayHeader();

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* ヘッダー */}
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">
            本日のダッシュボード
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{todayLabel}</h1>
        </div>

        {/* サマリカード */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">本日のバイタル・ケア記録</p>
              <p className="text-3xl font-bold text-gray-900">
                {todayRecords.length}
                <span className="text-sm font-normal text-gray-500 ml-1">件</span>
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">本日のチャットログ</p>
              <p className="text-3xl font-bold text-gray-900">
                {todayChatLogs.length}
                <span className="text-sm font-normal text-gray-500 ml-1">件</span>
              </p>
            </div>
          </div>
        </div>

        {/* アラートパネル */}
        {alertRecords.length > 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <h2 className="text-sm font-semibold text-red-700">
                要注意アラート（{alertRecords.length}件）
              </h2>
            </div>
            <div className="space-y-2">
              {alertRecords.map((rec) => {
                const flags: string[] = [];
                if (rec.body_temp != null && rec.body_temp >= 37.0)
                  flags.push(`体温 ${rec.body_temp}℃`);
                if (rec.bp_high != null && rec.bp_high >= 140)
                  flags.push(`血圧（上） ${rec.bp_high}`);
                const userName = rec.users?.name ?? "不明";
                const room = rec.users?.building_room ?? "";
                const userId = rec.users?.id ?? rec.user_id ?? "";
                return (
                  <Link
                    key={rec.id}
                    href={`/?userId=${userId}`}
                    className="flex items-center justify-between bg-white rounded-lg border border-red-200 px-4 py-3 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 flex-shrink-0">
                        {userName.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">
                          {userName} 様
                        </span>
                        {room && (
                          <span className="text-xs text-gray-500 ml-2">{room}</span>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDateTime(rec.record_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {flags.map((f) => (
                        <span
                          key={f}
                          className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              本日、要注意なバイタルの記録はありません。
            </p>
          </div>
        )}

        {/* 全体タイムライン */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">
              施設全体の最新タイムライン
            </h2>
          </div>

          {globalTimeline.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-400">記録がありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {globalTimeline.map((item) => {
                const user = item.data.users;
                const userId = user?.id ?? item.data.user_id ?? "";
                const timeStr = formatDateTime(item.time);

                if (item.type === "chat_log") {
                  const log = item.data;
                  const tagClass =
                    CATEGORY_COLORS[log.category_tag ?? ""] ??
                    CATEGORY_COLORS["その他"];
                  return (
                    <div key={`chat-${log.id}`} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1.5">
                          <span className="text-xs font-semibold text-gray-500">
                            {timeStr}
                          </span>
                          <UserBadge user={user} userId={userId} />
                          {log.staff_name && (
                            <span className="text-xs text-gray-400">
                              {log.staff_name}
                            </span>
                          )}
                          {log.category_tag && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${tagClass}`}
                            >
                              {log.category_tag}
                            </span>
                          )}
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed line-clamp-3">
                            {log.message ?? ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // daily_record
                const rec = item.data;
                const vitals = [
                  rec.body_temp != null && `体温 ${rec.body_temp}℃`,
                  rec.bp_high != null &&
                    rec.bp_low != null &&
                    `血圧 ${rec.bp_high}/${rec.bp_low}`,
                  rec.pulse != null && `脈拍 ${rec.pulse}`,
                  rec.spo2 != null && `SpO2 ${rec.spo2}%`,
                  rec.excretion_urine && `排尿 ${rec.excretion_urine}`,
                  rec.meal_amount && `食事 ${rec.meal_amount}`,
                ].filter(Boolean) as string[];

                return (
                  <div key={`record-${rec.id}`} className="flex gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1.5">
                        <span className="text-xs font-semibold text-gray-500">
                          {timeStr}
                        </span>
                        <UserBadge user={user} userId={userId} />
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium">
                          日次記録
                        </span>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                        {vitals.length > 0 ? (
                          <div className="flex flex-wrap gap-x-5 gap-y-1">
                            {vitals.map((v, i) => (
                              <span key={i} className="text-sm text-gray-700">
                                {v}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">バイタルデータなし</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
