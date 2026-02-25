import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "var(--surface)",
            }}
        >
            <AppNav profile={profile} userEmail={user.email ?? ""} />
            <main
                style={{
                    flex: 1,
                    maxWidth: 760,
                    width: "100%",
                    marginInline: "auto",
                    padding: "1.5rem 1rem 4rem",
                }}
            >
                {children}
            </main>
        </div>
    );
}
