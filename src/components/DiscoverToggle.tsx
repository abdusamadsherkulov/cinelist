import Link from "next/link";

export default function DiscoverToggle({ people }: { people: boolean }) {
  const on = "bg-accent text-black";
  const off = "text-zinc-400 hover:text-white";
  return (
    <div className="mt-5 inline-flex rounded-full border border-line bg-panel p-1 text-sm font-medium">
      <Link href="/discover" className={`rounded-full px-4 py-1.5 transition ${people ? off : on}`}>
        Movies &amp; actors
      </Link>
      <Link href="/discover?mode=people" className={`rounded-full px-4 py-1.5 transition ${people ? on : off}`}>
        Friends
      </Link>
    </div>
  );
}