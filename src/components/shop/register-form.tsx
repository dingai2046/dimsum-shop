"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要6位");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败，请重试");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("网络错误，请重试");
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "wechat") {
    setSocialLoading(provider);
    await signIn(provider, { callbackUrl: "/" });
  }

  return (
    <div className="space-y-6">
      {/* 第三方快捷注册 */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-xl gap-3 text-sm font-medium"
          disabled={socialLoading === "wechat"}
          onClick={() => handleSocialLogin("wechat")}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="#07C160">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.42 6.42 0 01-.246-1.78c0-3.558 3.39-6.467 7.543-6.467.325 0 .639.029.951.06C15.09 3.936 12.169 2.188 8.691 2.188zm-2.31 4.544c.558 0 1.01.44 1.01.984s-.452.983-1.01.983c-.558 0-1.01-.44-1.01-.983s.452-.984 1.01-.984zm4.62 0c.558 0 1.01.44 1.01.984s-.452.983-1.01.983c-.558 0-1.01-.44-1.01-.983s.452-.984 1.01-.984z"/>
            <path d="M23.998 14.637c0-3.259-3.254-5.907-7.24-5.907-4.06 0-7.241 2.648-7.241 5.907 0 3.259 3.181 5.907 7.241 5.907.833 0 1.629-.135 2.378-.334a.672.672 0 01.56.078l1.498.882a.262.262 0 00.133.043c.128 0 .233-.108.233-.236 0-.058-.023-.113-.038-.17l-.307-1.163a.474.474 0 01.167-.524c1.523-1.1 2.616-2.8 2.616-4.483zm-9.547-1.143c-.434 0-.786-.34-.786-.759s.352-.76.786-.76c.434 0 .786.34.786.76s-.352.76-.786.76zm4.614 0c-.434 0-.786-.34-.786-.759s.352-.76.786-.76c.434 0 .786.34.786.76s-.352.76-.786.76z"/>
          </svg>
          {socialLoading === "wechat" ? "跳转中..." : "微信快捷注册"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-xl gap-3 text-sm font-medium"
          disabled={socialLoading === "google"}
          onClick={() => handleSocialLogin("google")}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {socialLoading === "google" ? "跳转中..." : "Google 快捷注册"}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">或使用邮箱注册</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">姓名</label>
          <Input id="name" name="name" type="text" placeholder="你的姓名" required className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">邮箱</label>
          <Input id="email" name="email" type="email" placeholder="your@email.com" required className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">密码</label>
          <Input id="password" name="password" type="password" placeholder="至少6位" required minLength={6} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">确认密码</label>
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="再次输入密码" required className="h-11 rounded-xl" />
        </div>
        <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-semibold">
          {loading ? "注册中..." : "注册"}
        </Button>
      </form>
    </div>
  );
}
