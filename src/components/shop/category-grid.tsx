import Link from "next/link";
import { getCategories } from "@/lib/api/categories";

const colorMap: Record<string, string> = {
  popular: "bg-red-50 hover:bg-red-100",
  signature: "bg-amber-50 hover:bg-amber-100",
  dumplings: "bg-orange-50 hover:bg-orange-100",
  wontons: "bg-yellow-50 hover:bg-yellow-100",
  "pan-fried": "bg-stone-50 hover:bg-stone-100",
  specials: "bg-emerald-50 hover:bg-emerald-100",
};

export async function CategoryGrid() {
  const categories = await getCategories();

  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/categories/${cat.slug}`}
          className={`group flex flex-col items-center gap-2 rounded-2xl p-5 text-center transition-all ${colorMap[cat.slug] || "bg-muted hover:bg-muted/80"}`}
        >
          <span className="text-2xl font-bold text-foreground/80 group-hover:text-primary transition-colors md:text-3xl">
            {cat.name}
          </span>
          <span className="text-[11px] text-muted-foreground leading-tight md:text-xs">
            {cat.description?.split("，")[0]}
          </span>
        </Link>
      ))}
    </div>
  );
}
