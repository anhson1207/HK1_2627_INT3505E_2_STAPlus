import { Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { CheckCircle2, Download, FileSpreadsheet, RefreshCw, Upload, X } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { leadService } from "../../services/leadService";
import type { LeadPayload, LeadSource } from "../../types/lead";
import LeadSourceBadge from "./LeadSourceBadge";

interface LeadImportModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (count: number) => void;
}

const TEMPLATE_CSV = `Ho,Ten,Email,So_dien_thoai,Cong_ty,Nguon,Ghi_chu
Nguyen,Minh Anh,minhanh@test.vn,0912345678,Minh Anh Corp,WEBSITE,Dang ky form bao gia tren website
Tran,Quoc Bao,quocbao@test.vn,0987654321,Bao An Tech,FACEBOOK,De lai SĐT qua Facebook Lead Ads
Le,Thu Ha,thuha@test.vn,0901234567,Ha Long Logistics,ZALO,Nhan tin qua Zalo Official Account
Pham,Hoang Nam,hoangnam@test.vn,0934567890,Nam Viet JSC,GOOGLE_ADS,Chien dich Google Search Ads
Vu,Ngoc Linh,ngoclinh@test.vn,0978901234,Linh Vu Media,PHONE,Goi dien tu van truc tiep`;

function parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function parseSource(raw?: string): LeadSource {
    if (!raw) return "OTHER";
    const upper = raw.trim().toUpperCase();
    if (upper.includes("WEB") || upper.includes("SITE")) return "WEBSITE";
    if (upper.includes("FB") || upper.includes("FACEBOOK")) return "FACEBOOK";
    if (upper.includes("ZALO")) return "ZALO";
    if (upper.includes("GOOGLE") || upper.includes("ADS")) return "GOOGLE_ADS";
    if (upper.includes("PHONE") || upper.includes("THOAI") || upper.includes("CALL")) return "PHONE";
    if (upper.includes("GIOI THIEU") || upper.includes("REFERRAL")) return "REFERRAL";
    if (upper.includes("SU KIEN") || upper.includes("EVENT")) return "EVENT";
    return "OTHER";
}

