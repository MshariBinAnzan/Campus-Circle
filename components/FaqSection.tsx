"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { t } = useLang();

    // Built from translation keys — switches automatically with the language toggle
    const faqItems = [
        { q: t.faqQ1, a: t.faqA1 },
        { q: t.faqQ2, a: t.faqA2 },
        { q: t.faqQ3, a: t.faqA3 },
        { q: t.faqQ4, a: t.faqA4 },
    ];

    const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

    return (
        <div
            className="glass"
            style={{ borderRadius: 14, overflow: "hidden" }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "0.9rem 1rem 0.65rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}
            >
                <span style={{ fontSize: "1rem" }}>❓</span>
                <h3
                    style={{
                        fontWeight: 800,
                        fontSize: "0.82rem",
                        color: "#e4e4e7",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                    }}
                >
                    {t.faqTitle}
                </h3>
            </div>

            {/* Accordion items */}
            {faqItems.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                    <div
                        key={i}
                        style={{
                            borderBottom:
                                i < faqItems.length - 1
                                    ? "1px solid var(--border)"
                                    : "none",
                        }}
                    >
                        {/* Question row */}
                        <button
                            onClick={() => toggle(i)}
                            aria-expanded={isOpen}
                            style={{
                                all: "unset",
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "0.5rem",
                                padding: "0.7rem 1rem",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: isOpen ? "var(--text)" : "#a1a1aa",
                                transition: "color 0.15s, background 0.15s",
                            }}
                            className="glass-hover"
                        >
                            <span style={{ flex: 1, textAlign: "left" }}>
                                {item.q}
                            </span>
                            <span
                                style={{
                                    display: "inline-block",
                                    fontSize: "0.75rem",
                                    color: "#52525b",
                                    transition: "transform 0.2s ease",
                                    transform: isOpen
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                    flexShrink: 0,
                                }}
                            >
                                ▾
                            </span>
                        </button>

                        {/* Answer (animated reveal) */}
                        <div
                            style={{
                                maxHeight: isOpen ? 200 : 0,
                                overflow: "hidden",
                                transition: "max-height 0.25s ease",
                            }}
                        >
                            <p
                                style={{
                                    padding: "0 1rem 0.8rem",
                                    fontSize: "0.78rem",
                                    lineHeight: 1.6,
                                    color: "#71717a",
                                }}
                            >
                                {item.a}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
