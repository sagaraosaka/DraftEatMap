"use client";

import { useState } from "react";
import { signInWithMagicLink, signInWithGoogle } from "@/lib/auth";

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
          <div className="flex flex-col gap-3">
          {/* Googleログイン */}
          <button
            onClick={() => signInWithGoogle()}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-eat-border bg-eat-surface text-sm font-medium text-eat-text transition-colors hover:bg-eat-surface2"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Googleでログイン
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-eat-border" />
            <span className="text-[11px] text-eat-text3">またはメールで</span>
            <div className="flex-1 h-px bg-eat-border" />
          </div>

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
          </div>
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
