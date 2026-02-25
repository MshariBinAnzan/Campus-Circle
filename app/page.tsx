import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main style={{ minHeight: "100vh", display: "flex" }}>
      {/* ── LEFT: Logo Panel ── */}
      <div
        className="landing-hero"
        style={{
          flex: "0 0 42%",
          background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #6366f1 80%, #a855f7 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: "10%", left: "10%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "5%", width: 160, height: 160, borderRadius: "50%", background: "rgba(168,85,247,0.2)", filter: "blur(40px)" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 28,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              margin: "0 auto 1.5rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            🎓
          </div>
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            CampusCircle
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            Almaarefa University
          </p>

          {/* Decorative dots */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: "2.5rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === 1 ? "#fff" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Content Panel ── */}
      <div
        className="landing-content"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 4rem",
          background: "var(--surface)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 480 }} className="animate-fade-up">
          {/* Heading */}
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "1rem",
              marginTop: 0,
            }}
          >
            Your university.{" "}
            <span className="gradient-text">Your circle.</span>
          </h2>

          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              marginBottom: "2rem",
            }}
          >
            A verified social space exclusively for{" "}
            <strong style={{ color: "var(--text)" }}>Almaarefa University</strong>{" "}
            students. Share ideas, connect with classmates, follow friends, and
            message directly — all in one place.
          </p>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "2.5rem",
            }}
          >
            {[
              "📝 Student feed",
              "❤️ Reactions",
              "💬 Comments",
              "👥 Follow friends",
              "✉️ Direct messages",
              "🔒 Verified-only",
            ].map((f) => (
              <span
                key={f}
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 999,
                  padding: "0.3rem 0.85rem",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          {user ? (
            <Link
              href="/app/feed"
              className="btn btn-primary"
              style={{ fontSize: "1rem", padding: "0.8rem 2rem", width: "100%", justifyContent: "center" }}
            >
              Go to Feed →
            </Link>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link
                href="/signup"
                className="btn btn-primary"
                style={{ fontSize: "1rem", padding: "0.8rem 2rem", justifyContent: "center" }}
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="btn btn-ghost"
                style={{ fontSize: "1rem", padding: "0.8rem 2rem", justifyContent: "center" }}
              >
                Sign In
              </Link>
            </div>
          )}

          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            Only @gmail.com emails are accepted.
          </p>
        </div>
      </div>
    </main>
  );
}
