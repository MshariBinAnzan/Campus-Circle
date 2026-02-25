"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

const EMOJIS = ["🎓", "🎨", "💻", "🎵", "⚽", "📚", "🔬", "🌍", "🎭", "🏋️", "🍕", "🎮", "📸", "✈️", "🌿", "🎯"];

export default function NewClubPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [emoji, setEmoji] = useState("🎓");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: club, error: err } = await supabase.from("clubs").insert({
            name: name.trim(),
            description: description.trim(),
            emoji,
            created_by: user.id,
        }).select().single();

        if (err) { setError(err.message); setLoading(false); return; }

        // Creator is automatically an approved admin member
        await supabase.from("club_members").insert({
            club_id: (club as { id: string }).id,
            user_id: user.id,
            role: "admin",
            status: "approved",
        });

        router.push(`/app/clubs/${(club as { id: string }).id}`);
    }

    return (
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <Link href="/app/clubs" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "1.5rem" }}>
                <ChevronLeft size={16} /> Back to Clubs
            </Link>

            <div className="glass" style={{ borderRadius: 18, padding: "2rem" }}>
                <h1 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1.5rem" }}>Create a Club</h1>

                <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Emoji picker */}
                    <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>
                            Club Emoji
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setEmoji(e)}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        border: emoji === e ? "2px solid #f4f4f5" : "1px solid #27272a",
                                        background: emoji === e ? "#1c1c1f" : "rgba(255,255,255,0.02)",
                                        fontSize: "1.25rem",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Club name */}
                    <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                            Club Name *
                        </label>
                        <input
                            className="input"
                            placeholder="e.g. Photography Club"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={60}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                            Description
                        </label>
                        <textarea
                            className="input"
                            placeholder="What is this club about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={300}
                            style={{ resize: "vertical" }}
                        />
                    </div>

                    {error && (
                        <p style={{ fontSize: "0.85rem", color: "#f87171", padding: "0.6rem 0.85rem", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading || !name.trim()} className="btn btn-primary" style={{ padding: "0.7rem", fontSize: "0.95rem" }}>
                        {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Club"}
                    </button>
                </form>
            </div>
        </div>
    );
}
