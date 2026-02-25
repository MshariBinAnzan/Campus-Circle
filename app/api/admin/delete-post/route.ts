import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/utils";

export async function DELETE(request: NextRequest) {
    // 1️⃣ Verify the requester is an authenticated admin
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email ?? "")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2️⃣ Get the post ID from the request body
    let postId: string;
    try {
        const body = await request.json();
        postId = body.postId;
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!postId) {
        return NextResponse.json({ error: "postId required" }, { status: 400 });
    }

    // 3️⃣ Try to delete using service role key (bypasses RLS entirely)
    //    Falls back to regular client if key not configured (uses admin RLS policy)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let deleteError = null;

    if (serviceRoleKey) {
        // Service role path — works with zero additional setup
        const { createClient } = await import("@supabase/supabase-js");
        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );
        const { error } = await adminClient.from("posts").delete().eq("id", postId);
        deleteError = error;
    } else {
        // Fallback — uses the admin RLS policy from supabase_migration_v4.sql
        const { error } = await supabase.from("posts").delete().eq("id", postId);
        deleteError = error;
    }

    if (deleteError) {
        console.error("Admin delete error:", deleteError);
        return NextResponse.json(
            { error: deleteError.message ?? "Delete failed. Make sure supabase_migration_v4.sql has been run." },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
