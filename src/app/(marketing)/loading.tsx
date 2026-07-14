/**
 * Route-level loading skeleton for the marketing shell. Mirrors the hero
 * layout so the first paint feels intentional rather than blank.
 */
export default function MarketingLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        <div className="h-6 w-56 animate-pulse rounded-full bg-secondary" />
        <div className="h-16 w-full animate-pulse rounded-xl bg-secondary" />
        <div className="h-10 w-4/5 animate-pulse rounded-lg bg-secondary" />
        <div className="mt-4 flex w-full max-w-xl gap-3">
          <div className="h-12 flex-1 animate-pulse rounded-md bg-secondary" />
          <div className="h-12 w-40 animate-pulse rounded-md bg-secondary" />
        </div>
      </div>
      <div className="mt-20 h-72 w-full animate-pulse rounded-xl bg-secondary" />
    </div>
  );
}
