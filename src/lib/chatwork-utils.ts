/**
 * Chatwork データ処理用ユーティリティ関数
 * seed.ts から抽出した共有ロジック
 */

/**
 * 利用者名を正規化（スペース除去・半角カタカナ→全角カタカナ・異体字吸収）
 */
export function normalizeName(name: string): string {
  if (!name) return "";
  // スペース（半角・全角）を除去
  let n = name.replace(/[\s\u3000]/g, "");
  // 半角カタカナ → 全角カタカナ
  n = n.replace(/[\uFF66-\uFF9F]/g, (c) => {
    const halfToFull: Record<string, string> = {
      "\uFF66": "\u30F2", "\uFF67": "\u30A1", "\uFF68": "\u30A3",
      "\uFF69": "\u30A5", "\uFF6A": "\u30A7", "\uFF6B": "\u30A9",
      "\uFF6C": "\u30E3", "\uFF6D": "\u30E5", "\uFF6E": "\u30E7",
      "\uFF6F": "\u30C3", "\uFF70": "\u30FC", "\uFF71": "\u30A2",
      "\uFF72": "\u30A4", "\uFF73": "\u30A6", "\uFF74": "\u30A8",
      "\uFF75": "\u30AA", "\uFF76": "\u30AB", "\uFF77": "\u30AD",
      "\uFF78": "\u30AF", "\uFF79": "\u30B1", "\uFF7A": "\u30B3",
      "\uFF7B": "\u30B5", "\uFF7C": "\u30B7", "\uFF7D": "\u30B9",
      "\uFF7E": "\u30BB", "\uFF7F": "\u30BD", "\uFF80": "\u30BF",
      "\uFF81": "\u30C1", "\uFF82": "\u30C4", "\uFF83": "\u30C6",
      "\uFF84": "\u30C8", "\uFF85": "\u30CA", "\uFF86": "\u30CB",
      "\uFF87": "\u30CC", "\uFF88": "\u30CD", "\uFF89": "\u30CE",
      "\uFF8A": "\u30CF", "\uFF8B": "\u30D2", "\uFF8C": "\u30D5",
      "\uFF8D": "\u30D8", "\uFF8E": "\u30DB", "\uFF8F": "\u30DE",
      "\uFF90": "\u30DF", "\uFF91": "\u30E0", "\uFF92": "\u30E1",
      "\uFF93": "\u30E2", "\uFF94": "\u30E4", "\uFF95": "\u30E6",
      "\uFF96": "\u30E8", "\uFF97": "\u30E9", "\uFF98": "\u30EA",
      "\uFF99": "\u30EB", "\uFF9A": "\u30EC", "\uFF9B": "\u30ED",
      "\uFF9C": "\u30EF", "\uFF9D": "\u30F3", "\uFF9E": "\u309B",
      "\uFF9F": "\u309C",
    };
    return halfToFull[c] ?? c;
  });
  // 旧字カタカナ
  n = n.replace(/\u30F1/g, "\u30A8"); // ヱ → エ
  n = n.replace(/\u30F0/g, "\u30A4"); // ヰ → イ
  // CJK 互換漢字の異体字マッピング
  const cjkVariants: Record<string, string> = {
    "\uFA11": "\u5D0E", "\uFA10": "\u585A", "\uFA12": "\u6075",
    "\uFA15": "\u6D3B", "\uFA19": "\u7965", "\uFA1A": "\u7E41",
    "\uFA1B": "\u8077", "\uFA1C": "\u82A6", "\uFA1D": "\u9038",
    "\uFA1E": "\u905E", "\uFA67": "\u5C71", "\u2F804": "\u5C71",
  };
  n = n.replace(/[\uFA00-\uFA6F\uFA70-\uFAFF]/g, (c) => cjkVariants[c] ?? c);
  return n.normalize("NFC");
}

/**
 * 日付/日時文字列をJST（+09:00）の ISO8601 形式に変換
 */
export function toJSTTimestamp(raw: unknown): string | null {
  if (raw == null || String(raw).trim() === "") return null;
  const s = String(raw).trim().replace(/\//g, "-");
  const dateTimeMatch = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?)$/);
  if (dateTimeMatch) {
    const time = dateTimeMatch[2].length === 5
      ? dateTimeMatch[2] + ":00"
      : dateTimeMatch[2];
    return `${dateTimeMatch[1]}T${time}+09:00`;
  }
  const dateMatch = s.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dateMatch) {
    return `${dateMatch[1]}T00:00:00+09:00`;
  }
  return null;
}

/**
 * チャットログのカテゴリタグ推測
 */
export function inferCategoryTag(message: string): string {
  if (/便|尿|オムツ|パット/.test(message)) return "排泄";
  if (/熱|度|血圧|[Ss][Pp][Oo]2|痰/.test(message)) return "体調";
  if (/入眠|覚醒|鼾/.test(message)) return "睡眠";
  return "その他";
}
