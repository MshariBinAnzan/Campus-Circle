"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Avatar } from "@/components/PostCard";
import { Loader2, Send, ChevronLeft } from "lucide-react";

type Message = {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    read: boolean;
    created_at: string;
};

type Profile = {
    id: string;
    display_name: string;
    avatar_url: string | null;
};

export default function ConversationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const supabase = createClient();
    const [partnerId, setPartnerId] = useState("");
    const [partner, setPartner] = useState<Profile | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [myId, setMyId] = useState("");
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        params.then(({ id }) => setPartnerId(id));
    }, [params]);

    useEffect(() => {
        if (!partnerId) return;
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setMyId(user.id);

            const [{ data: partnerData }, { data: msgs }] = await Promise.all([
                supabase.from("profiles").select("*").eq("id", partnerId).single(),
                supabase
                    .from("messages")
                    .select("*")
                    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
                    .order("created_at", { ascending: true }),
            ]);

            setPartner(partnerData as Profile);
            setMessages((msgs ?? []) as Message[]);
            setLoading(false);

            // Mark unread as read
            await supabase
                .from("messages")
                .update({ read: true })
                .eq("sender_id", partnerId)
                .eq("receiver_id", user.id)
                .eq("read", false);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [partnerId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() || !partnerId || !myId) return;
        setSending(true);
        const newMsg = {
            sender_id: myId,
            receiver_id: partnerId,
            content: text.trim(),
        };
        const { data } = await supabase.from("messages").insert(newMsg).select().single();
        if (data) setMessages((prev) => [...prev, data as Message]);
        setText("");
        setSending(false);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 3.5rem)", gap: 0 }}>
            {/* Header */}
            <div
                className="glass"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.85rem 1.1rem",
                    borderRadius: "14px 14px 0 0",
                    borderBottom: "1px solid var(--border)",
                    flexShrink: 0,
                }}
            >
                <Link href="/app/messages" style={{ color: "var(--text-muted)", lineHeight: 0 }}>
                    <ChevronLeft size={20} />
                </Link>
                {partner && (
                    <>
                        <Avatar name={partner.display_name} avatarUrl={partner.avatar_url} size={34} />
                        <Link href={`/app/profile/${partner.id}`} style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", textDecoration: "none" }}>
                            {partner.display_name}
                        </Link>
                    </>
                )}
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                    background: "rgba(255,255,255,0.02)",
                }}
            >
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                        <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                    </div>
                ) : messages.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", padding: "2rem 0" }}>
                        No messages yet. Say hello! 👋
                    </p>
                ) : (
                    messages.map((m) => {
                        const isMine = m.sender_id === myId;
                        return (
                            <div
                                key={m.id}
                                style={{
                                    display: "flex",
                                    justifyContent: isMine ? "flex-end" : "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "70%",
                                        padding: "0.55rem 0.9rem",
                                        borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                        background: isMine
                                            ? "linear-gradient(135deg,#6366f1,#a855f7)"
                                            : "rgba(255,255,255,0.08)",
                                        border: isMine ? "none" : "1px solid var(--border)",
                                        fontSize: "0.875rem",
                                        lineHeight: 1.5,
                                        color: isMine ? "#fff" : "var(--text)",
                                    }}
                                >
                                    {m.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={sendMessage}
                style={{
                    display: "flex",
                    gap: "0.6rem",
                    padding: "0.85rem 1rem",
                    borderTop: "1px solid var(--border)",
                    background: "rgba(15,15,26,0.95)",
                    borderRadius: "0 0 14px 14px",
                    flexShrink: 0,
                }}
            >
                <input
                    className="input"
                    placeholder="Type a message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ flex: 1 }}
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="btn btn-primary"
                    style={{ padding: "0 1rem", flexShrink: 0 }}
                >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
            </form>
        </div>
    );
}
