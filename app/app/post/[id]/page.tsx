import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import CommentSection from "@/components/CommentSection";

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

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase
        .from("posts")
        .select("content")
        .eq("id", id)
        .single();
    const post = data as { content: string } | null;
    return { title: post?.content?.slice(0, 50) ?? "Post" };
}

export default async function PostDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: rawPost } = await supabase
        .from("posts")
        .select(
            `*, profiles!posts_user_id_fkey(id, display_name, avatar_url), likes(user_id), comments(id)`
        )
        .eq("id", id)
        .single();

    if (!rawPost) notFound();

    const post = rawPost as PostWithRelations;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link
                href="/app/feed"
                style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
            >
                ← Back to feed
            </Link>

            <PostCard post={post} currentUserId={user!.id} />
            <CommentSection postId={id} currentUserId={user!.id} />
        </div>
    );
}
