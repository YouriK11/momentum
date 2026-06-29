"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "rgba(236,100,128,0.1)", border: "1px solid rgba(236,100,128,0.2)" }}
      >
        <AlertTriangle size={28} style={{ color: "var(--color-danger)" }} />
      </div>
      <div>
        <h1 className="font-display text-2xl font-black">Quelque chose a planté</h1>
        <p className="mt-2 text-[14px] text-muted">
          Une erreur inattendue s&apos;est produite. Tu peux réessayer.
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={reset}
        className="flex items-center gap-2 rounded-[14px] px-6 py-3 text-sm font-semibold text-white"
        style={{ background: "var(--color-primary)", boxShadow: "0 0 20px rgba(252,82,0,0.3)" }}
      >
        <RotateCcw size={15} />
        Réessayer
      </motion.button>
    </div>
  );
}
