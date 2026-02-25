"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/utils";
import { Home, User, Shield, LogOut } from "lucide-react";

interface Profile {
    id: string;
    display_name: string;
    avatar_url: string | null;
}

export default function AppNav({
    profile,
    userEmail,
}: {
    profile: Profile | null;
    userEmail: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const admin = isAdmin(userEmail);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    const navLink = (
        href: string,
        icon: React.ReactNode,
        label: string
    ) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
            <Link
                href={href}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    padding: "0.45rem 0.85rem",
                    borderRadius: 10,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: active ? "var(--brand)" : "var(--text-muted)",
                    background: active
                        ? "rgba(99,102,241,0.12)"
                        : "transparent",
                    transition: "all 0.15s",
                    textDecoration: "none",
                }}
            >
                {icon}
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                borderBottom: "1px solid var(--border)",
                background: "rgba(15,15,26,0.85)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
            }}
        >
            <div
                style={{
                    maxWidth: 960,
                    marginInline: "auto",
                    padding: "0 1rem",
                    height: 58,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                }}
            >
                {/* Logo */}
                <Link
                    href="/app/feed"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginRight: "0.5rem",
                    }}
                >
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: "linear-gradient(135deg,#6366f1,#a855f7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.9rem",
                        }}
                    >
                        🎓
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
                        CampusCircle
                    </span>
                </Link>

                {/* Nav links */}
                <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1 }}>
                    {navLink("/app/feed", <Home size={15} />, "Feed")}
                    {profile &&
                        navLink(
                            `/app/profile/${profile.id}`,
                            <User size={15} />,
                            "Profile"
                        )}
                    {admin && navLink("/app/mod/reports", <Shield size={15} />, "Mod")}
                </nav>

                {/* Avatar + sign out */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={profile.avatar_url}
                            alt=""
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid var(--brand)",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "#fff",
                                flexShrink: 0,
                            }}
                        >
                            {(profile?.display_name ?? userEmail)[0].toUpperCase()}
                        </div>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="btn btn-ghost"
                        style={{ padding: "0.35rem 0.6rem", gap: "0.35rem" }}
                        title="Sign out"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </header>
    );
}
