import { Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { CheckCircle2, Download, FileSpreadsheet, Upload, X } from "lucide-react";
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
                setError("File CSV không có dữ liệu (cần ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu).");
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
                    continue; // Skip invalid row without contact info
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
                setError("Không tìm thấy dòng dữ liệu hợp lệ trong file. Vui lòng kiểm tra định dạng email hoặc số điện thoại.");
                return;
            }

            setParsedLeads(leads);
        } catch {
            setError("Lỗi khi đọc file. Vui lòng kiểm tra định dạng UTF-8 hoặc tải file mẫu.");
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
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra khi import danh sách Lead.");
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
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle className="flex items-center justify-between border-b border-(--crm-border) px-6 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--crm-info-soft) text-(--crm-primary)">
                        <FileSpreadsheet size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-(--crm-heading)">Import Lead từ Excel / CSV</h2>
                        <p className="text-xs text-(--crm-text-secondary)">Thu thập hàng loạt Lead từ file danh sách khách hàng</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg p-1 text-(--crm-text-muted) hover:bg-(--crm-surface-hover) hover:text-(--crm-text)"
                    aria-label="Đóng"
                >
                    <X size={18} />
                </button>
            </DialogTitle>

            <DialogContent className="space-y-4 px-6 py-5">
                {error && <Alert severity="error">{error}</Alert>}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-(--crm-border-subtle) bg-(--crm-surface-subtle) p-4">
                    <div>
                        <p className="text-sm font-medium text-(--crm-heading)">Chưa có file mẫu chuẩn?</p>
                        <p className="text-xs text-(--crm-text-secondary)">Tải file mẫu CSV có sẵn các cột Họ, Tên, Email, SĐT, Công ty, Nguồn.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-(--crm-border) bg-white px-3 py-1.5 text-xs font-semibold text-(--crm-text) hover:bg-(--crm-surface-hover) shadow-xs"
                    >
                        <Download size={14} /> Tải file mẫu CSV
                    </button>
                </div>

                <div className="rounded-xl border-2 border-dashed border-(--crm-border) p-6 text-center hover:border-(--crm-primary) transition bg-white">
                    <input
                        type="file"
                        id="lead-file-input"
                        accept=".csv,.txt,.tsv"
                        onChange={(e) => void handleFileChange(e)}
                        className="hidden"
                    />
                    <label htmlFor="lead-file-input" className="cursor-pointer flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--crm-surface-hover) text-(--crm-primary) mb-3">
                            <Upload size={24} />
                        </div>
                        <p className="text-sm font-semibold text-(--crm-heading)">
                            {fileName ? fileName : "Nhấn để chọn file CSV hoặc kéo thả vào đây"}
                        </p>
                        <p className="mt-1 text-xs text-(--crm-text-muted)">
                            Hỗ trợ định dạng .csv, .txt (mã hóa UTF-8)
                        </p>
                    </label>
                </div>

                {parsedLeads.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                <CheckCircle2 size={15} />
                                <span>Đã phân tích {parsedLeads.length} Lead hợp lệ</span>
                            </div>
                            <span className="text-xs text-(--crm-text-muted)">Xem trước 5 bản ghi đầu tiên</span>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-(--crm-border)">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-(--crm-surface-subtle) border-b border-(--crm-border) text-(--crm-text-secondary) font-semibold">
                                    <tr>
                                        <th className="px-3 py-2">Họ & Tên</th>
                                        <th className="px-3 py-2">Email</th>
                                        <th className="px-3 py-2">Số điện thoại</th>
                                        <th className="px-3 py-2">Công ty</th>
                                        <th className="px-3 py-2">Nguồn</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--crm-border-subtle)">
                                    {parsedLeads.slice(0, 5).map((lead, idx) => (
                                        <tr key={idx} className="hover:bg-(--crm-surface-hover)">
                                            <td className="px-3 py-2 font-medium text-(--crm-heading)">{lead.firstName} {lead.lastName}</td>
                                            <td className="px-3 py-2 text-(--crm-text-secondary)">{lead.email || "—"}</td>
                                            <td className="px-3 py-2 text-(--crm-text-secondary)">{lead.phone || "—"}</td>
                                            <td className="px-3 py-2 text-(--crm-text-secondary)">{lead.company || "—"}</td>
                                            <td className="px-3 py-2"><LeadSourceBadge source={lead.source} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </DialogContent>

            <DialogActions className="border-t border-(--crm-border) px-6 py-3">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={importing}
                    className="rounded-lg border border-(--crm-border) px-4 py-2 text-xs font-semibold text-(--crm-text) hover:bg-(--crm-surface-hover) disabled:opacity-50"
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={() => void handleImport()}
                    disabled={parsedLeads.length === 0 || importing}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-(--crm-primary) px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 shadow-xs"
                >
                    {importing ? <CircularProgress size={14} color="inherit" /> : <Upload size={14} />}
                    <span>{importing ? "Đang import..." : `Tiến hành Import (${parsedLeads.length} Lead)`}</span>
                </button>
            </DialogActions>
        </Dialog>
    );
}

