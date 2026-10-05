import { Button, MenuItem, Snackbar, TextField } from "@mui/material";
import { useState } from "react";

import { useSettingsStore, type GeneralSettings } from "../../stores/settingsStore";

export default function GeneralSettingsPage() {
    const saved = useSettingsStore((state) => state.general);
    const saveGeneral = useSettingsStore((state) => state.saveGeneral);
    const [form, setForm] = useState<GeneralSettings>(saved);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const update = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => setForm((current) => ({ ...current, [key]: value }));
    const save = () => {
        if (!form.crmName.trim() || !form.companyName.trim()) { setError("Vui lòng nhập tên CRM và công ty."); return; }
        saveGeneral({ ...form, crmName: form.crmName.trim(), companyName: form.companyName.trim() });
        setError(""); setMessage("Cập nhật thành công");
    };
    return <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="mb-6"><h2 className="text-lg font-semibold text-slate-900">Cài đặt chung</h2><p className="mt-1 text-sm text-slate-500">Thông tin và định dạng mặc định của CRM</p></div><div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TextField label="Tên CRM" value={form.crmName} onChange={(event) => update("crmName", event.target.value)} required fullWidth />
        <TextField label="Tên công ty" value={form.companyName} onChange={(event) => update("companyName", event.target.value)} required fullWidth />
        <TextField select label="Đơn vị tiền tệ" value={form.currency} onChange={(event) => update("currency", event.target.value as GeneralSettings["currency"])} fullWidth><MenuItem value="VND">VND — Việt Nam đồng</MenuItem><MenuItem value="USD">USD — US Dollar</MenuItem></TextField>
        <TextField select label="Múi giờ" value={form.timezone} onChange={(event) => update("timezone", event.target.value)} fullWidth><MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</MenuItem><MenuItem value="UTC">UTC</MenuItem></TextField>
        <TextField select label="Ngôn ngữ mặc định" value={form.language} onChange={(event) => update("language", event.target.value as GeneralSettings["language"])} fullWidth><MenuItem value="vi">Tiếng Việt</MenuItem><MenuItem value="en">English</MenuItem></TextField>
        <TextField select label="Định dạng ngày" value={form.dateFormat} onChange={(event) => update("dateFormat", event.target.value as GeneralSettings["dateFormat"])} fullWidth><MenuItem value="dd/MM/yyyy">DD/MM/YYYY</MenuItem><MenuItem value="MM/dd/yyyy">MM/DD/YYYY</MenuItem><MenuItem value="yyyy-MM-dd">YYYY-MM-DD</MenuItem></TextField>
    </div>{error && <p className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-6 flex justify-end border-t border-slate-200 pt-5"><Button variant="contained" onClick={save}>Lưu cài đặt</Button></div><Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} /></div>;
}
