import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Clubs — CampusCircle" };
export const dynamic = "force-dynamic";

type Club = {
    id: string;
    name: string;
    description: string;
    emoji: string;
    created_by: string;
    created_at: string;
};

type MemberRow = {
    club_id: string;
    status: string;
    role: string;
};

export default async function ClubsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: rawClubs }, { data: rawMyMemberships }] = await Promise.all([
        supabase.from("clubs").select("*").order("created_at", { ascending: false }),
        supabase.from("club_members").select("club_id, status, role").eq("user_id", user!.id),
    ]);

    const clubs = (rawClubs ?? []) as Club[];
    const myMemberships = (rawMyMemberships ?? []) as MemberRow[];
    const membershipMap = new Map(myMemberships.map((m) => [m.club_id, m]));

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>Clubs</h1>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Join or create clubs to connect with people who share your interests
                    </p>
                </div>
                <Link href="/app/clubs/new" className="btn btn-primary" style={{ gap: "0.4rem", flexShrink: 0 }}>
                    <Plus size={15} /> Create Club
                </Link>
            </div>

            {/* Club list */}
            {clubs.length === 0 ? (
                <div className="glass" style={{ borderRadius: 16, padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏛️</div>
                    <p style={{ fontWeight: 600, color: "#a1a1aa", marginBottom: "0.4rem" }}>No clubs yet</p>
                    <p style={{ fontSize: "0.85rem" }}>Be the first to create one!</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {clubs.map((club) => {
                        const membership = membershipMap.get(club.id);
                        const isCreator = club.created_by === user!.id;

                        let badge = null;
                        if (isCreator || membership?.role === "admin") {
                            badge = <span className="badge badge-brand">Admin</span>;
                        } else if (membership?.status === "approved") {
                            badge = <span className="badge badge-reviewed">Member</span>;
                        } else if (membership?.status === "pending") {
                            badge = <span className="badge badge-pending">Pending</span>;
                        } else if (membership?.status === "declined") {
                            badge = <span className="badge badge-dismissed">Declined</span>;
                        }

                        return (
                            <Link
                                key={club.id}
                                href={`/app/clubs/${club.id}`}
                                className="glass glass-hover"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1rem 1.25rem",
                                    borderRadius: 14,
                                    textDecoration: "none",
                                    color: "var(--text)",
                                }}
                            >
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 14,
                                        background: "#1c1c1f",
                                        border: "1px solid #27272a",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.5rem",
                                        flexShrink: 0,
                                    }}
                                >
                                    {club.emoji}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{club.name}</p>
                                    {club.description && (
                                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {club.description}
                                        </p>
                                    )}
                                </div>
                                {badge}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
