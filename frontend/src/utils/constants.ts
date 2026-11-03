import type { CustomerStatus } from "../types/customer";
import type { LeadSource, LeadStatus } from "../types/lead";

export const CUSTOMER_STATUS_OPTIONS: ReadonlyArray<{
    value: CustomerStatus;
    label: string;
}> = [
    { value: "ACTIVE", label: "Đang hoạt động" },
    { value: "INACTIVE", label: "Ngừng hoạt động" },
];

export function getCustomerStatusLabel(status: CustomerStatus) {
    return CUSTOMER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

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
    { value: "WEBSITE", label: "Form Website" },
    { value: "FACEBOOK", label: "Facebook Ads" },
    { value: "ZALO", label: "Zalo OA" },
    { value: "GOOGLE_ADS", label: "Google Ads" },
    { value: "PHONE", label: "Điện thoại / Cold-call" },
    { value: "REFERRAL", label: "Giới thiệu" },
    { value: "EVENT", label: "Sự kiện / Hội thảo" },
    { value: "OTHER", label: "Khác / Import" },
];

export function getLeadStatusLabel(status: LeadStatus) {
    return LEAD_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getLeadSourceLabel(source: LeadSource) {
    return LEAD_SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? source;
}
