import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";

export function ReportHeader({ brandName, url }: { brandName: string; url: string }) {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* keep raw */
  }

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Logo showWordmark={false} />
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Revenue Intelligence Report
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{brandName}</h1>
        <p className="text-sm text-muted-foreground">{host}</p>
      </div>
      <Badge variant="outline" className="w-fit">
        Prepared by GrowthOS
      </Badge>
    </header>
  );
}
