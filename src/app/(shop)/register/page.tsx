import type { Metadata } from "next";
import { RegisterForm } from "@/components/shop/register-form";

export const metadata: Metadata = {
  title: "注册",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm items-center px-4 py-12">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">创建账号</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            注册成为東方點心会员
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-xs text-muted-foreground">
          已有账号？
          <a href="/login" className="ml-1 font-medium text-primary hover:text-primary/80">
            立即登录
          </a>
        </p>
      </div>
    </div>
  );
}
