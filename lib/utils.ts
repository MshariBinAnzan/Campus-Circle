export const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN ?? "student.um.edu.sa";

export function isAllowedEmail(email: string): boolean {
    return email.trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

export function getAdminEmails(): string[] {
    const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
    return raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

export function isAdmin(email: string): boolean {
    return getAdminEmails().includes(email.trim().toLowerCase());
}
