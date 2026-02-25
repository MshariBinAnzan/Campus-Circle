import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/PostCard";
import PostCard from "@/components/PostCard";
import EditProfileForm from "@/components/EditProfileForm";
import FollowButton from "@/components/FollowButton";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

type ProfileRow = {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string;
};

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from("profiles").select("display_name").eq("id", id).single();
    const profile = data as { display_name: string } | null;
    return { title: `${profile?.display_name ?? "Profile"} — CampusCircle` };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: rawProfile } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (!rawProfile) notFound();
    const profile = rawProfile as ProfileRow;

    const [{ data: rawPosts }, { count: followersCount }, { count: followingCount }] = await Promise.all([
        supabase
            .from("posts")
            .select("*, likes(user_id), comments(id), profiles!posts_user_id_fkey(id, display_name, avatar_url)")
            .eq("user_id", id)
            .order("created_at", { ascending: false }),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", id),
    ]);

    const posts = (rawPosts ?? []) as PostWithRelations[];
    const isOwner = user?.id === id;
    const joinedDate = new Date(profile.created_at).toLocaleDateString("en-SA", { month: "long", year: "numeric" });
    const totalLikes = posts.reduce((s, p) => s + p.likes.length, 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* ── Profile card ── */}
            <div className="glass" style={{ borderRadius: 20, overflow: "hidden" }}>
                {/* Cover */}
                <div style={{ height: 100, background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)", opacity: 0.8 }} />

                <div style={{ padding: "0 1.5rem 1.5rem" }}>
                    {/* Avatar + action buttons row */}
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <div style={{ marginTop: -36, border: "4px solid var(--surface)", borderRadius: "50%", display: "inline-block" }}>
                            <Avatar name={profile.display_name} avatarUrl={profile.avatar_url} size={68} />
                        </div>

                        {/* Action buttons (only for other users) */}
                        {!isOwner && user && (
                            <div style={{ display: "flex", gap: "0.5rem", paddingBottom: "0.25rem" }}>
                                <FollowButton targetUserId={id} currentUserId={user.id} />
                                <Link
                                    href={`/app/messages/${id}`}
                                    className="btn btn-ghost"
                                    style={{ padding: "0.5rem 1rem", gap: "0.4rem", fontSize: "0.85rem", fontWeight: 600 }}
                                >
                                    <MessageCircle size={14} /> Message
                                </Link>
                            </div>
                        )}
                    </div>

                    <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 0.2rem" }}>
                        {profile.display_name}
                    </h1>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 1rem" }}>
                        Joined {joinedDate}
                    </p>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                        <Stat label="Posts" value={posts.length} />
                        <Stat label="Followers" value={followersCount ?? 0} />
                        <Stat label="Following" value={followingCount ?? 0} />
                        <Stat label="Likes received" value={totalLikes} />
                    </div>
                </div>
            </div>

            {/* ── Edit form (owner only) ── */}
            {isOwner && <EditProfileForm profile={profile} userId={user!.id} />}

            {/* ── Posts ── */}
            <section>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.85rem" }}>Posts</h2>
                {posts.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} currentUserId={user!.id} />
                        ))}
                    </div>
                ) : (
                    <div className="glass" style={{ borderRadius: 14, padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        No posts yet.
                    </div>
                )}
            </section>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <p style={{ fontWeight: 800, fontSize: "1.15rem", margin: 0 }}>{value}</p>
            <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", margin: 0 }}>{label}</p>
        </div>
    );
}
