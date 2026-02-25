"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isAllowedEmail, ALLOWED_DOMAIN } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!isAllowedEmail(email)) {
            setError(
                `Only @${ALLOWED_DOMAIN} emails are allowed. Please use your university email.`
            );
            return;
        }

        if (displayName.trim().length < 2) {
            setError("Display name must be at least 2 characters.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        const supabase = createClient();

        const { error: signUpError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
                data: { display_name: displayName.trim() },
                // emailRedirectTo must match Supabase Auth settings
                emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Profile row is auto-created by the Supabase trigger `on_auth_user_created`.
        // No manual insert needed.

        setLoading(false);
        setDone(true);
    }

    return (
        <AuthShell title="Create account" subtitle={`Gmail users only`}>
            {done ? (
                <div className="animate-fade-up" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📬</div>
                    <h2 style={{ marginBottom: 8, fontWeight: 700 }}>Check your inbox</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                        We sent a confirmation link to <strong>{email}</strong>. Click it to
                        activate your account, then{" "}
                        <Link href="/login" style={{ color: "var(--brand)" }}>
                            sign in
                        </Link>
                        .
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {error && (
                        <div
                            style={{
                                background: "rgba(239,68,68,0.12)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: 10,
                                padding: "0.65rem 0.9rem",
                                color: "#f87171",
                                fontSize: "0.85rem",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div>
                        <label style={labelStyle}>University Email</label>
                        <input
                            type="email"
                            required
                            className={`input ${error && !isAllowedEmail(email) ? "input-error" : ""}`}
                            placeholder={`you@${ALLOWED_DOMAIN}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Display Name</label>
                        <input
                            type="text"
                            required
                            className="input"
                            placeholder="How others see you"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPw ? "text" : "password"}
                                required
                                className="input"
                                placeholder="Minimum 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingRight: "2.8rem" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((v) => !v)}
                                style={{
                                    position: "absolute",
                                    right: "0.75rem",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    cursor: "pointer",
                                    padding: 0,
                                    lineHeight: 0,
                                }}
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ marginTop: "0.5rem", height: 44 }}
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            "Create Account"
                        )}
                    </button>

                    <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
                        Already have an account?{" "}
                        <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>
                            Sign in
                        </Link>
                    </p>
                </form>
            )}
        </AuthShell>
    );
}

// ─── Shared auth shell ──────────────────────────────────────────────────────
function AuthShell({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) {
    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                background:
                    "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%), var(--surface)",
            }}
        >
            <div
                className="glass animate-fade-up"
                style={{
                    width: "100%",
                    maxWidth: 440,
                    borderRadius: 20,
                    padding: "2.5rem",
                }}
            >
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <Link
                        href="/"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "1.25rem",
                            textDecoration: "none",
                        }}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.1rem",
                            }}
                        >
                            🎓
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                            CampusCircle
                        </span>
                    </Link>
                    <h1
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            marginBottom: "0.3rem",
                        }}
                    >
                        {title}
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {subtitle}
                    </p>
                </div>

                {children}
            </div>
        </main>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.35rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "var(--text-muted)",
    letterSpacing: "0.02em",
};
