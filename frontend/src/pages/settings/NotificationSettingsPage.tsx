import { Button, FormControlLabel, MenuItem, Snackbar, Switch, TextField } from "@mui/material";
import { useState } from "react";

import { useSettingsStore, type NotificationPreferences } from "../../stores/settingsStore";

const toggles: Array<{ key: Exclude<keyof NotificationPreferences, "reminderBefore">; label: string; description: string }> = [
    { key: "followUp", label: "Nhắc follow-up", description: "Thông báo khi lịch chăm sóc sắp đến hạn" },
    { key: "deal", label: "Cập nhật Deal", description: "Theo dõi thay đổi của cơ hội kinh doanh" },
    { key: "ticket", label: "Cập nhật Ticket", description: "Theo dõi yêu cầu hỗ trợ" },
    { key: "system", label: "Thông báo hệ thống", description: "Các thông tin vận hành chung" },
    { key: "email", label: "Thông báo qua email", description: "Tùy chọn giao diện mock, chưa gửi email thật" },
];

export default function NotificationSettingsPage() {
    const saved = useSettingsStore((state) => state.notifications);
    const saveNotifications = useSettingsStore((state) => state.saveNotifications);
    const [form, setForm] = useState<NotificationPreferences>(saved);
    const [message, setMessage] = useState("");
    return <div className="crm-card crm-card__body"><div className="mb-5"><h2 className="text-lg font-semibold text-(--crm-heading)">Tùy chọn thông báo</h2><p className="crm-page-description">Chọn loại cập nhật bạn muốn nhận trong CRM</p></div><div className="divide-y divide-(--crm-border-subtle)">{toggles.map(({ key, label, description }) => <div key={key} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium text-(--crm-heading)">{label}</p><p className="mt-1 text-xs text-(--crm-text-secondary)">{description}</p></div><FormControlLabel label="" control={<Switch checked={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))} />} className="!mr-0" /></div>)}</div><div className="mt-5 max-w-xs"><TextField select label="Nhắc trước thời hạn" value={form.reminderBefore} onChange={(event) => setForm((current) => ({ ...current, reminderBefore: event.target.value as NotificationPreferences["reminderBefore"] }))} fullWidth><MenuItem value="15m">15 phút</MenuItem><MenuItem value="30m">30 phút</MenuItem><MenuItem value="1h">1 giờ</MenuItem><MenuItem value="1d">1 ngày</MenuItem></TextField></div><div className="mt-6 flex justify-end border-t border-(--crm-border) pt-5"><Button variant="contained" onClick={() => { saveNotifications(form); setMessage("Cập nhật thành công"); }}>Lưu tùy chọn</Button></div><Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} /></div>;
}
