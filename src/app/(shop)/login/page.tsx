import type { Metadata } from "next";
import { LoginForm } from "@/components/shop/login-form";

export const metadata: Metadata = {
  title: "登录",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm items-center px-4 py-12">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">欢迎回来</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            登录你的東方點心账号
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          还没有账号？
          <a href="/register" className="ml-1 font-medium text-primary hover:text-primary/80">
            立即注册
          </a>
        </p>
      </div>
    </div>
  );
}
