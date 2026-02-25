import { supabase } from "@/lib/supabase";
import type {
  UserDetail as UserDetailType,
  MedicalHistory,
  Medication,
  DailyRecord,
  ChatLog,
  TimelineItem,
} from "@/types";
import UserProfile from "./UserProfile";
import TimelineSection from "./TimelineSection";

type Props = {
  userId: string;
};

async function fetchUserData(userId: string) {
  const [userRes, historyRes, medicationRes, dailyRes, chatRes] =
    await Promise.all([
      supabase
        .from("users")
        .select(
          "id, name, gender, birth_date, building_room, care_level, primary_doctor, emergency_contact"
        )
        .eq("id", userId)
        .single(),
      supabase
        .from("medical_histories")
        .select("id, user_id, disease_name, onset_date, hospital")
        .eq("user_id", userId),
      supabase
        .from("medications")
        .select("id, user_id, timing, medicine_name, dosage")
        .eq("user_id", userId),
      supabase
        .from("daily_records")
        .select(
          "id, user_id, staff_id, record_time, body_temp, bp_high, bp_low, pulse, spo2, excretion_urine, meal_amount"
        )
        .eq("user_id", userId)
        .order("record_time", { ascending: false })
        .limit(50),
      supabase
        .from("chat_logs")
        .select("id, user_id, staff_name, message, send_time, category_tag")
        .eq("user_id", userId)
        .order("send_time", { ascending: false })
        .limit(50),
    ]);

  return {
    user: userRes.data as UserDetailType | null,
    medicalHistories: (historyRes.data ?? []) as MedicalHistory[],
    medications: (medicationRes.data ?? []) as Medication[],
    dailyRecords: (dailyRes.data ?? []) as DailyRecord[],
    chatLogs: (chatRes.data ?? []) as ChatLog[],
    hasError:
      !!userRes.error ||
      !!historyRes.error ||
      !!medicationRes.error ||
      !!dailyRes.error ||
      !!chatRes.error,
  };
}

function buildTimeline(
  dailyRecords: DailyRecord[],
  chatLogs: ChatLog[]
): TimelineItem[] {
  const items: TimelineItem[] = [
    ...dailyRecords.map(
      (r): TimelineItem => ({ type: "daily_record", time: r.record_time, data: r })
    ),
    ...chatLogs.map(
      (c): TimelineItem => ({ type: "chat_log", time: c.send_time, data: c })
    ),
  ];
  items.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );
  return items;
}

export default async function UserDetail({ userId }: Props) {
  const {
    user,
    medicalHistories,
    medications,
    dailyRecords,
    chatLogs,
    hasError,
  } = await fetchUserData(userId);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">
            {hasError
              ? "データの取得に失敗しました"
              : "利用者情報が見つかりませんでした"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {hasError
              ? "ネットワーク接続またはSupabaseの設定を確認してください"
              : `ID: ${userId}`}
          </p>
        </div>
      </div>
    );
  }

  const timelineItems = buildTimeline(dailyRecords, chatLogs);

  return (
    <>
      {/* 上半分：基本情報（固定高さ・内部スクロール） */}
      <div className="bg-white border-b border-gray-200 h-64 flex-shrink-0 overflow-hidden">
        <UserProfile
          user={user}
          medicalHistories={medicalHistories}
          medications={medications}
        />
      </div>

      {/* 下半分：統合タイムライン（フィルター・追加ボタン付き） */}
      <TimelineSection
        items={timelineItems}
        userId={userId}
      />
    </>
  );
}
