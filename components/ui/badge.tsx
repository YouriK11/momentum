export function Badge({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm">
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </span>
  );
}