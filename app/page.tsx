import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 60%), var(--surface)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Blurred orbs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "15%",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.12)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(168,85,247,0.12)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-fade-up"
        style={{
          maxWidth: 680,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
            }}
          >
            🎓
          </div>
          <span
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            CampusCircle
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "1.25rem",
          }}
        >
          Your university.{" "}
          <span className="gradient-text">Your circle.</span>
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--text-muted)",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
            maxWidth: 520,
            marginInline: "auto",
          }}
        >
          A verified social space exclusively for{" "}
          <strong style={{ color: "var(--text)" }}>
            Gmail users
          </strong>{" "}
          — share ideas, connect with friends, and stay in the loop,
          all behind your Google email.
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem",
            justifyContent: "center",
            marginBottom: "2.5rem",
          }}
        >
          {[
            "📝 Student feed",
            "❤️ Reactions",
            "💬 Comments",
            "🖼️ Image posts",
            "🔒 Verified-only",
          ].map((f) => (
            <span
              key={f}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "0.3rem 0.9rem",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {user ? (
          <Link href="/app/feed" className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            Go to Feed →
          </Link>
        ) : (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/signup"
              className="btn btn-primary"
              style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}
            >
              Join CampusCircle
            </Link>
            <Link
              href="/login"
              className="btn btn-ghost"
              style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}
            >
              Sign In
            </Link>
          </div>
        )}

        <p
          style={{
            marginTop: "2rem",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            opacity: 0.6,
          }}
        >
          Only @gmail.com emails are accepted.
        </p>
      </div>
    </main>
  );
}
