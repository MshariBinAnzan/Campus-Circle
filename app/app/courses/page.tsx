import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, BookOpen, Users } from "lucide-react";

export const metadata: Metadata = { title: "Course Groups — CampusCircle" };
export const dynamic = "force-dynamic";

const DEPARTMENTS = ["All", "Computer Science", "Business Administration", "Engineering", "Health Sciences", "Medical", "Nursing", "Information Systems"];

type CourseGroup = {
    id: string;
    course_code: string;
    name: string;
    department: string;
    semester: string;
    created_by: string;
    created_at: string;
    member_count?: number;
};

export default async function CoursesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; dept?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { q, dept } = await searchParams;

    // Fetch all course groups + member counts
    let query = supabase
        .from("course_groups")
        .select("*")
        .order("course_code", { ascending: true });

    if (q) {
        query = query.or(`course_code.ilike.%${q}%,name.ilike.%${q}%`);
    }
    if (dept && dept !== "All") {
        query = query.eq("department", dept);
    }

    const [{ data: rawGroups }, { data: rawMyMemberships }] = await Promise.all([
        query,
        supabase.from("course_members").select("course_id").eq("user_id", user!.id),
    ]);

    const groups = (rawGroups ?? []) as CourseGroup[];
    const joinedSet = new Set((rawMyMemberships ?? []).map((m: { course_id: string }) => m.course_id));

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <BookOpen size={22} style={{ color: "var(--brand)" }} />
                        Course Groups
                    </h1>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Join your courses to discuss, share notes, and chat with classmates
                    </p>
                </div>
                <Link href="/app/courses/new" className="btn btn-primary" style={{ gap: "0.4rem", flexShrink: 0 }}>
                    <Plus size={15} /> New Group
                </Link>
            </div>

            {/* Search bar */}
            <form method="GET" style={{ display: "flex", gap: "0.6rem" }}>
                <input
                    className="input"
                    name="q"
                    defaultValue={q ?? ""}
                    placeholder="Search by course code or name… e.g. CS101"
                    style={{ flex: 1 }}
                />
                {dept && <input type="hidden" name="dept" value={dept} />}
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: "0 1.1rem" }}>
                    Search
                </button>
            </form>

            {/* Department filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {DEPARTMENTS.map((d) => (
                    <Link
                        key={d}
                        href={`/app/courses?${q ? `q=${q}&` : ""}dept=${d}`}
                        style={{
                            padding: "0.3rem 0.8rem",
                            borderRadius: 999,
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            background: (dept ?? "All") === d ? "var(--brand)" : "rgba(255,255,255,0.04)",
                            color: (dept ?? "All") === d ? "#fff" : "var(--text-muted)",
                            border: `1px solid ${(dept ?? "All") === d ? "var(--brand)" : "#27272a"}`,
                            transition: "all 0.15s",
                        }}
                    >
                        {d}
                    </Link>
                ))}
            </div>

            {/* Course group list */}
            {groups.length === 0 ? (
                <div className="glass" style={{ borderRadius: 16, padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📚</div>
                    <p style={{ fontWeight: 600, color: "#a1a1aa", marginBottom: "0.4rem" }}>
                        {q ? `No groups found for "${q}"` : "No course groups yet"}
                    </p>
                    <p style={{ fontSize: "0.85rem" }}>Be the first to create one for your course!</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {groups.map((group) => {
                        const isMember = joinedSet.has(group.id);
                        return (
                            <Link
                                key={group.id}
                                href={`/app/courses/${group.id}`}
                                className="glass glass-hover"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1rem 1.25rem",
                                    borderRadius: 14,
                                    textDecoration: "none",
                                    color: "var(--text)",
                                }}
                            >
                                {/* Course code badge */}
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 14,
                                    background: "rgba(99,102,241,0.12)",
                                    border: "1px solid rgba(99,102,241,0.25)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    gap: "0.1rem",
                                }}>
                                    <BookOpen size={16} style={{ color: "var(--brand)" }} />
                                    <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "var(--brand)", letterSpacing: "0.02em" }}>
                                        {group.course_code}
                                    </span>
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{group.name}</p>
                                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
                                        {group.department}
                                    </p>
                                </div>

                                {/* Status */}
                                {isMember ? (
                                    <span className="badge badge-reviewed" style={{ flexShrink: 0 }}>
                                        <Users size={10} style={{ display: "inline" }} /> Joined
                                    </span>
                                ) : (
                                    <span style={{
                                        fontSize: "0.75rem",
                                        color: "var(--brand)",
                                        fontWeight: 600,
                                        flexShrink: 0,
                                        border: "1px solid rgba(99,102,241,0.3)",
                                        borderRadius: 999,
                                        padding: "0.2rem 0.65rem",
                                    }}>
                                        + Join
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
