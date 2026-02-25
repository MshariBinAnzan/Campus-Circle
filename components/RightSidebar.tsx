import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type TopPost = {
    id: string;
    content: string;
    like_count: number;
    profiles: { display_name: string } | null;
};

export default async function RightSidebar() {
    const supabase = await createClient();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Fetch top posts today by like count
    const { data: rawPosts } = await supabase
        .from("posts")
        .select("id, content, profiles!posts_user_id_fkey(display_name), likes(user_id)")
        .gte("created_at", since)
        .limit(30);

    type RawPost = {
        id: string;
        content: string;
        profiles: { display_name: string } | { display_name: string }[] | null;
        likes: { user_id: string }[];
    };

    const posts = ((rawPosts ?? []) as RawPost[])
        .map((p) => ({
            id: p.id,
            content: p.content,
            like_count: p.likes.length,
            profiles: Array.isArray(p.profiles) ? p.profiles[0] ?? null : p.profiles,
        }))
        .sort((a, b) => b.like_count - a.like_count)
        .slice(0, 5) as TopPost[];

    return (
        <aside
            style={{
                width: 260,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
            }}
        >
            {/* Top Posts card */}
            <div
                className="glass"
                style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    position: "sticky",
                    top: "1.75rem",
                }}
            >
                <div
                    style={{
                        padding: "0.9rem 1rem 0.65rem",
                        borderBottom: "1px solid #1c1c1f",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <span style={{ fontSize: "1rem" }}>🔥</span>
                    <h3 style={{ fontWeight: 800, fontSize: "0.82rem", color: "#e4e4e7", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        Top Posts Today
                    </h3>
                </div>

                {posts.length === 0 ? (
                    <p style={{ padding: "1.25rem 1rem", fontSize: "0.82rem", color: "#52525b", textAlign: "center" }}>
                        No posts today yet
                    </p>
                ) : (
                    <div>
                        {posts.map((post, i) => (
                            <Link
                                key={post.id}
                                href={`/app/post/${post.id}`}
                                style={{
                                    display: "flex",
                                    gap: "0.75rem",
                                    padding: "0.75rem 1rem",
                                    textDecoration: "none",
                                    color: "var(--text)",
                                    borderBottom: i < posts.length - 1 ? "1px solid #1c1c1f" : "none",
                                    transition: "background 0.12s",
                                }}
                                className="glass-hover"
                            >
                                {/* Rank */}
                                <span
                                    style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 7,
                                        background: i === 0 ? "#f4f4f5" : "#27272a",
                                        color: i === 0 ? "#09090b" : "#71717a",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.7rem",
                                        fontWeight: 800,
                                        flexShrink: 0,
                                        marginTop: 1,
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                    <p
                                        style={{
                                            fontSize: "0.8rem",
                                            lineHeight: 1.45,
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            color: "#d4d4d8",
                                            marginBottom: "0.25rem",
                                        }}
                                    >
                                        {post.content}
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                        <span style={{ fontSize: "0.7rem", color: "#52525b" }}>
                                            {post.profiles?.display_name ?? "Unknown"}
                                        </span>
                                        <span style={{ fontSize: "0.6rem", color: "#3f3f46" }}>·</span>
                                        <span style={{ fontSize: "0.7rem", color: "#52525b" }}>
                                            ❤️ {post.like_count}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Academics links */}
            <div
                className="glass"
                style={{ borderRadius: 14, padding: "0.9rem 1rem" }}
            >
                <h3 style={{ fontWeight: 800, fontSize: "0.78rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                    🎓 Academics
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                    {[
                        { href: "https://lms.um.edu.sa/my/", label: "📚 LMS" },
                        { href: "https://portal.um.edu.sa/mcst/init", label: "🏛️ Portal" },
                        { href: "https://www.um.edu.sa/", label: "🌐 College" },
                    ].map(({ href, label }) => (
                        <a
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontSize: "0.85rem",
                                color: "#a1a1aa",
                                textDecoration: "none",
                                padding: "0.55rem 0.65rem",
                                borderRadius: 9,
                                transition: "background 0.12s, color 0.12s",
                            }}
                            className="glass-hover"
                        >
                            {label}
                            <span style={{ marginInlineStart: "auto", fontSize: "0.65rem", color: "#3f3f46" }}>↗</span>
                        </a>
                    ))}
                </div>
            </div>
        </aside>
    );
}
