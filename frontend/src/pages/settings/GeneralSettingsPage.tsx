import {
    Alert,
    Button,
    CircularProgress,
    MenuItem,
    Snackbar,
    TextField,
} from "@mui/material";
import {
    Calendar,
    Coins,
    Globe,
    Save,
    Settings,
} from "lucide-react";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";

import { organizationService } from "../../services/organizationService";
import { useSettingsStore, type GeneralSettings } from "../../stores/settingsStore";
import type { Organization } from "../../types/auth";

export default function GeneralSettingsPage() {
    const saved = useSettingsStore((state) => state.general);
    const saveGeneral = useSettingsStore((state) => state.saveGeneral);

    const [org, setOrg] = useState<Organization | null>(null);
    const [form, setForm] = useState<GeneralSettings>(saved);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        setLoading(true);
        organizationService
            .getOrganization()
            .then((data) => {
                if (!active) return;
                setOrg(data);
                const nextSettings: GeneralSettings = {
                    crmName: data.crmName?.trim() || saved.crmName || "STAplus crm",
                    companyName: data.name?.trim() || saved.companyName,
                    currency: data.currency === "USD" ? "USD" : "VND",
                    timezone: data.timezone?.trim() || saved.timezone || "Asia/Ho_Chi_Minh",
                    language: data.language === "en" ? "en" : "vi",
                    dateFormat:
                        data.dateFormat === "MM/dd/yyyy" || data.dateFormat === "yyyy-MM-dd"
                            ? data.dateFormat
                            : "dd/MM/yyyy",
                };
                setForm(nextSettings);
                saveGeneral(nextSettings);
                setError("");
            })
            .catch((err) => {
                if (!active) return;
                const msg = isAxiosError<{ message?: string }>(err)
                    ? err.response?.data?.message || err.message
                    : "Không thể tải cấu hình hệ thống.";
                setError(msg);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const update = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) =>
        setForm((current) => ({ ...current, [key]: value }));

    const handleSave = async () => {
        if (!form.crmName.trim() || !form.companyName.trim()) {
            setError("Vui lòng nhập tên CRM và tên công ty / tổ chức.");
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");
        try {
            const updatedOrg = await organizationService.updateOrganization({
                name: form.companyName.trim(),
                industry: org?.industry ?? undefined,
                companySize: org?.companySize ?? undefined,
                logoUrl: org?.logoUrl ?? undefined,
                phone: org?.phone ?? undefined,
                email: org?.email ?? undefined,
                website: org?.website ?? undefined,
                address: org?.address ?? undefined,
                timezone: form.timezone,
                crmName: form.crmName.trim(),
                currency: form.currency,
                language: form.language,
                dateFormat: form.dateFormat,
            });
            setOrg(updatedOrg);
            const normalized: GeneralSettings = {
                crmName: updatedOrg.crmName?.trim() || form.crmName.trim(),
                companyName: updatedOrg.name?.trim() || form.companyName.trim(),
                currency: updatedOrg.currency === "USD" ? "USD" : "VND",
                timezone: updatedOrg.timezone?.trim() || form.timezone,
                language: updatedOrg.language === "en" ? "en" : "vi",
                dateFormat:
                    updatedOrg.dateFormat === "MM/dd/yyyy" || updatedOrg.dateFormat === "yyyy-MM-dd"
                        ? updatedOrg.dateFormat
                        : "dd/MM/yyyy",
            };
            setForm(normalized);
            saveGeneral(normalized);
            setMessage("Cập nhật cấu hình hệ thống thành công!");
        } catch (err) {
            const msg = isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message || err.message
                : err instanceof Error
                  ? err.message
                  : "Không thể lưu cấu hình hệ thống.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold tracking-tight text-(--crm-heading)">
                    Cấu hình hệ thống chung (Admin)
                </h2>
                <p className="mt-1 text-sm text-(--crm-text-secondary)">
                    Thiết lập định danh tổ chức, đơn vị tiền tệ mặc định và múi giờ vận hành của STAplus crm.
                </p>
            </div>

            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

            {/* Form */}
            <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-6 shadow-xs">
                <h3 className="flex items-center gap-2 text-base font-semibold text-(--crm-heading)">
                    <Settings size={18} className="text-(--crm-primary)" />
                    Thông tin tổ chức & Vận hành
                </h3>
                <p className="mt-1 text-xs text-(--crm-text-secondary)">
                    Các thông tin này sẽ được áp dụng cho toàn thể nhân viên trong hệ thống CRM.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <TextField
                        label="Tên hệ thống CRM"
                        value={form.crmName}
                        onChange={(e) => update("crmName", e.target.value)}
                        required
                        fullWidth
                    />

                    <TextField
                        label="Tên doanh nghiệp / Công ty"
                        value={form.companyName}
                        onChange={(e) => update("companyName", e.target.value)}
                        required
                        fullWidth
                    />

                    <TextField
                        select
                        label="Đơn vị tiền tệ chính"
                        value={form.currency}
                        onChange={(e) => update("currency", e.target.value as GeneralSettings["currency"])}
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: <Coins size={16} className="mr-2 text-(--crm-text-muted)" />,
                            },
                        }}
                    >
                        <MenuItem value="VND">VND — Việt Nam đồng (₫)</MenuItem>
                        <MenuItem value="USD">USD — Đô la Mỹ ($)</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Múi giờ hệ thống"
                        value={form.timezone}
                        onChange={(e) => update("timezone", e.target.value)}
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: <Globe size={16} className="mr-2 text-(--crm-text-muted)" />,
                            },
                        }}
                    >
                        <MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7 — Việt Nam)</MenuItem>
                        <MenuItem value="UTC">UTC (Giờ phối hợp quốc tế)</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Ngôn ngữ mặc định"
                        value={form.language}
                        onChange={(e) => update("language", e.target.value as GeneralSettings["language"])}
                        fullWidth
                    >
                        <MenuItem value="vi">Tiếng Việt (Mặc định)</MenuItem>
                        <MenuItem value="en">English (Tiếng Anh)</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Định dạng ngày mặc định"
                        value={form.dateFormat}
                        onChange={(e) => update("dateFormat", e.target.value as GeneralSettings["dateFormat"])}
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: <Calendar size={16} className="mr-2 text-(--crm-text-muted)" />,
                            },
                        }}
                    >
                        <MenuItem value="dd/MM/yyyy">DD/MM/YYYY</MenuItem>
                        <MenuItem value="MM/dd/yyyy">MM/DD/YYYY</MenuItem>
                        <MenuItem value="yyyy-MM-dd">YYYY-MM-DD</MenuItem>
                    </TextField>
                </div>

                <div className="mt-6 flex justify-end border-t border-(--crm-border-subtle) pt-5">
                    <Button
                        variant="contained"
                        disabled={saving || loading}
                        onClick={handleSave}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
                        sx={{ textTransform: "none", fontWeight: 600, px: 3, py: 1 }}
                    >
                        {saving ? "Đang lưu..." : "Lưu cài đặt chung"}
                    </Button>
                </div>
            </div>

            <Snackbar
                open={Boolean(message)}
                autoHideDuration={3000}
                onClose={() => setMessage("")}
                message={message}
            />
        </div>
    );
}
