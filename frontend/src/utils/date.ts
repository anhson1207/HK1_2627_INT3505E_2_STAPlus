const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

function parseDate(value: string | number | Date): Date | null {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | number | Date): string {
    const date = parseDate(value);
    return date ? dateFormatter.format(date) : "—";
}

export function formatDateTime(value: string | number | Date): string {
    const date = parseDate(value);
    return date ? dateTimeFormatter.format(date) : "—";
}

export function formatRelativeTime(value: string | number | Date): string {
    const date = parseDate(value);
    if (!date) return "—";
    const elapsed = Date.now() - date.getTime();
    if (elapsed < 0) return formatDateTime(date);
    const minutes = Math.floor(elapsed / 60_000);
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return formatDate(date);
}
