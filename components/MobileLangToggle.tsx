"use client";

import { useLang } from "@/lib/i18n";

export default function MobileLangToggle() {
    const { lang, setLang } = useLang();

    return (
        <button
            className="mobile-lang-toggle"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
        >
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>
                {lang === "en" ? "🇸🇦" : "🇺🇸"}
            </span>
            <span className="mobile-lang-label">
                {lang === "en" ? "عربي" : "EN"}
            </span>
        </button>
    );
}
