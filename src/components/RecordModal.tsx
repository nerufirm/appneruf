"use client";

import { X } from "lucide-react";
import RecordForm from "./RecordForm";

type Props = {
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
};

export default function RecordModal({
  userId,
  onSuccess,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
      {/* バックドロップ */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* モーダル本体 */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-sm font-semibold text-gray-800">日次記録を追加</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <RecordForm
            userId={userId}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
