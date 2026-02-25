"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/utils";
import { Home, User, Shield, LogOut, Search, MessageCircle, Users, BookOpen, AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/i18n";

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
    const admin = isAdmin(userEmail);
    const { lang, setLang, t } = useLang();
    const [confirming, setConfirming] = useState(false);

    async function performSignOut() {
        setConfirming(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    const navItems = [
        { href: "/app/feed", icon: <Home size={18} />, label: t.feed },
        { href: "/app/search", icon: <Search size={18} />, label: t.search },
        { href: "/app/courses", icon: <BookOpen size={18} />, label: t.courses },
        { href: "/app/messages", icon: <MessageCircle size={18} />, label: t.messages },
        { href: "/app/clubs", icon: <Users size={18} />, label: t.clubs },
        ...(profile ? [{ href: `/app/profile/${profile.id}`, icon: <User size={18} />, label: t.profile }] : []),
        ...(admin ? [{ href: "/app/mod/reports", icon: <Shield size={18} />, label: t.moderation }] : []),
    ];

    return (
        <aside
            className="app-nav"
            style={{
                width: 240,
                flexShrink: 0,
                height: "100vh",
                position: "sticky",
                top: 0,
                display: "flex",
                flexDirection: "column",
                padding: "1.5rem 1rem",
                borderRight: "1px solid #1c1c1f",
                background: "#0c0c0e",
                gap: "0.15rem",
            }}
        >
            {/* Logo */}
            <Link
                href="/app/feed"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    marginBottom: "1.5rem",
                    textDecoration: "none",
                    padding: "0 0.5rem",
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo_um.png"
                    alt="Almaarefa University"
                    style={{
                        width: 32,
                        height: 32,
                        objectFit: "cover",
                        objectPosition: "left center",
                        flexShrink: 0,
                        borderRadius: 6,
                    }}
                />
                <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f4f4f5", letterSpacing: "-0.01em" }}>
                    {t.appName}
                </span>
            </Link>

            {/* Language toggle */}
            <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.4rem 0.85rem",
                    borderRadius: 10,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid #27272a",
                    color: "#71717a",
                    marginBottom: "0.75rem",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                }}
            >
                <span style={{ fontSize: "1rem" }}>{lang === "en" ? "🇸🇦" : "🇺🇸"}</span>
                {lang === "en" ? "عربي" : "English"}
            </button>

            {/* Nav Links */}
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.1rem" }}>
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
                                borderRadius: 10,
                                fontSize: "0.875rem",
                                fontWeight: active ? 700 : 500,
                                color: active ? "#f4f4f5" : "#52525b",
                                background: active ? "#1c1c1f" : "transparent",
                                border: "1px solid transparent",
                                borderColor: active ? "#27272a" : "transparent",
                                transition: "all 0.15s",
                                textDecoration: "none",
                            }}
                        >
                            {icon}
                            <span className="nav-label">{label}</span>
                        </Link>
                    );
                })}

                {/* Mobile-only sign-out tab (shows in bottom bar) */}
                <button
                    className="signout-tab"
                    onClick={() => setConfirming(true)}
                    title={t.signOut}
                    style={{
                        all: "unset",
                        cursor: "pointer",
                        fontFamily: "inherit",
                    }}
                >
                    <LogOut size={16} />
                    <span className="nav-label">{t.signOut}</span>
                </button>
            </nav>

            {/* ── Desktop sign-out block (hidden on mobile) ── */}
            <div className="desktop-signout">
                {/* Sign-out button */}
                {!confirming ? (
                    <button
                        className="desktop-signout-btn"
                        onClick={() => setConfirming(true)}
                    >
                        <LogOut size={15} />
                        <span>{t.signOut}</span>
                    </button>
                ) : (
                    /* Confirmation panel */
                    <div className="desktop-signout-confirm">
                        <div className="desktop-signout-confirm-header">
                            <AlertTriangle size={14} />
                            <span>
                                {lang === "ar"
                                    ? "هل أنت متأكد من تسجيل الخروج؟"
                                    : "Are you sure you want to sign out?"}
                            </span>
                        </div>
                        <div className="desktop-signout-confirm-actions">
                            <button
                                className="desktop-signout-yes"
                                onClick={performSignOut}
                            >
                                {lang === "ar" ? "نعم، اخرج" : "Yes, sign out"}
                            </button>
                            <button
                                className="desktop-signout-cancel"
                                onClick={() => setConfirming(false)}
                            >
                                {lang === "ar" ? "إلغاء" : "Cancel"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* User info row */}
            <div
                style={{
                    borderTop: "1px solid #1c1c1f",
                    paddingTop: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#27272a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#e4e4e7",
                        flexShrink: 0,
                        overflow: "hidden",
                    }}
                >
                    {profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        (profile?.display_name ?? userEmail)[0].toUpperCase()
                    )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.8rem", color: "#e4e4e7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {profile?.display_name ?? "User"}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.68rem", color: "#52525b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {userEmail}
                    </p>
                </div>
            </div>
        </aside>
    );
}
