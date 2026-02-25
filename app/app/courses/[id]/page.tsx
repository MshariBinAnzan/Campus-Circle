"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2, Send, ChevronLeft, Users, BookOpen, Trash2 } from "lucide-react";
import { Avatar } from "@/components/PostCard";

type CourseGroup = {
    id: string;
    course_code: string;
    name: string;
    department: string;
    created_by: string;
};
type Member = {
    user_id: string;
    joined_at: string;
    profiles: { display_name: string; avatar_url: string | null } | null;
};
type Post = {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles: { display_name: string; avatar_url: string | null } | null;
};
type Msg = {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles: { display_name: string; avatar_url: string | null } | null;
};

function timeAgo(iso: string) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = createClient();
    const [courseId, setCourseId] = useState("");
    const [group, setGroup] = useState<CourseGroup | null>(null);
    const [myId, setMyId] = useState("");
    const [isMember, setIsMember] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [messages, setMessages] = useState<Msg[]>([]);
    const [activeTab, setActiveTab] = useState<"posts" | "chat" | "members">("posts");
    const [postText, setPostText] = useState("");
    const [chatText, setChatText] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [sending, setSending] = useState(false);
    const [joining, setJoining] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { params.then(({ id }) => setCourseId(id)); }, [params]);

    useEffect(() => {
        if (!courseId) return;
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setMyId(user.id);

            const [{ data: groupData }, { data: memberData }, { data: membersData }] = await Promise.all([
                supabase.from("course_groups").select("*").eq("id", courseId).single(),
                supabase.from("course_members").select("user_id").eq("course_id", courseId).eq("user_id", user.id).single(),
                supabase.from("course_members").select("user_id, joined_at, profiles!course_members_user_id_fkey(display_name, avatar_url)").eq("course_id", courseId).order("joined_at", { ascending: true }),
            ]);

            setGroup(groupData as CourseGroup);
            setIsMember(!!memberData);
            setMembers((membersData ?? []) as unknown as Member[]);

            if (memberData) {
                const [{ data: postsData }, { data: msgsData }] = await Promise.all([
                    supabase.from("course_posts").select("*, profiles!course_posts_user_id_fkey(display_name, avatar_url)").eq("course_id", courseId).order("created_at", { ascending: false }),
                    supabase.from("course_messages").select("*, profiles!course_messages_user_id_fkey(display_name, avatar_url)").eq("course_id", courseId).order("created_at", { ascending: true }),
                ]);
                setPosts((postsData ?? []) as Post[]);
                setMessages((msgsData ?? []) as Msg[]);
            }
            setLoading(false);
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    useEffect(() => {
        if (activeTab === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeTab]);

    async function joinGroup() {
        setJoining(true);
        await supabase.from("course_members").insert({ course_id: courseId, user_id: myId });
        setIsMember(true);
        setJoining(false);
        // Load content now
        const [{ data: postsData }, { data: msgsData }, { data: membersData }] = await Promise.all([
            supabase.from("course_posts").select("*, profiles!course_posts_user_id_fkey(display_name, avatar_url)").eq("course_id", courseId).order("created_at", { ascending: false }),
            supabase.from("course_messages").select("*, profiles!course_messages_user_id_fkey(display_name, avatar_url)").eq("course_id", courseId).order("created_at", { ascending: true }),
            supabase.from("course_members").select("user_id, joined_at, profiles!course_members_user_id_fkey(display_name, avatar_url)").eq("course_id", courseId).order("joined_at", { ascending: true }),
        ]);
        setPosts((postsData ?? []) as Post[]);
        setMessages((msgsData ?? []) as Msg[]);
        setMembers((membersData ?? []) as unknown as Member[]);
    }

    async function leaveGroup() {
        await supabase.from("course_members").delete().eq("course_id", courseId).eq("user_id", myId);
        setIsMember(false);
        setPosts([]);
        setMessages([]);
        setMembers((prev) => prev.filter((m) => m.user_id !== myId));
    }

    async function submitPost(e: React.FormEvent) {
        e.preventDefault();
        if (!postText.trim()) return;
        setPosting(true);
        const { data } = await supabase
            .from("course_posts")
            .insert({ course_id: courseId, user_id: myId, content: postText.trim() })
            .select("*, profiles!course_posts_user_id_fkey(display_name, avatar_url)")
            .single();
        if (data) setPosts((prev) => [data as Post, ...prev]);
        setPostText("");
        setPosting(false);
    }

    async function deletePost(postId: string) {
        await supabase.from("course_posts").delete().eq("id", postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!chatText.trim()) return;
        setSending(true);
        const { data } = await supabase
            .from("course_messages")
            .insert({ course_id: courseId, user_id: myId, content: chatText.trim() })
            .select("*, profiles!course_messages_user_id_fkey(display_name, avatar_url)")
            .single();
        if (data) setMessages((prev) => [...prev, data as Msg]);
        setChatText("");
        setSending(false);
    }

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
    );
    if (!group) return <p style={{ color: "var(--text-muted)", padding: "2rem" }}>Course group not found.</p>;

    const tabs = [
        { key: "posts", label: `📌 Discussion (${posts.length})` },
        { key: "chat", label: "💬 Live Chat" },
        { key: "members", label: `👥 Members (${members.length})` },
    ];

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Back */}
            <Link href="/app/courses" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
                <ChevronLeft size={16} /> All Course Groups
            </Link>

            {/* Header card */}
            <div className="glass" style={{ borderRadius: 16, padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.1rem" }}>
                <div style={{
                    width: 60, height: 60, borderRadius: 16,
                    background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: "0.15rem",
                }}>
                    <BookOpen size={18} style={{ color: "var(--brand)" }} />
                    <span style={{ fontSize: "0.6rem", fontWeight: 900, color: "var(--brand)" }}>{group.course_code}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>{group.name}</h1>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
                        {group.department}
                    </p>
                    <p style={{ fontSize: "0.73rem", color: "#3f3f46", margin: "0.2rem 0 0" }}>
                        <Users size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                        {members.length} member{members.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Join / Leave */}
                {!isMember ? (
                    <button onClick={joinGroup} disabled={joining} className="btn btn-primary" style={{ flexShrink: 0 }}>
                        {joining ? <Loader2 size={15} className="animate-spin" /> : "+ Join Group"}
                    </button>
                ) : myId !== group.created_by ? (
                    <button onClick={leaveGroup} className="btn btn-ghost" style={{ flexShrink: 0, fontSize: "0.8rem", color: "#f87171", borderColor: "rgba(239,68,68,0.25)" }}>
                        Leave
                    </button>
                ) : (
                    <span className="badge badge-brand">Creator</span>
                )}
            </div>

            {/* Not a member */}
            {!isMember && (
                <div className="glass" style={{ borderRadius: 14, padding: "2.5rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📚</div>
                    <p style={{ fontWeight: 600, color: "#a1a1aa", marginBottom: "0.4rem" }}>Join to access this course group</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>See discussions, chat with classmates, and share notes.</p>
                </div>
            )}

            {/* Tabs for members */}
            {isMember && (
                <>
                    {/* Tab bar */}
                    <div style={{ display: "flex", gap: 0, border: "1px solid #27272a", borderRadius: 12, overflow: "hidden" }}>
                        {tabs.map(({ key, label }, i) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key as "posts" | "chat" | "members")}
                                style={{
                                    flex: 1,
                                    padding: "0.65rem 0.5rem",
                                    fontSize: "0.82rem",
                                    fontWeight: 600,
                                    background: activeTab === key ? "#1c1c1f" : "transparent",
                                    color: activeTab === key ? "#f4f4f5" : "#52525b",
                                    border: "none",
                                    borderRight: i < tabs.length - 1 ? "1px solid #27272a" : "none",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "all 0.15s",
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ── DISCUSSION TAB ── */}
                    {activeTab === "posts" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {/* Post composer */}
                            <form onSubmit={submitPost} className="glass" style={{ borderRadius: 14, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <textarea
                                    className="input"
                                    placeholder="Share a note, question, or resource with classmates…"
                                    value={postText}
                                    onChange={(e) => setPostText(e.target.value)}
                                    rows={3}
                                    maxLength={2000}
                                    style={{ resize: "vertical" }}
                                    disabled={posting}
                                />
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button type="submit" disabled={posting || !postText.trim()} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem" }}>
                                        {posting ? <Loader2 size={14} className="animate-spin" /> : "Post"}
                                    </button>
                                </div>
                            </form>

                            {/* Posts list */}
                            {posts.length === 0 ? (
                                <div className="glass" style={{ borderRadius: 14, padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                    No posts yet. Be the first to share something! 📝
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div key={post.id} className="glass" style={{ borderRadius: 14, padding: "1rem 1.15rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.6rem" }}>
                                            <Avatar name={post.profiles?.display_name ?? "?"} avatarUrl={post.profiles?.avatar_url ?? null} size={32} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem" }}>{post.profiles?.display_name ?? "Unknown"}</p>
                                                <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)" }}>{timeAgo(post.created_at)}</p>
                                            </div>
                                            {post.user_id === myId && (
                                                <button
                                                    onClick={() => deletePost(post.id)}
                                                    style={{ all: "unset", cursor: "pointer", color: "#52525b", display: "flex", alignItems: "center" }}
                                                    title="Delete post"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{post.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── CHAT TAB ── */}
                    {activeTab === "chat" && (
                        <div className="glass" style={{ borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
                                                <p style={{ fontSize: "0.65rem", color: "#3f3f46", marginTop: "0.2rem", textAlign: isMine ? "right" : "left" }}>
                                                    {timeAgo(m.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            <form onSubmit={sendMessage} style={{ display: "flex", gap: "0.6rem", padding: "0.85rem 1rem", borderTop: "1px solid #1c1c1f" }}>
                                <input
                                    className="input"
                                    placeholder="Type a message…"
                                    value={chatText}
                                    onChange={(e) => setChatText(e.target.value)}
                                    style={{ flex: 1 }}
                                    disabled={sending}
                                />
                                <button type="submit" disabled={sending || !chatText.trim()} className="btn btn-primary" style={{ padding: "0 1rem", flexShrink: 0 }}>
                                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ── MEMBERS TAB ── */}
                    {activeTab === "members" && (
                        <div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
                            {members.map((m, i) => (
                                <div key={m.user_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1.1rem", borderBottom: i < members.length - 1 ? "1px solid #1c1c1f" : "none" }}>
                                    <Avatar name={m.profiles?.display_name ?? "?"} avatarUrl={m.profiles?.avatar_url ?? null} size={36} />
                                    <div style={{ flex: 1 }}>
                                        <Link href={`/app/profile/${m.user_id}`} style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", textDecoration: "none" }}>
                                            {m.profiles?.display_name ?? "Unknown"}
                                        </Link>
                                        <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                            Joined {timeAgo(m.joined_at)}
                                        </p>
                                    </div>
                                    {m.user_id === group.created_by && (
                                        <span className="badge badge-brand">Creator</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
