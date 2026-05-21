"use client";

import { useState } from "react";
import { signInWithMagicLink } from "@/lib/auth";

type Step = "input" | "sent";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithMagicLink(email);
      setStep("sent");
    } catch {
      setError("送信に失敗しました。メールアドレスを確認してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-full flex-col items-center justify-center px-8">
      <div className="w-full max-w-sm">

        {/* ロゴ */}
        <div className="mb-10 text-center">
          <div className="mb-3 flex justify-center">
            <span className="inline-block h-3 w-3 rounded-full bg-eat-accent" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-eat-text">
            DraftEatMap
          </h1>
          <p className="mt-1.5 text-sm text-eat-text3">
            行きたい店を保存・管理する
          </p>
        </div>

        {step === "input" ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-eat-text2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                className="h-11 rounded-lg border border-eat-border bg-eat-surface px-3 text-sm text-eat-text placeholder:text-eat-text3 outline-none transition-colors focus:border-eat-border2 focus:ring-2 focus:ring-eat-text/5"
              />
            </div>

            {error && (
              <p className="text-xs text-eat-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="mt-1 h-11 rounded-lg bg-eat-text text-sm font-semibold text-eat-bg transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              {loading ? "送信中..." : "ログインリンクを送信"}
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-eat-border bg-eat-surface p-6 text-center">
            <div className="mb-3 text-2xl">📬</div>
            <p className="text-sm font-semibold text-eat-text">
              メールを確認してください
            </p>
            <p className="mt-2 text-xs leading-relaxed text-eat-text2">
              <span className="font-medium text-eat-text">{email}</span> に
              ログインリンクを送りました。
              <br />
              リンクをクリックするとログインできます。
            </p>
            <button
              onClick={() => setStep("input")}
              className="mt-4 text-xs text-eat-text3 underline underline-offset-2"
            >
              メールアドレスを変更する
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
