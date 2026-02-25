"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ImagePlus, Loader2, X } from "lucide-react";

export default function CreatePost({ userId }: { userId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const fileRef = useRef<HTMLInputElement>(null);

    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be smaller than 5 MB.");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    function removeImage() {
        setImageFile(null);
        setImagePreview(null);
        if (fileRef.current) fileRef.current.value = "";
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim() && !imageFile) return;
        setError("");
        setLoading(true);

        let imageUrl: string | null = null;

        if (imageFile) {
            const ext = imageFile.name.split(".").pop();
            const path = `${userId}/${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from("post-images")
                .upload(path, imageFile, { upsert: false });

            if (uploadError) {
                setError("Image upload failed: " + uploadError.message);
                setLoading(false);
                return;
            }

            const { data: urlData } = supabase.storage
                .from("post-images")
                .getPublicUrl(path);
            imageUrl = urlData.publicUrl;
        }

        const { error: insertError } = await supabase.from("posts").insert({
            user_id: userId,
            content: content.trim(),
            image_url: imageUrl,
        });

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        setContent("");
        removeImage();
        setLoading(false);
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="glass"
            style={{ borderRadius: 16, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}
        >
            <textarea
                className="input"
                rows={3}
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: "none", fontSize: "0.95rem" }}
            />

            {/* Image preview */}
            {imagePreview && (
                <div style={{ position: "relative", display: "inline-block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imagePreview}
                        alt="preview"
                        style={{
                            maxHeight: 240,
                            borderRadius: 10,
                            objectFit: "cover",
                            width: "100%",
                        }}
                    />
                    <button
                        type="button"
                        onClick={removeImage}
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "rgba(0,0,0,0.6)",
                            border: "none",
                            borderRadius: "50%",
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#fff",
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {error && (
                <p style={{ color: "#f87171", fontSize: "0.82rem" }}>{error}</p>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: "0.4rem 0.75rem", gap: "0.4rem" }}
                    onClick={() => fileRef.current?.click()}
                >
                    <ImagePlus size={16} />
                    <span style={{ fontSize: "0.82rem" }}>Photo</span>
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageSelect}
                />
                <button
                    type="submit"
                    disabled={loading || (!content.trim() && !imageFile)}
                    className="btn btn-primary"
                    style={{ padding: "0.45rem 1.25rem" }}
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Post"}
                </button>
            </div>
        </form>
    );
}
