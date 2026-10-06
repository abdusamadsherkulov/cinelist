"use client";
import { usePathname } from "next/navigation";

export default function AppShell({ footer, children }: { footer: React.ReactNode; children: React.ReactNode }) {
    const pathname = usePathname();
    const inMessages = pathname === "/messages" || pathname.startsWith("/messages/");
    const inChat = /^\/messages\/[^/]+/.test(pathname);

    // messages: full-bleed, exactly the screen height, no footer.
    // on phones the bottom-bar space is only reserved while the bar is visible (list view, not inside a chat)
    if (inMessages) {
        return (
            <div className={`flex h-dvh min-w-0 flex-1 flex-col md:pb-0 ${inChat ? "" : "pb-16"}`}>
                <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-16 md:pb-0">
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-6 sm:px-6">{children}</main>
            {pathname === "/" && footer}
        </div>
    );
}