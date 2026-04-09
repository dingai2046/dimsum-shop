"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const t = useTranslations("auth");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError(t("loginError"));
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="space-y-6">
      {registered && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{t("registerSuccess")}</div>
      )}

      <Button type="button" variant="outline" className="h-12 w-full rounded-xl gap-3 text-sm font-medium" disabled={googleLoading} onClick={handleGoogleLogin}>
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {googleLoading ? t("redirecting") : t("googleLogin")}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
        <div className="relative flex justify-center text-xs"><span className="bg-background px-3 text-muted-foreground">{t("orEmailLogin")}</span></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">{t("email")}</label>
          <Input id="email" name="email" type="email" placeholder="your@email.com" required className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">{t("password")}</label>
          <Input id="password" name="password" type="password" placeholder="••••••" required className="h-11 rounded-xl" />
        </div>
        <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-semibold">
          {loading ? t("loggingIn") : t("loginBtn")}
        </Button>
        <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-medium">{t("demoAccount")}</p>
          <p>{t("demoInfo")}</p>
        </div>
      </form>
    </div>
  );
}
