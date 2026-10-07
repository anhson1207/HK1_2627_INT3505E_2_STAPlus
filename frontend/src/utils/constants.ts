import type { LeadSource, LeadStatus } from "../types/lead";

export const LEAD_STATUS_OPTIONS: ReadonlyArray<{
    value: LeadStatus;
    label: string;
}> = [
    { value: "NEW", label: "Mới" },
    { value: "CONTACTED", label: "Đã liên hệ" },
    { value: "QUALIFIED", label: "Đủ điều kiện" },
    { value: "CONVERTED", label: "Đã chuyển đổi" },
    { value: "LOST", label: "Thất bại" },
];

export const LEAD_SOURCE_OPTIONS: ReadonlyArray<{
    value: LeadSource;
    label: string;
}> = [
    { value: "WEBSITE", label: "Website" },
    { value: "FACEBOOK", label: "Facebook" },
    { value: "ZALO", label: "Zalo" },
    { value: "GOOGLE_ADS", label: "Google Ads" },
    { value: "REFERRAL", label: "Giới thiệu" },
    { value: "OTHER", label: "Khác" },
];

export function getLeadStatusLabel(status: LeadStatus) {
    return LEAD_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getLeadSourceLabel(source: LeadSource) {
    return LEAD_SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? source;
}
