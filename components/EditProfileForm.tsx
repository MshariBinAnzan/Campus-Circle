"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ChevronDown, ChevronUp, ImagePlus, X } from "lucide-react";

interface Profile {
    id: string;
    display_name: string;
    avatar_url: string | null;
}

export default function EditProfileForm({
    profile,
    userId,
}: {
    profile: Profile;
    userId: string;
}) {
    const router = useRouter();
    const supabase = createClient();
    const fileRef = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [displayName, setDisplayName] = useState(profile.display_name);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        profile.avatar_url
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setError("Avatar must be smaller than 2 MB.");
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (displayName.trim().length < 2) {
            setError("Display name must be at least 2 characters.");
            return;
        }

        setLoading(true);

        let avatarUrl = profile.avatar_url;

        if (avatarFile) {
            const ext = avatarFile.name.split(".").pop();
            const path = `avatars/${userId}.${ext}`;
            const { error: uploadErr } = await supabase.storage
                .from("post-images")
                .upload(path, avatarFile, { upsert: true });

            if (uploadErr) {
                setError("Avatar upload failed: " + uploadErr.message);
                setLoading(false);
                return;
            }

            const { data: urlData } = supabase.storage
                .from("post-images")
                .getPublicUrl(path);
            avatarUrl = urlData.publicUrl;
        }

        const { error: updateErr } = await supabase
            .from("profiles")
            .update({ display_name: displayName.trim(), avatar_url: avatarUrl })
            .eq("id", userId);

        if (updateErr) {
            setError(updateErr.message);
            setLoading(false);
            return;
        }

        setLoading(false);
        setSuccess(true);
        setAvatarFile(null);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
    }

    return (
        <div className="glass" style={{ borderRadius: 16, overflow: "hidden" }}>
            {/* Toggle header */}
            <button
                onClick={() => setOpen((v) => !v)}
                style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    color: "var(--text)",
                }}
            >
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    Edit Profile
                </span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {open && (
                <form
                    onSubmit={handleSave}
                    style={{
                        padding: "0 1.25rem 1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.9rem",
                        borderTop: "1px solid var(--border)",
                    }}
                >
                    {/* Avatar */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "0.9rem" }}>
                        {avatarPreview ? (
                            <div style={{ position: "relative", display: "inline-block" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={avatarPreview}
                                    alt="avatar"
                                    style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setAvatarPreview(null); setAvatarFile(null); }}
                                    style={{
                                        position: "absolute",
                                        top: -4,
                                        right: -4,
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        background: "#1f1f30",
                                        border: "1px solid var(--border)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        padding: 0,
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ) : (
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.4rem",
                                    fontWeight: 700,
                                    color: "#fff",
                                }}
                            >
                                {displayName[0]?.toUpperCase()}
                            </div>
                        )}

                        <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ gap: "0.4rem", fontSize: "0.82rem" }}
                            onClick={() => fileRef.current?.click()}
                        >
                            <ImagePlus size={15} /> Change photo
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAvatarSelect}
                        />
                    </div>

                    {/* Display name */}
                    <div>
                        <label style={labelStyle}>Display Name</label>
                        <input
                            type="text"
                            className="input"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p style={{ color: "#f87171", fontSize: "0.82rem" }}>{error}</p>
                    )}
                    {success && (
                        <p style={{ color: "#4ade80", fontSize: "0.82rem" }}>
                            ✓ Profile updated!
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ alignSelf: "flex-start", height: 40 }}
                    >
                        {loading ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.35rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "var(--text-muted)",
};
