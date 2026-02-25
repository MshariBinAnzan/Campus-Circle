"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { Avatar } from "@/components/PostCard";

type ProfileResult = {
    id: string;
    display_name: string;
    avatar_url: string | null;
};

type PostResult = {
    id: string;
    content: string;
    created_at: string;
    profiles: { id: string; display_name: string; avatar_url: string | null } | null;
};

export default function SearchPage() {
    const supabase = createClient();
    const [query, setQuery] = useState("");
    const [people, setPeople] = useState<ProfileResult[]>([]);
    const [posts, setPosts] = useState<PostResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);

        const [{ data: peopleData }, { data: postsData }] = await Promise.all([
            supabase
                .from("profiles")
                .select("id, display_name, avatar_url")
                .ilike("display_name", `%${query.trim()}%`)
                .limit(10),
            supabase
                .from("posts")
                .select("id, content, created_at, profiles!posts_user_id_fkey(id, display_name, avatar_url)")
                .ilike("content", `%${query.trim()}%`)
                .order("created_at", { ascending: false })
                .limit(10),
        ]);

        setPeople((peopleData ?? []) as ProfileResult[]);
        setPosts((postsData ?? []) as unknown as PostResult[]);
        setLoading(false);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Search</h1>

            {/* Search input */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.65rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search
                        size={16}
                        style={{
                            position: "absolute",
                            left: "0.9rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text-muted)",
                            pointerEvents: "none",
                        }}
                    />
                    <input
                        autoFocus
                        className="input"
                        placeholder="Search people or posts…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ paddingLeft: "2.4rem" }}
                    />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "0 1.25rem", flexShrink: 0 }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                </button>
            </form>

            {/* Results */}
            {searched && !loading && (
                <>
                    {/* People */}
                    {people.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.65rem" }}>
                                People
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {people.map((p) => (
                                    <Link
                                        key={p.id}
                                        href={`/app/profile/${p.id}`}
                                        className="glass glass-hover"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.75rem",
                                            padding: "0.75rem 1rem",
                                            borderRadius: 12,
                                            textDecoration: "none",
                                            color: "var(--text)",
                                        }}
                                    >
                                        <Avatar name={p.display_name} avatarUrl={p.avatar_url} size={36} />
                                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.display_name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posts */}
                    {posts.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.65rem" }}>
                                Posts
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {posts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/app/post/${post.id}`}
                                        className="glass glass-hover"
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "0.4rem",
                                            padding: "0.9rem 1rem",
                                            borderRadius: 12,
                                            textDecoration: "none",
                                            color: "var(--text)",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <Avatar name={post.profiles?.display_name ?? "?"} avatarUrl={post.profiles?.avatar_url ?? null} size={22} />
                                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                                                {post.profiles?.display_name ?? "Unknown"}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                            {post.content}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No results */}
                    {people.length === 0 && posts.length === 0 && (
                        <div className="glass" style={{ borderRadius: 14, padding: "2.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
                            <p style={{ margin: 0 }}>No results for &ldquo;{query}&rdquo;</p>
                        </div>
                    )}
                </>
            )}

            {!searched && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem 0", fontSize: "0.875rem" }}>
                    Search for people by name or find posts by keyword
                </div>
            )}
        </div>
    );
}
