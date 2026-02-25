"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setLoading(false);
            return;
        }

        router.push("/app/feed");
        router.refresh();
    }

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
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                        Welcome back
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        Sign in with your university email
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                >
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
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            required
                            className="input"
                            placeholder="you@student.um.edu.sa"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPw ? "text" : "password"}
                                required
                                className="input"
                                placeholder="Your password"
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
                            "Sign In"
                        )}
                    </button>

                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            marginTop: 4,
                        }}
                    >
                        No account?{" "}
                        <Link
                            href="/signup"
                            style={{ color: "var(--brand)", fontWeight: 600 }}
                        >
                            Sign up
                        </Link>
                    </p>
                </form>
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
