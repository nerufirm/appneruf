"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { getStaffFromCookie } from "@/lib/staffCookie";
import type { StaffSession } from "@/lib/staffCookie";

/** ブラウザのローカル時刻を datetime-local 入力値の形式に変換 */
function toLocalInputValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - offset);
  return local.toISOString().slice(0, 16);
}

type FormValues = {
  record_time: string;
  staff_id: string;
  body_temp: string;
  bp_high: string;
  bp_low: string;
  pulse: string;
  spo2: string;
  excretion_urine: string;
  meal_amount: string;
};

type Props = {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function RecordForm({ userId, onSuccess, onCancel }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentStaff, setCurrentStaff] = useState<StaffSession | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      record_time: toLocalInputValue(new Date()),
      staff_id: "",
    },
  });

  // ログイン中のスタッフ情報を Cookie から取得してセット
  useEffect(() => {
    const staff = getStaffFromCookie();
    if (staff) {
      setCurrentStaff(staff);
      setValue("staff_id", staff.id);
    }
  }, [setValue]);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);

    const { error } = await supabase.from("daily_records").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      staff_id: values.staff_id || null,
      record_time: new Date(values.record_time).toISOString(),
      body_temp: values.body_temp ? parseFloat(values.body_temp) : null,
      bp_high: values.bp_high ? parseInt(values.bp_high, 10) : null,
      bp_low: values.bp_low ? parseInt(values.bp_low, 10) : null,
      pulse: values.pulse ? parseInt(values.pulse, 10) : null,
      spo2: values.spo2 ? parseInt(values.spo2, 10) : null,
      excretion_urine: values.excretion_urine || null,
      meal_amount: values.meal_amount || null,
    });

    if (error) {
      setSubmitError(`登録に失敗しました: ${error.message}`);
      return;
    }

    onSuccess();
  }

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* 記録時間 */}
      <div>
        <label className={labelClass}>
          記録時間 <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          {...register("record_time", { required: true })}
          className={inputClass}
        />
      </div>

      {/* 記録者（自動セット・読み取り専用） */}
      <div>
        <label className={labelClass}>記録者</label>
        <div className="px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-700">
          {currentStaff ? currentStaff.name : "—"}
        </div>
        <input type="hidden" {...register("staff_id")} />
      </div>

      {/* バイタル */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          バイタル
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>体温 (℃)</label>
            <input
              type="number"
              step="0.1"
              min="30"
              max="45"
              placeholder="36.5"
              {...register("body_temp")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>脈拍 (回/分)</label>
            <input
              type="number"
              min="0"
              max="300"
              placeholder="80"
              {...register("pulse")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>血圧 上 (mmHg)</label>
            <input
              type="number"
              min="0"
              max="300"
              placeholder="120"
              {...register("bp_high")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>血圧 下 (mmHg)</label>
            <input
              type="number"
              min="0"
              max="200"
              placeholder="80"
              {...register("bp_low")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>SpO2 (%)</label>
            <input
              type="number"
              min="50"
              max="100"
              placeholder="98"
              {...register("spo2")}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* 排泄・食事 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          排泄・食事
        </p>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>排尿</label>
            <input
              type="text"
              placeholder="例: あり、200ml"
              {...register("excretion_urine")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>食事量</label>
            <input
              type="text"
              placeholder="例: 7割以上、全量"
              {...register("meal_amount")}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {submitError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {submitError}
        </p>
      )}

      {/* ボタン */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "保存中..." : "記録を追加"}
        </button>
      </div>
    </form>
  );
}
