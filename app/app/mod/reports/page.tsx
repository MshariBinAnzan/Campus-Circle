import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import type { Metadata } from "next";
import ReportsClient from "@/components/ReportsClient";

export const metadata: Metadata = { title: "Mod · Reports" };
export const dynamic = "force-dynamic";

type ReportWithRelations = {
    id: string;
    reason: string;
    status: string;
    created_at: string;
    reporter_id: string;
    post_id: string;
    reporter: { id: string; display_name: string } | null;
    post: {
        id: string;
        content: string;
        user_id: string;
        author: { display_name: string } | null;
    } | null;
};

export default async function ModReportsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email ?? "")) {
        redirect("/app/feed");
    }

    const { data: rawReports } = await supabase
        .from("reports")
        .select(
            `
      *,
      reporter:profiles!reports_reporter_id_fkey(id, display_name),
      post:posts!reports_post_id_fkey(id, content, user_id,
        author:profiles!posts_user_id_fkey(display_name)
      )
    `
        )
        .order("created_at", { ascending: false });

    const reports = (rawReports ?? []) as ReportWithRelations[];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Header */}
            <div
                className="glass"
                style={{
                    borderRadius: 16,
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>
                        🛡️ Moderation Dashboard
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.2rem 0 0" }}>
                        {reports.filter((r) => r.status === "pending").length} pending
                        report(s)
                    </p>
                </div>
                <span className="badge badge-brand">Admin</span>
            </div>

            <ReportsClient initialReports={reports} />
        </div>
    );
}
