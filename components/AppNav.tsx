"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/utils";
import { Home, User, Shield, LogOut, Search, MessageCircle } from "lucide-react";

interface Profile {
    id: string;
    display_name: string;
    avatar_url: string | null;
}

export default function AppNav({
    profile,
    userEmail,
    userId,
}: {
    profile: Profile | null;
    userEmail: string;
    userId: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const admin = isAdmin(userEmail);

    async function handleSignOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    const navItems = [
        { href: "/app/feed", icon: <Home size={18} />, label: "Feed" },
        { href: "/app/search", icon: <Search size={18} />, label: "Search" },
        { href: "/app/messages", icon: <MessageCircle size={18} />, label: "Messages" },
        ...(profile ? [{ href: `/app/profile/${profile.id}`, icon: <User size={18} />, label: "Profile" }] : []),
        ...(admin ? [{ href: "/app/mod/reports", icon: <Shield size={18} />, label: "Moderation" }] : []),
    ];

    return (
        <aside
            style={{
                width: 240,
                flexShrink: 0,
                height: "100vh",
                position: "sticky",
                top: 0,
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem 1rem",
                borderRight: "1px solid var(--border)",
                background: "rgba(15,15,26,0.95)",
                backdropFilter: "blur(16px)",
                gap: "0.25rem",
            }}
        >
            {/* Logo */}
            <Link
                href="/app/feed"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    marginBottom: "1.75rem",
                    textDecoration: "none",
                    padding: "0 0.5rem",
                }}
            >
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: "linear-gradient(135deg,#6366f1,#a855f7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        flexShrink: 0,
                    }}
                >
                    🎓
                </div>
                <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.01em" }}>
                    CampusCircle
                </span>
            </Link>

            {/* Nav Links */}
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                {navItems.map(({ href, icon, label }) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <Link
                            key={href}
                            href={href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.65rem 0.85rem",
                                borderRadius: 12,
                                fontSize: "0.9rem",
                                fontWeight: active ? 700 : 500,
                                color: active ? "#fff" : "var(--text-muted)",
                                background: active ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(168,85,247,0.15))" : "transparent",
                                border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                                transition: "all 0.15s",
                                textDecoration: "none",
                            }}
                        >
                            <span style={{ color: active ? "var(--brand)" : "inherit" }}>{icon}</span>
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Sign Out */}
            <div
                style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                }}
            >
                {/* Avatar */}
                {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={profile.avatar_url}
                        alt=""
                        style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--brand)", flexShrink: 0 }}
                    />
                ) : (
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg,#6366f1,#a855f7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                        }}
                    >
                        {(profile?.display_name ?? userEmail)[0].toUpperCase()}
                    </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {profile?.display_name ?? "User"}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {userEmail}
                    </p>
                </div>

                <button
                    onClick={handleSignOut}
                    className="btn btn-ghost"
                    style={{ padding: "0.35rem", flexShrink: 0 }}
                    title="Sign out"
                >
                    <LogOut size={14} />
                </button>
            </div>
        </aside>
    );
}
