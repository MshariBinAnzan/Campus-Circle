"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { Search } from "lucide-react";

export default function FeedSearchBar() {
    const { t } = useLang();
    return (
        <Link
            href="/app/search"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.7rem 1rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #27272a",
                borderRadius: 12,
                color: "#52525b",
                fontSize: "0.875rem",
                textDecoration: "none",
                cursor: "text",
                transition: "border-color 0.15s",
            }}
        >
            <Search size={15} />
            {t.searchPlaceholder}
        </Link>
    );
}
