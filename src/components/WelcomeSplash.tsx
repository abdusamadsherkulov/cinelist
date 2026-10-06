"use client";
import { useEffect, useState } from "react";

const COOKIE = "cinelist-splash";
const EVENT = "cinelist:splash";
const DURATION = 1000; // ms

// now = true: show immediately (email login). now = false: only leave the flag (Google redirects away and back)
export function queueSplash(now = false) {
    document.cookie = `${COOKIE}=1; path=/; max-age=300; SameSite=Lax`;
    if (now) window.dispatchEvent(new Event(EVENT));
}

export default function WelcomeSplash({ initialShow }: { initialShow: boolean }) {
    const [show, setShow] = useState(initialShow);
    const [leaving, setLeaving] = useState(false);
    const [src, setSrc] = useState("/logo-intro.gif");

    useEffect(() => {
        const play = () => {
            setSrc(`/logo-intro.gif?t=${Date.now()}`); // starts the GIF from its first frame
            setLeaving(false);
            setShow(true);
        };
        window.addEventListener(EVENT, play);
        return () => window.removeEventListener(EVENT, play);
    }, []);

    useEffect(() => {
        if (!show) return;
        document.cookie = `${COOKIE}=; path=/; max-age=0`; // played once: don't replay
        const fade = setTimeout(() => setLeaving(true), DURATION);
        const done = setTimeout(() => setShow(false), DURATION + 300);
        return () => {
            clearTimeout(fade);
            clearTimeout(done);
        };
    }, [show]);

    if (!show) return null;
    return (
        <div
            onClick={() => setShow(false)} // tap to skip
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink transition-opacity duration-300 ${leaving ? "opacity-0" : "opacity-100"
                }`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="CineList" className="max-h-[40vh] w-[45vw] max-w-[180px] object-contain sm:max-h-[60vh] sm:w-[min(70vw,360px)] sm:max-w-none" />
        </div>
    );
}