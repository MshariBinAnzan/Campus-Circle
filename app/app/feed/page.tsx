import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";

export const metadata: Metadata = { title: "Feed" };

export const dynamic = "force-dynamic";

type PostWithRelations = {
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
};

export default async function FeedPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch posts with author profiles, like counts, comment counts
    const { data: rawPosts } = await supabase
        .from("posts")
        .select(
            `
      *,
      profiles!posts_user_id_fkey(id, display_name, avatar_url),
      likes(user_id),
      comments(id)
    `
        )
        .order("created_at", { ascending: false })
        .limit(50);

    const posts = (rawPosts ?? []) as PostWithRelations[];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <CreatePost userId={user!.id} />

            {posts.length > 0 ? (
                posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={user!.id}
                    />
                ))
            ) : (
                <div
                    className="glass"
                    style={{
                        borderRadius: 16,
                        padding: "3rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                    }}
                >
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✍️</div>
                    <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
                        Nothing here yet
                    </p>
                    <p style={{ fontSize: "0.85rem" }}>
                        Be the first to post something for your campus.
                    </p>
                </div>
            )}
        </div>
    );
}
