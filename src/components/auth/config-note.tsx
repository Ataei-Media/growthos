/** Dev-only hint shown when Supabase credentials are still placeholders. */
export function ConfigNote() {
  return (
    <p className="mb-4 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-muted-foreground">
      Supabase isn&apos;t connected in this environment yet, so authentication is
      disabled. Add your project keys to <code>.env.local</code> to enable it.
    </p>
  );
}
