import { MessageCircle } from "lucide-react";

export default function MessagesHome() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                <MessageCircle size={30} />
            </div>
            <p className="text-lg font-semibold">Your messages</p>
            <p className="max-w-xs text-sm text-zinc-500">Pick a friend on the left to chat, or share a movie with them 🎬</p>
        </div>
    );
}