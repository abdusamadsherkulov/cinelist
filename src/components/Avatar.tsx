export default function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-bold text-accent"
    >
      {(name.trim()[0] ?? "?").toUpperCase()}
    </div>
  );
}