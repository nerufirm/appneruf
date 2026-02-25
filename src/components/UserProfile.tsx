import { User, Heart, Pill } from "lucide-react";
import type { UserDetail, MedicalHistory, Medication } from "@/types";

type Props = {
  user: UserDetail;
  medicalHistories: MedicalHistory[];
  medications: Medication[];
};

const CARE_LEVEL_COLORS: Record<string, string> = {
  要支援1: "bg-green-100 text-green-700",
  要支援2: "bg-green-100 text-green-700",
  要介護1: "bg-yellow-100 text-yellow-700",
  要介護2: "bg-yellow-100 text-yellow-700",
  要介護3: "bg-orange-100 text-orange-700",
  要介護4: "bg-red-100 text-red-700",
  要介護5: "bg-red-100 text-red-700",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "未設定";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  } catch {
    return dateStr;
  }
}

export default function UserProfile({
  user,
  medicalHistories,
  medications,
}: Props) {
  const careLevelClass = user.care_level
    ? (CARE_LEVEL_COLORS[user.care_level] ?? "bg-gray-100 text-gray-700")
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー：アバター・名前・属性バッジ */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-white">
            {user.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-gray-900">{user.name}</h2>
            {user.gender && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {user.gender}
              </span>
            )}
            {user.care_level && careLevelClass && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${careLevelClass}`}
              >
                {user.care_level}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {user.building_room ?? "部屋未設定"}
          </p>
        </div>
      </div>

      {/* コンテンツ：3カラムグリッド（スクロール可） */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-3">
        <div className="grid grid-cols-3 gap-6">
          {/* 基本情報 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <User className="w-3 h-3" />
              基本情報
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-gray-400">生年月日</dt>
                <dd className="text-sm text-gray-800">
                  {formatDate(user.birth_date)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">かかりつけ医</dt>
                <dd className="text-sm text-gray-800">
                  {user.primary_doctor ?? "未設定"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">キーパーソン</dt>
                <dd className="text-sm text-gray-800">
                  {user.emergency_contact ?? "未設定"}
                </dd>
              </div>
            </dl>
          </div>

          {/* 既往歴 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Heart className="w-3 h-3" />
              既往歴
            </h3>
            {medicalHistories.length === 0 ? (
              <p className="text-xs text-gray-400">記録なし</p>
            ) : (
              <ul className="space-y-1.5">
                {medicalHistories.map((h) => (
                  <li key={h.id}>
                    <span className="text-sm text-gray-800">
                      {h.disease_name ?? "不明"}
                    </span>
                    {h.onset_date && (
                      <span className="text-xs text-gray-400 ml-1.5">
                        {h.onset_date}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 内服薬 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Pill className="w-3 h-3" />
              内服薬
            </h3>
            {medications.length === 0 ? (
              <p className="text-xs text-gray-400">記録なし</p>
            ) : (
              <ul className="space-y-2">
                {medications.map((m) => (
                  <li key={m.id}>
                    <span className="text-sm text-gray-800">
                      {m.medicine_name ?? "不明"}
                    </span>
                    {(m.timing || m.dosage) && (
                      <p className="text-xs text-gray-400">
                        {[m.timing, m.dosage].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
