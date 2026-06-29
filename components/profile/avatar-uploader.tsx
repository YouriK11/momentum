"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/profile/avatar";

export function AvatarUploader({
  userId, username, avatarUrl,
}: { userId: string; username: string; avatarUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choisis une image.");
    if (file.size > 5 * 1024 * 1024) return setError("Image trop lourde (max 5 Mo).");

    setBusy(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setError(upErr.message); setBusy(false); return; }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?v=${Date.now()}`;

    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    if (dbErr) { setError(dbErr.message); setBusy(false); return; }

    setPreview(url);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={() => inputRef.current?.click()} className="group relative rounded-full" aria-label="Changer la photo de profil">
        <Avatar url={preview} name={username} size={96} />
        <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50 text-xs text-white opacity-0 transition group-hover:opacity-100">
          Changer
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
      {busy && <p className="text-xs text-muted">Envoi…</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}