const MAP = {
  facile: "bg-success/15 text-success",
  moyen: "bg-warning/15 text-warning",
  difficile: "bg-danger/15 text-danger",
} as const;

export function Pill({ level, weight }: { level: keyof typeof MAP; weight?: number }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${MAP[level]}`}>
      {level}{weight != null && ` · ${weight}`}
    </span>
  );
}