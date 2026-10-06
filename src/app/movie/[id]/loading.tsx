export default function Loading() {
    const line = "rounded bg-line";

    return (
        <div className="-mt-6 animate-pulse">
            {/* banner */}
            <div className="-mx-4 h-64 bg-gradient-to-b from-panel to-ink sm:-mx-6 sm:h-80" />

            <div className="relative z-10 -mt-32 grid gap-8 md:grid-cols-[260px_1fr]">
                {/* poster */}
                <div className="mx-auto aspect-[2/3] w-52 rounded-2xl border border-line bg-panel md:w-full" />

                <div className="pt-4 md:pt-1">
                    {/* title + tagline */}
                    <div className="h-10 w-3/4 rounded-lg bg-line sm:h-12" />
                    <div className={`mt-3 h-4 w-1/3 ${line}`} />

                    {/* genres + runtime */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <div className="h-7 w-20 rounded-full bg-line" />
                        <div className="h-7 w-24 rounded-full bg-line" />
                        <div className="h-7 w-16 rounded-full bg-line" />
                        <div className={`ml-1 h-4 w-12 ${line}`} />
                    </div>

                    {/* TMDB + community scores */}
                    <div className="mt-5 flex gap-8">
                        <div>
                            <div className={`h-3 w-10 ${line}`} />
                            <div className="mt-2 h-7 w-16 rounded bg-line" />
                        </div>
                        <div>
                            <div className={`h-3 w-24 ${line}`} />
                            <div className="mt-2 h-7 w-20 rounded bg-line" />
                        </div>
                    </div>

                    {/* overview */}
                    <div className="mt-5 max-w-3xl space-y-2">
                        <div className={`h-4 w-full ${line}`} />
                        <div className={`h-4 w-full ${line}`} />
                        <div className={`h-4 w-2/3 ${line}`} />
                    </div>

                    {/* action buttons: favorite, watchlist, save, share */}
                    <div className="mt-6 flex gap-3">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="h-11 w-11 rounded-full border border-line bg-panel" />
                        ))}
                    </div>

                    {/* your rating */}
                    <div className="mt-6">
                        <div className={`mb-2 h-4 w-24 ${line}`} />
                        <div className="flex gap-1">
                            {Array.from({ length: 10 }, (_, i) => (
                                <div key={i} className="h-6 w-6 rounded bg-line" />
                            ))}
                        </div>
                    </div>

                    {/* trailer button */}
                    <div className="mt-6 h-10 w-40 rounded-full bg-line" />

                    {/* cast */}
                    <div className={`mt-6 h-4 w-2/3 ${line}`} />
                </div>
            </div>

            {/* comments + private notes */}
            <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_380px]">
                <div>
                    <div className="h-6 w-40 rounded bg-line" />
                    <div className="mt-4 h-24 rounded-lg border border-line bg-panel" />
                    <div className="mt-3 h-10 w-36 rounded-full bg-line" />
                    <div className="mt-6 space-y-4">
                        {[0, 1].map((i) => (
                            <div key={i} className="rounded-xl border border-line bg-panel p-4">
                                <div className={`h-3 w-28 ${line}`} />
                                <div className={`mt-3 h-4 w-full ${line}`} />
                                <div className={`mt-2 h-4 w-3/4 ${line}`} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="h-60 rounded-2xl border border-dashed border-line bg-panel/60" />
            </div>
        </div>
    );
}