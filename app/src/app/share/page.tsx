"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MapsProvider from "@/components/layout/MapsProvider";
import { useMapsLoaded } from "@/components/layout/MapsProvider";
import { AddStoreForm } from "@/components/store/AddStore";

function ShareContent() {
  const params = useSearchParams();
  const router = useRouter();

  const title = params.get("title") ?? "";
  const text = params.get("text") ?? "";
  // URLを除いたテキストから店名候補を抽出
  const initialQuery = title || text.replace(/https?:\/\/\S+/g, "").trim();

  const isLoaded = useMapsLoaded();

  return (
    <div className="flex h-full flex-col bg-eat-bg">
      <div className="flex items-center gap-2 border-b border-eat-border px-4 py-3 pt-safe">
        <button
          onClick={() => router.push("/list")}
          className="text-[13px] text-eat-text3"
        >
          ✕
        </button>
        <p className="text-[14px] font-semibold text-eat-text">共有から追加</p>
      </div>

      {!isLoaded ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-eat-text3">読み込み中...</p>
        </div>
      ) : (
        <AddStoreForm
          initialQuery={initialQuery}
          onClose={() => router.push("/list")}
          onSaved={() => router.push("/list")}
        />
      )}
    </div>
  );
}

export default function SharePage() {
  return (
    <MapsProvider>
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-eat-bg">
            <p className="text-sm text-eat-text3">読み込み中...</p>
          </div>
        }
      >
        <ShareContent />
      </Suspense>
    </MapsProvider>
  );
}
