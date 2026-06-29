import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background text-center">
      <div>
        <p
          className="font-display font-black leading-none"
          style={{ fontSize: "clamp(80px, 14vw, 128px)", color: "rgba(255,255,255,0.04)" }}
        >
          404
        </p>
        <h1 className="font-display -mt-4 text-2xl font-black">Page introuvable</h1>
        <p className="mt-2 text-[14px] text-muted">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Link
        href="/home"
        className="flex items-center gap-2 rounded-[14px] px-6 py-3 text-sm font-semibold text-white"
        style={{ background: "var(--color-primary)", boxShadow: "0 0 20px rgba(252,82,0,0.3)" }}
      >
        <Home size={15} />
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
