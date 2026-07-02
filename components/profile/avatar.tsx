import Image from "next/image";

export function Avatar({
  url, name, size = 40,
}: { url: string | null; name?: string; size?: number }) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name ?? "avatar"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-primary/15 font-semibold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {(name ?? "?").charAt(0).toUpperCase()}
    </div>
  );
}