"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ChevronLeft, BookOpen } from "lucide-react";
import Link from "next/link";

const DEPARTMENTS = [
    "Computer Science",
    "Business Administration",
    "Engineering",
    "Health Sciences",
    "Medical",
    "Nursing",
    "Information Systems",
];

export default function NewCoursePage() {
    const router = useRouter();
    const [courseCode, setCourseCode] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState(DEPARTMENTS[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!courseCode.trim() || !name.trim()) return;
        setLoading(true);
        setError("");

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: group, error: err } = await supabase
            .from("course_groups")
            .insert({
                course_code: courseCode.trim().toUpperCase(),
                name: name.trim(),
                department,
                created_by: user.id,
            })
            .select()
            .single();

        if (err) { setError(err.message); setLoading(false); return; }

        // Creator is automatically a member
        await supabase.from("course_members").insert({
            course_id: (group as { id: string }).id,
            user_id: user.id,
        });

        router.push(`/app/courses/${(group as { id: string }).id}`);
    }

    return (
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <Link
                href="/app/courses"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "1.5rem" }}
            >
                <ChevronLeft size={16} /> Back to Course Groups
            </Link>

            <div className="glass" style={{ borderRadius: 18, padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BookOpen size={18} style={{ color: "var(--brand)" }} />
                    </div>
                    <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>Create Course Group</h1>
                </div>

                <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

                    {/* Course Code */}
                    <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                            Course Code <span style={{ color: "#f87171" }}>*</span>
                        </label>
                        <input
                            className="input"
                            placeholder="e.g. CS101, BUS204, ENG301"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            required
                            maxLength={15}
                            style={{ textTransform: "uppercase" }}
                        />
                    </div>

                    {/* Course Name */}
                    <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                            Course Name <span style={{ color: "#f87171" }}>*</span>
                        </label>
                        <input
                            className="input"
                            placeholder="e.g. Introduction to Programming"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={80}
                        />
                    </div>

                    {/* Department */}
                    <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                            Department
                        </label>
                        <select
                            className="input"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            style={{ cursor: "pointer" }}
                        >
                            {DEPARTMENTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <p style={{ fontSize: "0.85rem", color: "#f87171", padding: "0.6rem 0.85rem", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !courseCode.trim() || !name.trim()}
                        className="btn btn-primary"
                        style={{ padding: "0.7rem", fontSize: "0.95rem", marginTop: "0.25rem" }}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Course Group"}
                    </button>
                </form>
            </div>
        </div>
    );
}
