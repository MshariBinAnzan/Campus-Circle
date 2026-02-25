"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2 } from "lucide-react";

const REASONS = [
    "Spam or advertising",
    "Harassment or bullying",
    "Inappropriate content",
    "Misinformation",
    "Other",
];

export default function ReportModal({
    postId,
    reporterId,
    onClose,
}: {
    postId: string;
    reporterId: string;
    onClose: () => void;
}) {
    const supabase = createClient();
    const [reason, setReason] = useState(REASONS[0]);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function submit() {
        setLoading(true);
        await supabase.from("reports").insert({
            reporter_id: reporterId,
            post_id: postId,
            reason,
            status: "pending",
        });
        setLoading(false);
        setDone(true);
        setTimeout(onClose, 1500);
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                padding: "1rem",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="glass animate-fade-up"
                style={{ width: "100%", maxWidth: 400, borderRadius: 18, padding: "1.75rem" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                        Report Post
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", lineHeight: 0 }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {done ? (
                    <p style={{ textAlign: "center", color: "#4ade80", fontWeight: 600 }}>
                        ✓ Report submitted. Thank you.
                    </p>
                ) : (
                    <>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.9rem" }}>
                            Why are you reporting this post?
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                            {REASONS.map((r) => (
                                <label
                                    key={r}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.6rem",
                                        cursor: "pointer",
                                        padding: "0.55rem 0.75rem",
                                        borderRadius: 10,
                                        background: reason === r ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${reason === r ? "rgba(99,102,241,0.35)" : "var(--border)"}`,
                                        fontSize: "0.875rem",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r}
                                        checked={reason === r}
                                        onChange={() => setReason(r)}
                                        style={{ accentColor: "var(--brand)" }}
                                    />
                                    {r}
                                </label>
                            ))}
                        </div>

                        <button
                            onClick={submit}
                            disabled={loading}
                            className="btn btn-danger"
                            style={{ width: "100%", height: 42 }}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Report"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
