export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Store status bar skeleton */}
      <div className="border-b border-border/50 bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>

      {/* Delivery toggle skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="h-12 rounded-xl bg-muted" />
      </div>

      {/* Hot picks skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="h-5 w-28 rounded bg-muted mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-32 shrink-0">
              <div className="aspect-square rounded-xl bg-muted" />
              <div className="mt-1.5 h-3 w-20 rounded bg-muted" />
              <div className="mt-1 h-3 w-14 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Menu items skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <div className="h-5 w-24 rounded bg-muted mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 py-3.5">
            <div className="h-[92px] w-[92px] shrink-0 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="flex justify-between items-end">
                <div className="h-5 w-16 rounded bg-muted" />
                <div className="h-9 w-9 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
