"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Heart, MessageCircle, Flag, Trash2 } from "lucide-react";
import ReportModal from "@/components/ReportModal";

interface Post {
    id: string;
    user_id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    profiles: {
        id: string;
        display_name: string;
        avatar_url: string | null;
    } | null;
    likes: { user_id: string }[];
    comments: { id: string }[];
}

export default function PostCard({
    post,
    currentUserId,
}: {
    post: Post;
    currentUserId: string;
}) {
    const router = useRouter();
    const supabase = createClient();

    const liked = post.likes.some((l) => l.user_id === currentUserId);
    const [likedState, setLikedState] = useState(liked);
    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [showReport, setShowReport] = useState(false);
    const isOwner = post.user_id === currentUserId;

    async function toggleLike() {
        if (likedState) {
            setLikedState(false);
            setLikeCount((c) => c - 1);
            await supabase
                .from("likes")
                .delete()
                .eq("user_id", currentUserId)
                .eq("post_id", post.id);
        } else {
            setLikedState(true);
            setLikeCount((c) => c + 1);
            await supabase
                .from("likes")
                .insert({ user_id: currentUserId, post_id: post.id });
        }
    }

    async function deletePost() {
        if (!confirm("Delete this post?")) return;
        await supabase.from("posts").delete().eq("id", post.id);
        router.refresh();
    }

    const timeAgo = formatTimeAgo(post.created_at);
    const author = post.profiles;

    return (
        <>
            <article
                className="glass glass-hover"
                style={{ borderRadius: 16, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}
            >
                {/* Author row */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link href={`/app/profile/${author?.id ?? post.user_id}`}>
                        <Avatar name={author?.display_name ?? "?"} avatarUrl={author?.avatar_url ?? null} size={38} />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                            href={`/app/profile/${author?.id ?? post.user_id}`}
                            style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}
                        >
                            {author?.display_name ?? "Unknown"}
                        </Link>
                        <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 1 }}>
                            {timeAgo}
                        </p>
                    </div>
                    {isOwner && (
                        <button
                            onClick={deletePost}
                            className="btn btn-ghost"
                            style={{ padding: "0.3rem", color: "var(--text-muted)" }}
                            title="Delete post"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <Link
                    href={`/app/post/${post.id}`}
                    style={{ color: "var(--text)", textDecoration: "none" }}
                >
                    {post.content && (
                        <p style={{ fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                            {post.content}
                        </p>
                    )}
                    {post.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={post.image_url}
                            alt=""
                            style={{
                                width: "100%",
                                borderRadius: 10,
                                marginTop: post.content ? "0.75rem" : 0,
                                maxHeight: 380,
                                objectFit: "cover",
                            }}
                        />
                    )}
                </Link>

                {/* Actions */}
                <div
                    style={{
                        display: "flex",
                        gap: "0.25rem",
                        alignItems: "center",
                        paddingTop: "0.25rem",
                        borderTop: "1px solid var(--border)",
                    }}
                >
                    <button
                        onClick={toggleLike}
                        className="btn btn-ghost"
                        style={{
                            padding: "0.35rem 0.7rem",
                            gap: "0.4rem",
                            color: likedState ? "#f43f5e" : "var(--text-muted)",
                            borderColor: likedState ? "rgba(244,63,94,0.3)" : "transparent",
                        }}
                    >
                        <Heart size={15} fill={likedState ? "#f43f5e" : "none"} />
                        <span style={{ fontSize: "0.82rem" }}>{likeCount}</span>
                    </button>

                    <Link
                        href={`/app/post/${post.id}`}
                        className="btn btn-ghost"
                        style={{ padding: "0.35rem 0.7rem", gap: "0.4rem", color: "var(--text-muted)", borderColor: "transparent" }}
                    >
                        <MessageCircle size={15} />
                        <span style={{ fontSize: "0.82rem" }}>{post.comments.length}</span>
                    </Link>

                    <div style={{ flex: 1 }} />

                    {!isOwner && (
                        <button
                            onClick={() => setShowReport(true)}
                            className="btn btn-ghost"
                            style={{ padding: "0.35rem 0.6rem", color: "var(--text-muted)", borderColor: "transparent" }}
                            title="Report post"
                        >
                            <Flag size={14} />
                        </button>
                    )}
                </div>
            </article>

            {showReport && (
                <ReportModal
                    postId={post.id}
                    reporterId={currentUserId}
                    onClose={() => setShowReport(false)}
                />
            )}
        </>
    );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({
    name,
    avatarUrl,
    size = 36,
}: {
    name: string;
    avatarUrl: string | null;
    size?: number;
}) {
    if (avatarUrl) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={avatarUrl}
                alt=""
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                }}
            />
        );
    }
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: size * 0.38,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
            }}
        >
            {name[0]?.toUpperCase() ?? "?"}
        </div>
    );
}

// ─── formatTimeAgo ───────────────────────────────────────────────────────────
function formatTimeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-SA", { month: "short", day: "numeric" });
}
