"use client";
import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { normalizeUsername, usernameError } from "@/lib/username";

type State = { kind: "idle" | "checking" | "ok" | "bad"; msg?: string };

export default function UsernameInput({ onStatus, autoFocus }: { onStatus?: (ok: boolean) => void; autoFocus?: boolean }) {
    const [v, setV] = useState("");
    const [state, setState] = useState<State>({ kind: "idle" });

    useEffect(() => {
        const u = normalizeUsername(v);
        if (!u) {
            setState({ kind: "idle" });
            onStatus?.(false);
            return;
        }
        const local = usernameError(u);
        if (local) {
            setState({ kind: "bad", msg: local });
            onStatus?.(false);
            return;
        }
        setState({ kind: "checking" });
        onStatus?.(false);
        const ctrl = new AbortController();
        const t = setTimeout(async () => {
            try {
                const r = await fetch(`/api/username?u=${encodeURIComponent(u)}`, { signal: ctrl.signal });
                const d = await r.json();
                if (d.available) {
                    setState({ kind: "ok", msg: "Available" });
                    onStatus?.(true);
                } else {
                    setState({ kind: "bad", msg: d.reason ?? "Not available" });
                    onStatus?.(false);
                }
            } catch {
                /* superseded by a newer keystroke */
            }
        }, 350);
        return () => {
            clearTimeout(t);
            ctrl.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [v]);

    return (
        <div>
            <div className="relative">
                <input
                    name="username"
                    value={v ? `@${v}` : ""}
                    onChange={(e) => setV(e.target.value.replace(/^@+/, "").toLowerCase().replace(/\s/g, ""))}
                    placeholder="Username"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={21}
                    autoFocus={autoFocus}
                    className="input !pr-9"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {state.kind === "checking" && <Loader2 size={16} className="animate-spin text-zinc-500" />}
                    {state.kind === "ok" && <Check size={16} className="text-emerald-400" />}
                    {state.kind === "bad" && <X size={16} className="text-red-400" />}
                </span>
            </div>
            {state.msg && (
                <p className={`mt-1 text-xs ${state.kind === "ok" ? "text-emerald-400" : "text-red-400"}`}>{state.msg}</p>
            )}
        </div>
    );
}