import { Logo } from "@/components/shared/logo";

const advisorHighlights = [
  { title: "Homepage CTA", value: "+€2,300" },
  { title: "Missing upsells", value: "+€4,900" },
  { title: "Abandoned cart flow", value: "+€5,500" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">{children}</div>

      {/* Brand panel — reinforces the "AI Chief Revenue Officer" positioning. */}
      <aside className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="[&_span]:text-primary-foreground">
          <Logo />
        </div>

        <div className="max-w-md">
          <p className="text-2xl font-semibold leading-snug tracking-tight text-primary-foreground">
            Your AI Chief Revenue Officer — surfacing exactly where your next
            euro of growth is hiding.
          </p>

          <div className="mt-8 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-primary-foreground/60">
                Revenue opportunities
              </span>
              <span className="text-sm font-semibold text-primary-foreground">+€12,700</span>
            </div>
            <ul className="mt-4 space-y-3">
              {advisorHighlights.map((item) => (
                <li key={item.title} className="flex items-center justify-between text-sm">
                  <span className="text-primary-foreground/80">{item.title}</span>
                  <span className="font-medium text-primary-foreground">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/50">
          Trusted by growing ecommerce brands.
        </p>
      </aside>
    </div>
  );
}
