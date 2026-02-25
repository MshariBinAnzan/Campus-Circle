"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Avatar } from "@/components/PostCard";

type Conversation = {
    partnerId: string;
    partnerName: string;
    partnerAvatar: string | null;
    lastMessage: string;
    lastAt: string;
    unread: number;
};

export default function MessagesPage() {
    const supabase = createClient();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get all messages involving me
            const { data: msgs } = await supabase
                .from("messages")
                .select("*, sender:profiles!messages_sender_id_fkey(id, display_name, avatar_url), receiver:profiles!messages_receiver_id_fkey(id, display_name, avatar_url)")
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order("created_at", { ascending: false });

            if (!msgs) { setLoading(false); return; }

            // Group into conversations
            const map = new Map<string, Conversation>();
            for (const m of msgs as {
                id: string; sender_id: string; receiver_id: string; content: string;
                created_at: string; read: boolean;
                sender: { id: string; display_name: string; avatar_url: string | null } | null;
                receiver: { id: string; display_name: string; avatar_url: string | null } | null;
            }[]) {
                const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
                const partner = m.sender_id === user.id ? m.receiver : m.sender;
                if (!map.has(partnerId)) {
                    map.set(partnerId, {
                        partnerId,
                        partnerName: partner?.display_name ?? "Unknown",
                        partnerAvatar: partner?.avatar_url ?? null,
                        lastMessage: m.content,
                        lastAt: m.created_at,
                        unread: (!m.read && m.receiver_id === user.id) ? 1 : 0,
                    });
                } else if (!m.read && m.receiver_id === user.id) {
                    map.get(partnerId)!.unread++;
                }
            }

            setConversations(Array.from(map.values()));
            setLoading(false);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Messages</h1>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                </div>
            ) : conversations.length === 0 ? (
                <div className="glass" style={{ borderRadius: 16, padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✉️</div>
                    <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>No messages yet</p>
                    <p style={{ fontSize: "0.85rem" }}>
                        Visit someone&apos;s{" "}
                        <Link href="/app/search" style={{ color: "var(--brand)" }}>profile</Link>
                        {" "}to send them a message.
                    </p>
                </div>
            ) : (
                conversations.map((c) => (
                    <Link
                        key={c.partnerId}
                        href={`/app/messages/${c.partnerId}`}
                        className="glass glass-hover"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.85rem",
                            padding: "1rem 1.1rem",
                            borderRadius: 14,
                            textDecoration: "none",
                            color: "var(--text)",
                        }}
                    >
                        <Avatar name={c.partnerName} avatarUrl={c.partnerAvatar} size={42} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>{c.partnerName}</p>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {c.lastMessage}
                            </p>
                        </div>
                        {c.unread > 0 && (
                            <div style={{
                                minWidth: 20, height: 20, borderRadius: 999,
                                background: "var(--brand)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.7rem", fontWeight: 800, color: "#fff", padding: "0 5px",
                            }}>
                                {c.unread}
                            </div>
                        )}
                    </Link>
                ))
            )}
        </div>
    );
}
