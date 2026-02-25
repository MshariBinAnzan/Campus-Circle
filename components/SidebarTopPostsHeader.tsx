"use client";

import { useLang } from "@/lib/i18n";

export default function SidebarTopPostsHeader() {
    const { t } = useLang();
    return (
        <h3
            style={{
                fontWeight: 800,
                fontSize: "0.82rem",
                color: "#e4e4e7",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
            }}
        >
            {t.topToday}
        </h3>
    );
}
