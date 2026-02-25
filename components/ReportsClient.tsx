"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";

type Status = "pending" | "reviewed" | "dismissed";

interface Report {
    id: string;
    reason: string;
    status: string;
    created_at: string;
    reporter: { id: string; display_name: string } | null;
    post: {
        id: string;
        content: string;
        user_id: string;
        author: { display_name: string } | null;
    } | null;
}

export default function ReportsClient({
    initialReports,
}: {
    initialReports: Report[];
}) {
    const supabase = createClient();
    const [reports, setReports] = useState<Report[]>(initialReports);
    const [filter, setFilter] = useState<"all" | Status>("all");
    const [processing, setProcessing] = useState<string | null>(null);

    async function updateStatus(id: string, status: Status) {
        setProcessing(id);
        await supabase.from("reports").update({ status }).eq("id", id);
        setReports((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        setProcessing(null);
    }

    async function deletePost(reportId: string, postId: string) {
        if (!confirm("Permanently delete this post? This cannot be undone.")) return;
        setProcessing(reportId);
        const res = await fetch("/api/admin/delete-post", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId }),
        });
        if (res.ok) {
            // Remove all reports for this post from the list
            setReports((prev) => prev.filter((r) => r.post?.id !== postId));
        } else {
            const { error } = await res.json();
            alert("Failed to delete post: " + error);
        }
        setProcessing(null);
    }

    const filtered =
        filter === "all" ? reports : reports.filter((r) => r.status === filter);

    const counts = {
        all: reports.length,
        pending: reports.filter((r) => r.status === "pending").length,
        reviewed: reports.filter((r) => r.status === "reviewed").length,
        dismissed: reports.filter((r) => r.status === "dismissed").length,
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {(["all", "pending", "reviewed", "dismissed"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className="btn"
                        style={{
                            padding: "0.35rem 0.9rem",
                            fontSize: "0.8rem",
                            background:
                                filter === f
                                    ? "rgba(99,102,241,0.15)"
                                    : "rgba(255,255,255,0.04)",
                            color: filter === f ? "var(--brand)" : "var(--text-muted)",
                            border: `1px solid ${filter === f ? "rgba(99,102,241,0.35)" : "var(--border)"}`,
                        }}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
                        <span style={{ opacity: 0.7 }}>({counts[f]})</span>
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div
                    className="glass"
                    style={{
                        borderRadius: 14,
                        padding: "2rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                    }}
                >
                    No reports in this category.
                </div>
            ) : (
                filtered.map((report) => (
                    <ReportRow
                        key={report.id}
                        report={report}
                        processing={processing === report.id}
                        onAction={updateStatus}
                        onDelete={deletePost}
                    />
                ))
            )}
        </div>
    );
}

function ReportRow({
    report,
    processing,
    onAction,
    onDelete,
}: {
    report: Report;
    processing: boolean;
    onAction: (id: string, status: "reviewed" | "dismissed") => void;
    onDelete: (reportId: string, postId: string) => void;
}) {
    const timeStr = new Date(report.created_at).toLocaleDateString("en-SA", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const statusBadge = (s: string) => {
        if (s === "pending") return <span className="badge badge-pending">Pending</span>;
        if (s === "reviewed") return <span className="badge badge-reviewed">Reviewed</span>;
        return <span className="badge badge-dismissed">Dismissed</span>;
    };

    return (
        <div
            className="glass"
            style={{ borderRadius: 14, padding: "1.1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}
        >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                        {statusBadge(report.status)}
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            {timeStr}
                        </span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "0.87rem", margin: 0 }}>
                        Reason:{" "}
                        <span style={{ color: "#fbbf24" }}>{report.reason}</span>
                    </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                    {report.status === "pending" && (
                        <>
                            <button
                                onClick={() => onAction(report.id, "reviewed")}
                                disabled={processing}
                                className="btn"
                                style={{
                                    padding: "0.3rem 0.7rem",
                                    fontSize: "0.78rem",
                                    gap: "0.35rem",
                                    background: "rgba(34,197,94,0.12)",
                                    color: "#4ade80",
                                    border: "1px solid rgba(34,197,94,0.25)",
                                }}
                                title="Mark reviewed"
                            >
                                {processing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                                Reviewed
                            </button>
                            <button
                                onClick={() => onAction(report.id, "dismissed")}
                                disabled={processing}
                                className="btn"
                                style={{
                                    padding: "0.3rem 0.7rem",
                                    fontSize: "0.78rem",
                                    gap: "0.35rem",
                                    background: "rgba(156,163,175,0.1)",
                                    color: "#9ca3af",
                                    border: "1px solid rgba(156,163,175,0.2)",
                                }}
                                title="Dismiss"
                            >
                                <XCircle size={13} />
                                Dismiss
                            </button>
                        </>
                    )}
                    {/* Delete post — always visible for admins */}
                    {report.post && (
                        <button
                            onClick={() => onDelete(report.id, report.post!.id)}
                            disabled={processing}
                            className="btn"
                            style={{
                                padding: "0.3rem 0.7rem",
                                fontSize: "0.78rem",
                                gap: "0.35rem",
                                background: "rgba(239,68,68,0.12)",
                                color: "#f87171",
                                border: "1px solid rgba(239,68,68,0.25)",
                            }}
                            title="Delete post permanently"
                        >
                            {processing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            Delete Post
                        </button>
                    )}
                </div>
            </div>

            {/* Post preview */}
            {report.post && (
                <div
                    style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "0.65rem 0.85rem",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                            Post by{" "}
                            <strong style={{ color: "var(--text)" }}>
                                {report.post.author?.display_name ?? "Unknown"}
                            </strong>
                        </span>
                        <Link
                            href={`/app/post/${report.post.id}`}
                            style={{ fontSize: "0.74rem", color: "var(--brand)" }}
                        >
                            View post →
                        </Link>
                    </div>
                    <p
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {report.post.content || "(image post — no text)"}
                    </p>
                </div>
            )}

            {/* Reporter */}
            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0 }}>
                Reported by:{" "}
                <Link
                    href={`/app/profile/${report.reporter?.id}`}
                    style={{ color: "var(--text)", fontWeight: 600 }}
                >
                    {report.reporter?.display_name ?? "Unknown"}
                </Link>
            </p>
        </div>
    );
}
