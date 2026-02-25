import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { UserSummary } from "@/types";
import UserList from "@/components/UserList";
import UserDetail from "@/components/UserDetail";
import Dashboard from "@/components/Dashboard";
import StaffHeader from "@/components/StaffHeader";

async function getUsers(): Promise<UserSummary[]> {
  // status カラムが追加済みであればそれを取得、未追加でも空リストにならないようフォールバック
  const { data, error } = await supabase
    .from("users")
    .select("id, name, building_room, status")
    .order("building_room", { ascending: true });

  if (error) {
    // status カラムが存在しない場合はカラムなしで再取得
    if (error.message.includes("column users.status does not exist")) {
      const fallback = await supabase
        .from("users")
        .select("id, name, building_room")
        .order("building_room", { ascending: true });
      if (fallback.error) {
        console.error("Failed to fetch users:", fallback.error.message);
        return [];
      }
      return (fallback.data ?? []).map((u) => ({ ...u, status: null }));
    }
    console.error("Failed to fetch users:", error.message);
    return [];
  }
  return data ?? [];
}

/** ダッシュボードのスケルトン UI */
function DashboardLoadingState() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* ヘッダースケルトン */}
        <div className="space-y-2">
          <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-7 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        {/* サマリカードスケルトン */}
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="space-y-2">
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        {/* アラートパネルスケルトン */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
          {[0, 1].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        {/* タイムラインスケルトン */}
        <div className="space-y-3">
          <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-14 bg-white border border-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** データ取得中のスケルトン UI */
function LoadingState() {
  return (
    <>
      {/* プロフィールスケルトン */}
      <div className="bg-white border-b border-gray-200 h-64 flex-shrink-0 p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* タイムラインスケルトン */}
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-4" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-16 bg-white rounded-lg border border-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const cookieStore = await cookies();
  if (!cookieStore.get("appsheetto_staff")) {
    redirect("/login");
  }

  const { userId } = await searchParams;
  const users = await getUsers();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-50">
      {/* スタッフヘッダー */}
      <StaffHeader />

      {/* メインレイアウト */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左カラム：サイドバー（利用者リスト） */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <UserList users={users} selectedUserId={userId} />
        </aside>

        {/* 右カラム：メインコンテンツ */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {userId ? (
            // key={userId} でユーザー切替時に Suspense がリセットされロード状態を表示
            <Suspense key={userId} fallback={<LoadingState />}>
              <UserDetail userId={userId} />
            </Suspense>
          ) : (
            <Suspense fallback={<DashboardLoadingState />}>
              <Dashboard />
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
