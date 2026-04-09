import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

interface SuccessPageProps {
  searchParams: Promise<{ orderNo?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderNo = params.orderNo || "";

  return <SuccessContent orderNo={orderNo} />;
}

function SuccessContent({ orderNo }: { orderNo: string }) {
  const t = useTranslations("orders");

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>

      <h1 className="text-2xl font-bold">{t("orderSuccess")}</h1>
      <p className="mt-2 text-muted-foreground">
        {t("successHint")}
      </p>

      {orderNo && (
        <div className="mt-6 rounded-xl bg-muted p-4">
          <p className="text-sm text-muted-foreground">{t("orderNo")}</p>
          <p className="mt-1 font-mono text-lg font-semibold">{orderNo}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/products"
          className={buttonVariants({
            size: "lg",
            className: "h-12 rounded-full",
          })}
        >
          {t("continueShopping")}
        </Link>
        <Link
          href="/"
          className={buttonVariants({
            size: "lg",
            variant: "outline",
            className: "h-12 rounded-full",
          })}
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
