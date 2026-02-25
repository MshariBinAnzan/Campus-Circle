"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2, Send, ChevronLeft, Users, CheckCircle, XCircle } from "lucide-react";
import { Avatar } from "@/components/PostCard";

type Club = { id: string; name: string; description: string; emoji: string; created_by: string };
type Member = { user_id: string; role: string; status: string; profiles: { display_name: string; avatar_url: string | null } | null };
type Msg = { id: string; user_id: string; content: string; created_at: string; profiles: { display_name: string; avatar_url: string | null } | null };

export default function ClubPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = createClient();
    const [clubId, setClubId] = useState("");
    const [club, setClub] = useState<Club | null>(null);
    const [myMembership, setMyMembership] = useState<{ role: string; status: string } | null>(null);
    const [myId, setMyId] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState<"chat" | "members">("chat");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { params.then(({ id }) => setClubId(id)); }, [params]);

    useEffect(() => {
        if (!clubId) return;
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setMyId(user.id);

            const [{ data: clubData }, { data: myMem }, { data: membersData }] = await Promise.all([
                supabase.from("clubs").select("*").eq("id", clubId).single(),
                supabase.from("club_members").select("role, status").eq("club_id", clubId).eq("user_id", user.id).single(),
                supabase.from("club_members").select("user_id, role, status, profiles!club_members_user_id_fkey(display_name, avatar_url)").eq("club_id", clubId),
            ]);

            setClub(clubData as Club);
            setMyMembership(myMem as { role: string; status: string } | null);
            setMembers((membersData ?? []) as unknown as Member[]);

            // Fetch messages only if approved
            const isApproved = (myMem as { status: string } | null)?.status === "approved";
            if (isApproved) {
                const { data: msgs } = await supabase
                    .from("club_messages")
                    .select("*, profiles!club_messages_user_id_fkey(display_name, avatar_url)")
                    .eq("club_id", clubId)
                    .order("created_at", { ascending: true });
                setMessages((msgs ?? []) as Msg[]);
            }

            setLoading(false);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clubId]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    async function requestJoin() {
        await supabase.from("club_members").insert({ club_id: clubId, user_id: myId, role: "member", status: "pending" });
        setMyMembership({ role: "member", status: "pending" });
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        const { data } = await supabase.from("club_messages").insert({ club_id: clubId, user_id: myId, content: text.trim() }).select("*, profiles!club_messages_user_id_fkey(display_name, avatar_url)").single();
        if (data) setMessages((prev) => [...prev, data as Msg]);
        setText("");
        setSending(false);
    }

    async function updateMember(userId: string, status: "approved" | "declined") {
        await supabase.from("club_members").update({ status }).eq("club_id", clubId).eq("user_id", userId);
        setMembers((prev) => prev.map((m) => m.user_id === userId ? { ...m, status } : m));
    }

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
    );
    if (!club) return <p style={{ color: "var(--text-muted)", padding: "2rem" }}>Club not found.</p>;

    const isAdmin = club.created_by === myId || myMembership?.role === "admin";
    const isApproved = myMembership?.status === "approved";
    const isPending = myMembership?.status === "pending";
    const pendingRequests = members.filter((m) => m.status === "pending");
    const approvedMembers = members.filter((m) => m.status === "approved");

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Back */}
            <Link href="/app/clubs" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
                <ChevronLeft size={16} /> All Clubs
            </Link>

            {/* Club header */}
            <div className="glass" style={{ borderRadius: 16, padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.1rem" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#1c1c1f", border: "1px solid #27272a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0 }}>
                    {club.emoji}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>{club.name}</h1>
                    {club.description && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.25rem 0 0" }}>{club.description}</p>}
                    <p style={{ fontSize: "0.75rem", color: "#3f3f46", margin: "0.3rem 0 0" }}>
                        <Users size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                        {approvedMembers.length} members
                    </p>
                </div>

                {/* Join / status button */}
                {!myMembership && myId !== club.created_by && (
                    <button onClick={requestJoin} className="btn btn-primary" style={{ flexShrink: 0 }}>
                        Request to Join
                    </button>
                )}
                {isPending && <span className="badge badge-pending" style={{ flexShrink: 0 }}>Request Pending</span>}
                {isApproved && !isAdmin && <span className="badge badge-reviewed" style={{ flexShrink: 0 }}>Member ✓</span>}
                {isAdmin && <span className="badge badge-brand" style={{ flexShrink: 0 }}>Admin</span>}
            </div>

            {/* Tabs (only for approved members and admins) */}
            {(isApproved || isAdmin) && (
                <div style={{ display: "flex", gap: "0", border: "1px solid #27272a", borderRadius: 12, overflow: "hidden" }}>
                    {[
                        { key: "chat", label: "💬 Club Chat" },
                        { key: "members", label: `👥 Members (${approvedMembers.length})` },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as "chat" | "members")}
                            style={{
                                flex: 1,
                                padding: "0.65rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                background: activeTab === key ? "#1c1c1f" : "transparent",
                                color: activeTab === key ? "#f4f4f5" : "#52525b",
                                border: "none",
                                borderRight: key === "chat" ? "1px solid #27272a" : "none",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "all 0.15s",
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Admin: pending join requests */}
            {isAdmin && pendingRequests.length > 0 && (
                <div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #1c1c1f" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "0.82rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            ⏳ Pending Requests ({pendingRequests.length})
                        </h3>
                    </div>
                    {pendingRequests.map((m) => (
                        <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderBottom: "1px solid #1c1c1f" }}>
                            <Avatar name={m.profiles?.display_name ?? "?"} avatarUrl={m.profiles?.avatar_url ?? null} size={32} />
                            <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 600 }}>{m.profiles?.display_name ?? "Unknown"}</span>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                <button onClick={() => updateMember(m.user_id, "approved")} className="btn" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem", gap: "0.3rem", background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                                    <CheckCircle size={13} /> Approve
                                </button>
                                <button onClick={() => updateMember(m.user_id, "declined")} className="btn" style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem", gap: "0.3rem", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                                    <XCircle size={13} /> Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Not a member message */}
            {!isApproved && !isAdmin && (
                <div className="glass" style={{ borderRadius: 14, padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔒</div>
                    <p style={{ fontWeight: 600, color: "#a1a1aa", marginBottom: "0.4rem" }}>
                        {isPending ? "Your request is pending approval" : "Members only"}
                    </p>
                    <p style={{ fontSize: "0.85rem" }}>
                        {isPending ? "The club admin will review your request." : "Request to join to access the club chat and members."}
                    </p>
                </div>
            )}

            {/* Chat tab */}
            {(isApproved || isAdmin) && activeTab === "chat" && (
                <div className="glass" style={{ borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {/* Messages */}
                    <div style={{ height: 420, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {messages.length === 0 ? (
                            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", margin: "auto" }}>
                                No messages yet. Start the conversation! 👋
                            </p>
                        ) : messages.map((m) => {
                            const isMine = m.user_id === myId;
                            return (
                                <div key={m.id} style={{ display: "flex", gap: "0.6rem", flexDirection: isMine ? "row-reverse" : "row" }}>
                                    <Avatar name={m.profiles?.display_name ?? "?"} avatarUrl={m.profiles?.avatar_url ?? null} size={28} />
                                    <div style={{ maxWidth: "72%" }}>
                                        {!isMine && (
                                            <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: 600 }}>
                                                {m.profiles?.display_name ?? "Unknown"}
                                            </p>
                                        )}
                                        <div style={{
                                            padding: "0.5rem 0.85rem",
                                            borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                                            background: isMine ? "#27272a" : "#1c1c1f",
                                            border: "1px solid #3f3f46",
                                            fontSize: "0.875rem",
                                            lineHeight: 1.5,
                                        }}>
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} style={{ display: "flex", gap: "0.6rem", padding: "0.85rem 1rem", borderTop: "1px solid #1c1c1f" }}>
                        <input
                            className="input"
                            placeholder="Type a message…"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            style={{ flex: 1 }}
                            disabled={sending}
                        />
                        <button type="submit" disabled={sending || !text.trim()} className="btn btn-primary" style={{ padding: "0 1rem", flexShrink: 0 }}>
                            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        </button>
                    </form>
                </div>
            )}

            {/* Members tab */}
            {(isApproved || isAdmin) && activeTab === "members" && (
                <div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
                    {approvedMembers.map((m, i) => (
                        <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1.1rem", borderBottom: i < approvedMembers.length - 1 ? "1px solid #1c1c1f" : "none" }}>
                            <Avatar name={m.profiles?.display_name ?? "?"} avatarUrl={m.profiles?.avatar_url ?? null} size={36} />
                            <div style={{ flex: 1 }}>
                                <Link href={`/app/profile/${m.user_id}`} style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", textDecoration: "none" }}>
                                    {m.profiles?.display_name ?? "Unknown"}
                                </Link>
                            </div>
                            {m.role === "admin" && <span className="badge badge-brand">Admin</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
