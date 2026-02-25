import { MessageCircle, FileText } from "lucide-react";
import type { TimelineItem } from "@/types";

type Props = {
  items: TimelineItem[];
};

const CATEGORY_COLORS: Record<string, string> = {
  排泄: "bg-amber-100 text-amber-700",
  体調: "bg-red-100 text-red-700",
  睡眠: "bg-indigo-100 text-indigo-700",
  食事: "bg-green-100 text-green-700",
  その他: "bg-gray-100 text-gray-600",
};

function formatDateTime(isoStr: string): { date: string; time: string } {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return { date: "-", time: "-" };
    const fmt = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const parts = fmt.formatToParts(d);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    return {
      date: `${get("month")}/${get("day")}`,
      time: `${get("hour")}:${get("minute")}`,
    };
  } catch {
    return { date: "-", time: "-" };
  }
}

export default function Timeline({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-400">記録がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const { date, time } = formatDateTime(item.time);

        if (item.type === "chat_log") {
          const log = item.data;
          const tagClass =
            CATEGORY_COLORS[log.category_tag ?? ""] ??
            CATEGORY_COLORS["その他"];

          return (
            <div key={`chat-${log.id}`} className="flex gap-3">
              {/* アイコン＋縦線 */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div className="w-px flex-1 bg-gray-200 mt-1" />
              </div>

              {/* カード */}
              <div className="flex-1 pb-3">
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">
                    {date}
                  </span>
                  <span className="text-xs text-gray-400">{time}</span>
                  {log.staff_name && (
                    <span className="text-xs text-gray-500">
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
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
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
            {/* アイコン＋縦線 */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-teal-600" />
              </div>
              <div className="w-px flex-1 bg-gray-200 mt-1" />
            </div>

            {/* カード */}
            <div className="flex-1 pb-3">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1.5">
                <span className="text-xs font-semibold text-gray-600">
                  {date}
                </span>
                <span className="text-xs text-gray-400">{time}</span>
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
  );
}
