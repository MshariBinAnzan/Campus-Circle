import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";
import MobileLangToggle from "@/components/MobileLangToggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="app-shell" style={{ minHeight: "100vh", display: "flex", background: "var(--surface)" }}>
            <AppNav profile={profile} userEmail={user.email ?? ""} />
            <main className="app-main" style={{ flex: 1, minWidth: 0, padding: "1.75rem 1.5rem 4rem", overflowX: "hidden" }}>
                {children}
            </main>
            {/* Language toggle — only visible on mobile (CSS controlled) */}
            <MobileLangToggle />
        </div>
    );
}
