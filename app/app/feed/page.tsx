import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import RightSidebar from "@/components/RightSidebar";
import Link from "next/link";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Feed — CampusCircle" };
export const dynamic = "force-dynamic";

type PostWithRelations = {
    id: string;
    user_id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    profiles: { id: string; display_name: string; avatar_url: string | null } | null;
    likes: { user_id: string }[];
    comments: { id: string }[];
};

export default async function FeedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: rawPosts } = await supabase
        .from("posts")
        .select("*, profiles!posts_user_id_fkey(id, display_name, avatar_url), likes(user_id), comments(id)")
        .order("created_at", { ascending: false })
        .limit(50);

    const posts = (rawPosts ?? []) as PostWithRelations[];

    return (
        <div style={{ display: "flex", gap: "1.5rem", maxWidth: 1050, margin: "0 auto" }}>

            {/* ── Main feed column ── */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Search bar */}
                <Link
                    href="/app/search"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        padding: "0.7rem 1rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid #27272a",
                        borderRadius: 12,
                        color: "#52525b",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        cursor: "text",
                        transition: "border-color 0.15s",
                    }}
                >
                    <Search size={15} />
                    Search posts and people…
                </Link>

                <CreatePost userId={user!.id} />

                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} currentUserId={user!.id} />
                    ))
                ) : (
                    <div className="glass" style={{ borderRadius: 14, padding: "3rem", textAlign: "center", color: "#52525b" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✍️</div>
                        <p style={{ fontWeight: 600, marginBottom: "0.4rem", color: "#a1a1aa" }}>Nothing here yet</p>
                        <p style={{ fontSize: "0.85rem" }}>Be the first to post!</p>
                    </div>
                )}
            </div>

            {/* ── Right sidebar ── */}
            <RightSidebar />
        </div>
    );
}
