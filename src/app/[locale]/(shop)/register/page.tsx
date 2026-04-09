import { useTranslations } from "next-intl";
import { RegisterForm } from "@/components/shop/register-form";
import { Link } from "@/i18n/navigation";

export default function RegisterPage() {
  const t = useTranslations("auth");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm items-center px-4 py-12">
      <div className="w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("createAccount")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("registerDesc")}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 text-center">
          <p className="text-lg font-bold">🎁 {t("registerBonus")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("registerBonusDesc")}</p>
        </div>
        <RegisterForm />
        <p className="text-center text-xs text-muted-foreground">
          {t("hasAccount")}
          <Link href="/login" className="ml-1 font-medium text-primary hover:text-primary/80">
            {t("loginNow")}
          </Link>
        </p>
      </div>
    </div>
  );
}