export default function LeadImportModal({ open, onClose, onSuccess }: LeadImportModalProps) {
    const [fileName, setFileName] = useState("");
    const [parsedLeads, setParsedLeads] = useState<LeadPayload[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        setFileName(file.name);

        try {
            const text = await file.text();
            const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
            if (lines.length < 2) {
                setError("File không có dữ liệu (cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu).");
                return;
            }

            const headerLine = lines[0];
            const delimiter = headerLine.includes(";") ? ";" : headerLine.includes("\t") ? "\t" : ",";
            const headers = parseCSVLine(headerLine, delimiter).map((h) =>
                h.toLowerCase().replace(/[^a-z0-9_]/g, "")
            );

            const leads: LeadPayload[] = [];
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i], delimiter);
                if (values.length === 0 || values.every((v) => !v)) continue;

                let firstName = "";
                let lastName = "";
                let email = "";
                let phone = "";
                let company = "";
                let sourceStr = "";

                headers.forEach((header, index) => {
                    const val = values[index] ?? "";
                    if (header.includes("ho") || header === "firstname") firstName = val;
                    else if (header.includes("ten") || header === "lastname") lastName = val;
                    else if (header.includes("mail")) email = val;
                    else if (header.includes("phone") || header.includes("thoai") || header.includes("sdt")) phone = val;
                    else if (header.includes("congty") || header.includes("company")) company = val;
                    else if (header.includes("nguon") || header.includes("source")) sourceStr = val;
                });

                if (!firstName && !lastName && values[0]) {
                    const parts = values[0].split(" ");
                    if (parts.length > 1) {
                        firstName = parts[0];
                        lastName = parts.slice(1).join(" ");
                    } else {
                        firstName = "Khách";
                        lastName = values[0];
                    }
                }

                if (!email && !phone) {
                    continue;
                }

                leads.push({
                    firstName: firstName || "Khách",
                    lastName: lastName || "hàng",
                    email: email || "",
                    phone: phone || "",
                    company: company || undefined,
                    source: parseSource(sourceStr),
                    status: "NEW",
                });
            }

            if (leads.length === 0) {
                setError("Không tìm thấy dòng hợp lệ. Vui lòng kiểm tra email hoặc số điện thoại.");
                return;
            }

            setParsedLeads(leads);
        } catch {
            setError("Lỗi đọc file. Vui lòng kiểm tra định dạng UTF-8 hoặc tải file mẫu.");
        }
    };

    const handleDownloadTemplate = () => {
        const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "template_import_leads.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async () => {
        if (parsedLeads.length === 0) return;
        setImporting(true);
        setError(null);

        try {
            const result = await leadService.importLeads(parsedLeads);
            onSuccess(result.imported);
            handleClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi nhập danh sách.");
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        if (importing) return;
        setFileName("");
        setParsedLeads([]);
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
                    },
                },
            }}
        >
            {/* Header */}
            <DialogTitle className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-2xs">
                        <FileSpreadsheet size={19} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Nhập khách hàng từ Excel / CSV</h2>
                        <p className="text-xs text-slate-500">Thêm nhanh hàng loạt khách hàng từ file danh sách</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    aria-label="Đóng"
                >
                    <X size={18} />
                </button>
            </DialogTitle>

            {/* Content */}
            <DialogContent className="space-y-4 px-6 py-5 bg-slate-50/60">
                {error && (
                    <Alert severity="error" onClose={() => setError(null)} className="rounded-xl">
                        {error}
                    </Alert>
                )}

                {/* 1. Download Template Card */}
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                    <div>
                        <p className="text-sm font-bold text-slate-800">Chưa có file mẫu chuẩn?</p>
                        <p className="text-xs text-slate-500 mt-0.5">Tải file mẫu có sẵn các cột chuẩn để nhập liệu dễ dàng</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition active:scale-98"
                    >
                        <Download size={14} className="text-emerald-600" />
                        <span>Tải file mẫu (.csv)</span>
                    </button>
                </div>

                {/* 2. File Upload Dropzone */}
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/20 transition cursor-pointer relative shadow-2xs">
                    <input
                        type="file"
                        id="lead-file-input"
                        accept=".csv,.txt,.tsv"
                        onChange={(e) => void handleFileChange(e)}
                        className="hidden"
                    />
                    <label htmlFor="lead-file-input" className="cursor-pointer flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-2.5 shadow-2xs">
                            <Upload size={22} />
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                            {fileName ? fileName : "Kéo thả file vào đây hoặc bấm để chọn"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Hỗ trợ định dạng .csv, .txt (mã hóa UTF-8)
                        </p>
                        {fileName && (
                            <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <RefreshCw size={12} /> Đổi file khác
                            </span>
                        )}
                    </label>
                </div>

                {/* 3. Preview Section */}
                {parsedLeads.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                <CheckCircle2 size={14} />
                                <span>Nhận diện {parsedLeads.length} khách hàng hợp lệ</span>
                            </div>
                            <span className="text-[11px] text-slate-400">Xem trước 5 dòng đầu tiên</span>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                                    <tr>
                                        <th className="px-3.5 py-2.5">Họ và tên</th>
                                        <th className="px-3.5 py-2.5">Số điện thoại</th>
                                        <th className="px-3.5 py-2.5">Email</th>
                                        <th className="px-3.5 py-2.5">Công ty</th>
                                        <th className="px-3.5 py-2.5">Nguồn</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {parsedLeads.slice(0, 5).map((lead, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                                            <td className="px-3.5 py-2.5 font-semibold text-slate-800">{lead.firstName} {lead.lastName}</td>
                                            <td className="px-3.5 py-2.5 text-slate-600 font-mono">{lead.phone || "—"}</td>
                                            <td className="px-3.5 py-2.5 text-slate-500">{lead.email || "—"}</td>
                                            <td className="px-3.5 py-2.5 text-slate-500">{lead.company || "—"}</td>
                                            <td className="px-3.5 py-2.5"><LeadSourceBadge source={lead.source} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </DialogContent>

            {/* Footer */}
            <DialogActions className="border-t border-slate-100 bg-white px-6 py-3.5 flex justify-end gap-2.5">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={importing}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={() => void handleImport()}
                    disabled={parsedLeads.length === 0 || importing}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-98 transition shadow-xs disabled:opacity-50"
                >
                    {importing ? <CircularProgress size={13} color="inherit" /> : <Upload size={14} />}
                    <span>{importing ? "Đang nhập dữ liệu..." : `Nhập ${parsedLeads.length} khách hàng`}</span>
                </button>
            </DialogActions>
        </Dialog>
    );
}