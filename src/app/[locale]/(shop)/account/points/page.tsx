import { redirect } from "next/navigation";
import { ArrowLeft, Star, TrendingUp, TrendingDown, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getPointsBalance, getPointsRecords, POINTS_PER_YUAN } from "@/lib/api/points";

export default async function PointsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/points");

  const balance = await getPointsBalance(session.user.id);
  const records = await getPointsRecords(session.user.id);
  const cashValue = (balance / POINTS_PER_YUAN).toFixed(1);

  return <PointsPageContent balance={balance} records={records} cashValue={cashValue} />;
}

function PointsPageContent({ balance, records, cashValue }: {
  balance: number;
  records: Awaited<ReturnType<typeof getPointsRecords>>;
  cashValue: string;
}) {
  const t = useTranslations("points");
  const tAccount = useTranslations("account");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/account"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {tAccount("title")}
      </Link>

      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      {/* 积分余额卡片 */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          <span className="text-sm font-medium text-white/80">{t("available")}</span>
        </div>
        <p className="mt-2 text-4xl font-bold">{balance}</p>
        <p className="mt-1 text-sm text-white/70">{t("equivalent", { value: cashValue })}</p>
        <div className="mt-4 rounded-xl bg-white/15 p-3 text-xs text-white/80">
          {t("rule", { rate: POINTS_PER_YUAN })}
        </div>
      </div>

      {/* 积分明细 */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">{t("records")}</h2>
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((record) => {
              const isPositive = record.points > 0;
              return (
                <div
                  key={record.id}
                  className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {record.type === "EARN" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : record.type === "REDEEM" ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <Settings className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{record.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {record.points}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            {t("noRecords")}
          </div>
        )}
      </div>
    </div>
  );
}
