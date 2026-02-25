"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/PostCard";
import { Loader2, Trash2, Send } from "lucide-react";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
        id: string;
        display_name: string;
        avatar_url: string | null;
    } | null;
}

export default function CommentSection({
    postId,
    currentUserId,
}: {
    postId: string;
    currentUserId: string;
}) {
    const supabase = createClient();
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    async function loadComments() {
        setFetching(true);
        const { data } = await supabase
            .from("comments")
            .select("*, profiles(id, display_name, avatar_url)")
            .eq("post_id", postId)
            .order("created_at", { ascending: true });
        setComments((data as Comment[]) ?? []);
        setFetching(false);
    }

    useEffect(() => {
        loadComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId]);

    async function submitComment(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        await supabase.from("comments").insert({
            post_id: postId,
            user_id: currentUserId,
            content: text.trim(),
        });
        setText("");
        await loadComments();
        setLoading(false);
    }

    async function deleteComment(id: string) {
        await supabase.from("comments").delete().eq("id", id);
        setComments((prev) => prev.filter((c) => c.id !== id));
    }

    return (
        <div
            className="glass"
            style={{ borderRadius: 16, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
                Comments {comments.length > 0 && `(${comments.length})`}
            </h2>

            {/* Comment list */}
            {fetching ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
                    <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                </div>
            ) : comments.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "0.75rem 0" }}>
                    No comments yet. Start the conversation.
                </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {comments.map((c) => (
                        <div key={c.id} style={{ display: "flex", gap: "0.65rem" }}>
                            <Avatar
                                name={c.profiles?.display_name ?? "?"}
                                avatarUrl={c.profiles?.avatar_url ?? null}
                                size={30}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 10,
                                        padding: "0.5rem 0.75rem",
                                    }}
                                >
                                    <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--brand)" }}>
                                        {c.profiles?.display_name ?? "Unknown"}
                                    </span>
                                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.875rem", lineHeight: 1.5 }}>
                                        {c.content}
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                        {new Date(c.created_at).toLocaleTimeString("en-SA", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                    {c.user_id === currentUserId && (
                                        <button
                                            onClick={() => deleteComment(c.id)}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", lineHeight: 0, padding: 0 }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={submitComment} style={{ display: "flex", gap: "0.6rem" }}>
                <input
                    className="input"
                    placeholder="Write a comment…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="btn btn-primary"
                    style={{ padding: "0 1rem", flexShrink: 0 }}
                >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
            </form>
        </div>
    );
}
