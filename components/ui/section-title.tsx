export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 font-display text-sm font-bold uppercase tracking-wide text-muted">
      {children}
    </h2>
  );
}