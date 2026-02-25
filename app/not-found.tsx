import Link from "next/link";

export default function NotFound() {
    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--surface)",
                padding: "2rem",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
            <h1
                className="gradient-text"
                style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}
            >
                404 — Not Found
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
                That page doesn&apos;t exist or was removed.
            </p>
            <Link href="/" className="btn btn-primary">
                Go Home
            </Link>
        </main>
    );
}
