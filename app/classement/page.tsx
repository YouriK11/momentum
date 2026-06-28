import { Leaderboard } from "@/components/leaderboard";

export default function ClassementPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 pt-10 text-neutral-100 pb-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-semibold">Classement</h1>
        {/* On affiche ta brique visuelle ici */}
        <Leaderboard rows={[]} meId="123" />
      </div>
    </main>
  );
}
