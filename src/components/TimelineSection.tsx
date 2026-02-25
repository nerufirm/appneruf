"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Timeline from "./Timeline";
import RecordModal from "./RecordModal";
import type { TimelineItem } from "@/types";

type FilterCategory = "すべて" | "体調" | "排泄" | "睡眠" | "食事" | "その他";

const FILTERS: FilterCategory[] = ["すべて", "体調", "排泄", "睡眠", "食事", "その他"];

function matchesFilter(item: TimelineItem, filter: FilterCategory): boolean {
  if (filter === "すべて") return true;

  if (item.type === "chat_log") {
    const tag = item.data.category_tag;
    if (filter === "その他") return !tag || tag === "その他";
    return tag === filter;
  }

  // daily_record: 各フィールドの有無でカテゴリを判定
  const rec = item.data;
  switch (filter) {
    case "体調":
      return (
        rec.body_temp != null ||
        rec.bp_high != null ||
        rec.pulse != null ||
        rec.spo2 != null
      );
    case "排泄":
      return rec.excretion_urine != null && rec.excretion_urine !== "";
    case "食事":
      return rec.meal_amount != null && rec.meal_amount !== "";
    case "睡眠":
      // daily_records に睡眠フィールドはないため常に非表示
      return false;
    case "その他":
      return (
        rec.body_temp == null &&
        rec.bp_high == null &&
        rec.pulse == null &&
        rec.spo2 == null &&
        (rec.excretion_urine == null || rec.excretion_urine === "") &&
        (rec.meal_amount == null || rec.meal_amount === "")
      );
    default:
      return true;
  }
}

type Props = {
  items: TimelineItem[];
  userId: string;
};

export default function TimelineSection({ items, userId }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("すべて");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const filtered = items.filter((item) => matchesFilter(item, activeFilter));

  function handleSuccess() {
    setIsModalOpen(false);
    setToast("記録を追加しました");
    router.refresh();
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー行 */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            タイムライン ({filtered.length}件)
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            記録を追加
          </button>
        </div>

        {/* フィルタータブ */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                activeFilter === f
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <Timeline items={filtered} />
      </div>

      {/* 記録追加モーダル */}
      {isModalOpen && (
        <RecordModal
          userId={userId}
          onSuccess={handleSuccess}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
