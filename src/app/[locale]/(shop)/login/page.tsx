import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/shop/login-form";
import { Link } from "@/i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm items-center px-4 py-12">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("welcome")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("loginDesc")}</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-center text-xs text-muted-foreground">
          {t("noAccount")}
          <Link href="/register" className="ml-1 font-medium text-primary hover:text-primary/80">
            {t("registerNow")}
          </Link>
        </p>
      </div>
    </div>
  );
}
