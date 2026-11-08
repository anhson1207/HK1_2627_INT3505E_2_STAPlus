import { useState, useEffect } from "react";
import {
    Building2,
    Save,
    Crown,
    ShieldAlert,
    Phone,
    Mail,
    Globe,
    MapPin,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { Button, CircularProgress, TextField, MenuItem } from "@mui/material";
import { useAuthStore } from "../../stores/authStore";
import { organizationService } from "../../services/organizationService";
import type { Organization, UpdateOrganizationData } from "../../types/auth";

const INDUSTRY_OPTIONS = [
    "Công nghệ / Phần mềm",
    "Thương mại điện tử & Bán lẻ",
    "Bất động sản & Xây dựng",
    "Tài chính / Bảo hiểm / Ngân hàng",
    "Sản xuất & Xuất nhập khẩu",
    "Giáo dục & Đào tạo",
    "Y tế & Chăm sóc sức khỏe",
    "Du lịch & Khách sạn",
    "Dịch vụ tư vấn / B2B",
    "Khác",
];

const COMPANY_SIZE_OPTIONS = [
    "1–10 nhân viên",
    "11–50 nhân viên",
    "51–200 nhân viên",
    "201–500 nhân viên",
    "Trên 500 nhân viên",
];

const TIMEZONE_OPTIONS = [
    { label: "Việt Nam (GMT+7) — Asia/Ho_Chi_Minh", value: "Asia/Ho_Chi_Minh" },
    { label: "Singapore / Malaysia (GMT+8) — Asia/Singapore", value: "Asia/Singapore" },
    { label: "Nhật Bản / Hàn Quốc (GMT+9) — Asia/Tokyo", value: "Asia/Tokyo" },
    { label: "Giờ phối hợp quốc tế — UTC", value: "UTC" },
];

export default function CompanySettingsPage() {
    const user = useAuthStore((state) => state.user);
    const isOwner = Boolean(user?.isOwner);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [formData, setFormData] = useState<UpdateOrganizationData>({
        name: "",
        industry: "Công nghệ / Phần mềm",
        companySize: "11–50 nhân viên",
        logoUrl: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        timezone: "Asia/Ho_Chi_Minh",
    });

    useEffect(() => {
        let mounted = true;
        organizationService.getOrganization()
            .then((org) => {
                if (mounted) {
                    setOrganization(org);
                    setFormData({
                        name: org.name || "",
                        industry: org.industry || "Công nghệ / Phần mềm",
                        companySize: org.companySize || "11–50 nhân viên",
                        logoUrl: org.logoUrl || "",
                        phone: org.phone || "",
                        email: org.email || "",
                        website: org.website || "",
                        address: org.address || "",
                        timezone: org.timezone || "Asia/Ho_Chi_Minh",
                    });
                }
            })
            .catch((err) => {
                if (mounted) {
                    setFeedback({
                        type: "error",
                        text: err instanceof Error ? err.message : "Không thể tải thông tin doanh nghiệp.",
                    });
                }
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    const handleChange = (field: keyof UpdateOrganizationData, val: string) => {
        setFormData((prev) => ({ ...prev, [field]: val }));
        setFeedback(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOwner) return;

        if (!formData.name.trim()) {
            setFeedback({ type: "error", text: "Tên doanh nghiệp không được để trống." });
            return;
        }

        setSaving(true);
        setFeedback(null);
        try {
            const updated = await organizationService.updateOrganization(formData);
            setOrganization(updated);
            setFeedback({ type: "success", text: "Cập nhật thông tin doanh nghiệp thành công!" });
        } catch (err: unknown) {
            setFeedback({
                type: "error",
                text: err instanceof Error ? err.message : "Cập nhật thất bại. Vui lòng thử lại.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <CircularProgress size={32} />
                <p className="mt-3 text-xs text-(--crm-text-secondary)">Đang tải hồ sơ doanh nghiệp...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Badge */}
            <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-5 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 font-bold text-xl border border-teal-500/20">
                            <Building2 size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-(--crm-heading)">
                                    {organization?.name || "Doanh nghiệp STAPlus CRM"}
                                </h2>
                                {isOwner && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 border border-amber-500/20">
                                        <Crown size={12} />
                                        Bạn là Chủ sở hữu (Owner)
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-(--crm-text-secondary)">
                                Bản triển khai độc lập (Single Company) • Múi giờ hệ thống: {organization?.timezone || "Asia/Ho_Chi_Minh"}
                            </p>
                        </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-(--crm-border) sm:pl-5">
                        <p className="text-xs text-(--crm-text-secondary)">Chủ tài khoản hệ thống:</p>
                        <p className="font-semibold text-xs text-(--crm-text)">
                            {organization?.ownerName || "Quản trị viên"}
                        </p>
                        <p className="font-mono text-[11px] text-(--crm-text-secondary)">
                            {organization?.ownerEmail || "admin@crm.local"}
                        </p>
                    </div>
                </div>

                {!isOwner && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
                        <ShieldAlert size={16} className="shrink-0 text-amber-600" />
                        <span>
                            Chỉ tài khoản <strong>Chủ sở hữu (Owner: {organization?.ownerName || "Admin"})</strong> mới có quyền thay đổi thông tin định danh của doanh nghiệp. Bạn đang xem ở chế độ chỉ đọc.
                        </span>
                    </div>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-6 shadow-xs space-y-6">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-(--crm-text-secondary)">
                        Thông tin định danh Doanh nghiệp
                    </h3>
                    <p className="text-xs text-(--crm-text-secondary) mt-0.5">
                        Tên và thông tin này được hiển thị trên tiêu đề hệ thống, email và các chứng từ CRM.
                    </p>
                </div>

                {feedback && (
                    <div className={`flex items-center gap-2 rounded-xl p-3 text-xs border ${
                        feedback.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
                    }`}>
                        {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{feedback.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <TextField
                            label="Tên Công ty / Doanh nghiệp *"
                            fullWidth
                            size="small"
                            disabled={!isOwner}
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </div>

                    <TextField
                        select
                        label="Lĩnh vực hoạt động"
                        size="small"
                        disabled={!isOwner}
                        value={formData.industry}
                        onChange={(e) => handleChange("industry", e.target.value)}
                    >
                        {INDUSTRY_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Quy mô nhân sự"
                        size="small"
                        disabled={!isOwner}
                        value={formData.companySize}
                        onChange={(e) => handleChange("companySize", e.target.value)}
                    >
                        {COMPANY_SIZE_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Số điện thoại tổng đài / liên hệ"
                        size="small"
                        disabled={!isOwner}
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: <Phone size={16} className="text-(--crm-text-secondary) mr-2" />,
                            },
                        }}
                    />

                    <TextField
                        label="Email doanh nghiệp"
                        type="email"
                        size="small"
                        disabled={!isOwner}
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: <Mail size={16} className="text-(--crm-text-secondary) mr-2" />,
                            },
                        }}
                    />

                    <TextField
                        label="Website chính thức"
                        size="small"
                        disabled={!isOwner}
                        value={formData.website}
                        onChange={(e) => handleChange("website", e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: <Globe size={16} className="text-(--crm-text-secondary) mr-2" />,
                            },
                        }}
                    />

                    <TextField
                        select
                        label="Múi giờ hệ thống"
                        size="small"
                        disabled={!isOwner}
                        value={formData.timezone}
                        onChange={(e) => handleChange("timezone", e.target.value)}
                    >
                        {TIMEZONE_OPTIONS.map((tz) => (
                            <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>
                        ))}
                    </TextField>

                    <div className="md:col-span-2">
                        <TextField
                            label="Địa chỉ văn phòng / trụ sở chính"
                            fullWidth
                            size="small"
                            disabled={!isOwner}
                            value={formData.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: <MapPin size={16} className="text-(--crm-text-secondary) mr-2" />,
                                },
                            }}
                        />
                    </div>
                </div>

                {isOwner && (
                    <div className="flex justify-end pt-2 border-t border-(--crm-border)">
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
                        >
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
