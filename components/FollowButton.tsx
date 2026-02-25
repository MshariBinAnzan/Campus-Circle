"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, UserPlus, UserCheck } from "lucide-react";

export default function FollowButton({
    targetUserId,
    currentUserId,
}: {
    targetUserId: string;
    currentUserId: string;
}) {
    const supabase = createClient();
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        async function check() {
            const { data } = await supabase
                .from("follows")
                .select("follower_id")
                .eq("follower_id", currentUserId)
                .eq("following_id", targetUserId)
                .single();
            setFollowing(!!data);
            setLoading(false);
        }
        check();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetUserId, currentUserId]);

    async function toggle() {
        setBusy(true);
        if (following) {
            await supabase
                .from("follows")
                .delete()
                .eq("follower_id", currentUserId)
                .eq("following_id", targetUserId);
            setFollowing(false);
        } else {
            await supabase.from("follows").insert({
                follower_id: currentUserId,
                following_id: targetUserId,
            });
            setFollowing(true);
        }
        setBusy(false);
    }

    if (loading) return null;

    return (
        <button
            onClick={toggle}
            disabled={busy}
            className="btn"
            style={{
                padding: "0.5rem 1.1rem",
                gap: "0.4rem",
                fontSize: "0.85rem",
                background: following ? "rgba(99,102,241,0.12)" : "linear-gradient(135deg,#6366f1,#a855f7)",
                color: following ? "var(--brand)" : "#fff",
                border: following ? "1px solid rgba(99,102,241,0.3)" : "none",
                fontWeight: 600,
            }}
        >
            {busy ? (
                <Loader2 size={14} className="animate-spin" />
            ) : following ? (
                <><UserCheck size={14} /> Following</>
            ) : (
                <><UserPlus size={14} /> Follow</>
            )}
        </button>
    );
}
