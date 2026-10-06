"use client";
import { useTransition } from "react";
import Link from "next/link";
import { Check, Clock, MessageCircle, UserPlus, UserX, X } from "lucide-react";
import { removeFriendship, respondToRequest, sendFriendRequest } from "@/app/actions";

export type FriendStatus = "none" | "sent" | "received" | "friends";

export default function FriendButton({
    otherId,
    status,
    friendshipId,
    showMessage = false,
    iconOnly = false,
    onChange,
}: {
    otherId: string;
    status: FriendStatus;
    friendshipId?: string;
    showMessage?: boolean;
    iconOnly?: boolean;
    onChange?: () => void;
}) {
    const [pending, start] = useTransition();
    const busy = pending ? "pointer-events-none opacity-60" : "";
    const run = (fn: () => Promise<unknown>) =>
        start(async () => {
            try {
                await fn();
                onChange?.();
            } catch (e) {
                alert((e as Error).message);
            }
        });

    if (status === "none")
        return (
            <button className={`btn-primary ${busy}`} onClick={() => run(() => sendFriendRequest(otherId))}>
                <UserPlus size={16} /> Add friend
            </button>
        );

    if (status === "sent")
        return (
            <button className={`btn ${busy}`} title="Cancel request" onClick={() => run(() => removeFriendship(otherId))}>
                <Clock size={16} /> Request sent · Cancel
            </button>
        );

    if (status === "received")
        return (
            <div className={`flex gap-2 ${busy}`}>
                <button className="btn-primary" onClick={() => run(() => respondToRequest(friendshipId!, true))}>
                    <Check size={16} /> Accept
                </button>
                <button className="btn" onClick={() => run(() => respondToRequest(friendshipId!, false))}>
                    <X size={16} /> Decline
                </button>
            </div>
        );

    return (
        <div className={`flex flex-wrap gap-2 ${busy}`}>
            {showMessage && (
                <Link
                    href={`/messages/${otherId}`}
                    aria-label="Message"
                    title="Message"
                    className={iconOnly ? "btn-primary !px-3" : "btn-primary"}
                >
                    <MessageCircle size={16} />
                    {!iconOnly && "Message"}
                </Link>
            )}
            <button
                aria-label="Unfriend"
                title="Unfriend"
                className={iconOnly ? "btn !px-3 hover:!border-red-400 hover:!text-red-400" : "btn"}
                onClick={() => confirm("Remove this friend?") && run(() => removeFriendship(otherId))}
            >
                <UserX size={16} />
                {!iconOnly && "Unfriend"}
            </button>
        </div>
    );
}