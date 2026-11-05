import { Alert, CircularProgress, Dialog, DialogContent, DialogTitle, Tab, Tabs } from "@mui/material";
import { Check, Copy, Globe, Megaphone, MessageCircle, MessageSquare, Radio, Send, X } from "lucide-react";
import { useState } from "react";
import { leadService } from "../../services/leadService";

interface LeadChannelsModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

export default function LeadChannelsModal({ open, onClose, onSuccess }: LeadChannelsModalProps) {
    const [tabIndex, setTabIndex] = useState(0);
    const [copied, setCopied] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Simulator form state
    const [testName, setTestName] = useState("Nguyễn Văn An");
    const [testEmail, setTestEmail] = useState("an.nguyen@congtyabc.vn");
    const [testPhone, setTestPhone] = useState("0988776655");
    const [testCompany, setTestCompany] = useState("Tập đoàn ABC");
    const [testNotes, setTestNotes] = useState("Quan tâm gói CRM doanh nghiệp qua form website");

    const copyToClipboard = (text: string, id: string) => {
        void navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSimulateWebhook = async (channel: string, customPayload?: { fullName: string; email?: string; phone?: string; company?: string; notes?: string }) => {
        setSending(true);
        setError(null);
        try {
            const payload = customPayload || {
                fullName: testName,
                email: testEmail,
                phone: testPhone,
                company: testCompany,
                notes: testNotes,
            };
            await leadService.captureWebhookLead(channel, payload);
            onSuccess(`Đã thu thập thành công 1 Lead mới từ kênh ${channel.toUpperCase()}!`);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Gửi webhook thất bại");
        } finally {
            setSending(false);
        }
    };

    const websiteWebhookUrl = "http://localhost:8080/api/v1/leads/webhook/website";
    const facebookWebhookUrl = "http://localhost:8080/api/v1/leads/webhook/facebook";
    const zaloWebhookUrl = "http://localhost:8080/api/v1/leads/webhook/zalo";
    const googleWebhookUrl = "http://localhost:8080/api/v1/leads/webhook/google-ads";

    const websiteCodeSnippet = `<!-- Nhúng vào sự kiện Submit Form trên website -->
<script>
async function submitLeadToCRM(formData) {
  try {
    const response = await fetch('${websiteWebhookUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        notes: formData.message,
        source: 'WEBSITE'
      })
    });
    console.log('Lead đã được chuyển vào STAPlus CRM');
  } catch (err) {
    console.error('Lỗi gửi lead:', err);
  }
}
</script>`;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle className="flex items-center justify-between border-b border-(--crm-border) px-6 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--crm-info-soft) text-(--crm-primary)">
                        <Radio size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-(--crm-heading)">Thu thập Lead đa kênh (Webhooks & APIs)</h2>
                        <p className="text-xs text-(--crm-text-secondary)">Tự động kết nối và ghi nhận Lead từ Form Website, Facebook Lead Ads, Zalo OA và Google Ads</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 text-(--crm-text-muted) hover:bg-(--crm-surface-hover) hover:text-(--crm-text)"
                    aria-label="Đóng"
                >
                    <X size={18} />
                </button>
            </DialogTitle>

            <div className="border-b border-(--crm-border) bg-(--crm-surface-subtle) px-6">
                <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} variant="scrollable" scrollButtons="auto">
                    <Tab label="Form Website" icon={<Globe size={16} />} iconPosition="start" />
                    <Tab label="Facebook Lead Ads" icon={<MessageSquare size={16} />} iconPosition="start" />
                    <Tab label="Zalo OA" icon={<MessageCircle size={16} />} iconPosition="start" />
                    <Tab label="Google Ads" icon={<Megaphone size={16} />} iconPosition="start" />
                </Tabs>
            </div>

            <DialogContent className="space-y-4 px-6 py-5">
                {error && <Alert severity="error">{error}</Alert>}

                {tabIndex === 0 && (
                    <div className="space-y-5">
                        <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Kết nối Form Liên hệ & Landing Page</h3>
                            <p className="mt-1 text-xs text-blue-800 dark:text-blue-400">
                                Khi khách hàng điền form nhận báo giá, đăng ký tư vấn hoặc liên hệ trên website của bạn, dữ liệu sẽ được đẩy trực tiếp về STAPlus CRM mà không cần thao tác thủ công.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-(--crm-text-secondary) uppercase tracking-wider mb-1.5">
                                Webhook Endpoint URL (POST)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={websiteWebhookUrl}
                                    className="flex-1 rounded-lg border border-(--crm-border) bg-(--crm-surface-subtle) px-3 py-2 text-xs font-mono text-(--crm-heading) outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(websiteWebhookUrl, "web_url")}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-(--crm-border) bg-white px-3 py-2 text-xs font-semibold text-(--crm-text) hover:bg-(--crm-surface-hover) shadow-xs"
                                >
                                    {copied === "web_url" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    <span>{copied === "web_url" ? "Đã chép" : "Sao chép"}</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-(--crm-text-secondary) uppercase tracking-wider">
                                    Mã nhúng mẫu (HTML / JavaScript)
                                </label>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(websiteCodeSnippet, "web_code")}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-(--crm-primary) hover:underline"
                                >
                                    {copied === "web_code" ? <Check size={13} /> : <Copy size={13} />}
                                    <span>{copied === "web_code" ? "Đã sao chép mã" : "Sao chép mã"}</span>
                                </button>
                            </div>
                            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3.5 text-[11px] leading-relaxed text-slate-200 font-mono">
                                {websiteCodeSnippet}
                            </pre>
                        </div>

                        <div className="rounded-xl border border-(--crm-border) p-4 bg-(--crm-surface-subtle)">
                            <h4 className="text-sm font-semibold text-(--crm-heading) mb-2">Thử nghiệm gửi Lead từ Website ngay</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="text-xs text-(--crm-text-secondary) block mb-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={testName}
                                        onChange={(e) => setTestName(e.target.value)}
                                        className="w-full rounded-md border border-(--crm-border) bg-white px-2.5 py-1.5 text-xs text-(--crm-text) outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-(--crm-text-secondary) block mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        className="w-full rounded-md border border-(--crm-border) bg-white px-2.5 py-1.5 text-xs text-(--crm-text) outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-(--crm-text-secondary) block mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={testPhone}
                                        onChange={(e) => setTestPhone(e.target.value)}
                                        className="w-full rounded-md border border-(--crm-border) bg-white px-2.5 py-1.5 text-xs text-(--crm-text) outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-(--crm-text-secondary) block mb-1">Công ty</label>
                                    <input
                                        type="text"
                                        value={testCompany}
                                        onChange={(e) => setTestCompany(e.target.value)}
                                        className="w-full rounded-md border border-(--crm-border) bg-white px-2.5 py-1.5 text-xs text-(--crm-text) outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="text-xs text-(--crm-text-secondary) block mb-1">Tin nhắn / Nhu cầu</label>
                                <input
                                    type="text"
                                    value={testNotes}
                                    onChange={(e) => setTestNotes(e.target.value)}
                                    className="w-full rounded-md border border-(--crm-border) bg-white px-2.5 py-1.5 text-xs text-(--crm-text) outline-none"
                                />
                            </div>
                            <button
                                type="button"
                                disabled={sending}
                                onClick={() => void handleSimulateWebhook("website")}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-(--crm-primary) px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 shadow-xs"
                            >
                                {sending ? <CircularProgress size={14} color="inherit" /> : <Send size={14} />}
                                <span>{sending ? "Đang gửi..." : "Gửi Lead thử nghiệm từ Form Website"}</span>
                            </button>
                        </div>
                    </div>
                )}

                {tabIndex === 1 && (
                    <div className="space-y-5">
                        <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
                            <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Tích hợp Facebook Lead Ads (Meta Webhook)</h3>
                            <p className="mt-1 text-xs text-indigo-800 dark:text-indigo-400">
                                Tự động hứng dữ liệu khách hàng tiềm năng khi họ nhấn vào quảng cáo và điền biểu mẫu (Instant Form) trên Facebook & Instagram.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-(--crm-text-secondary) uppercase tracking-wider mb-1.5">
                                Callback URL (Cấu hình trên Meta App Dashboard)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={facebookWebhookUrl}
                                    className="flex-1 rounded-lg border border-(--crm-border) bg-(--crm-surface-subtle) px-3 py-2 text-xs font-mono text-(--crm-heading) outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(facebookWebhookUrl, "fb_url")}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-(--crm-border) bg-white px-3 py-2 text-xs font-semibold text-(--crm-text) hover:bg-(--crm-surface-hover) shadow-xs"
                                >
                                    {copied === "fb_url" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    <span>{copied === "fb_url" ? "Đã chép" : "Sao chép"}</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-(--crm-text-secondary) uppercase tracking-wider mb-1.5">
                                Verify Token
                            </label>
                            <input
                                readOnly
                                value="staplus_fb_leadgen_secret_2026"
                                className="w-full rounded-lg border border-(--crm-border) bg-(--crm-surface-subtle) px-3 py-2 text-xs font-mono text-(--crm-heading) outline-none"
                            />
                        </div>

                        <div className="rounded-xl border border-(--crm-border) p-4 bg-(--crm-surface-subtle)">
                            <h4 className="text-sm font-semibold text-(--crm-heading) mb-2">Thử nghiệm nhận Lead từ chiến dịch Facebook Ads</h4>
                            <p className="text-xs text-(--crm-text-secondary) mb-3">
                                Bấm nút bên dưới để mô phỏng một khách hàng vừa hoàn tất form đăng ký từ chiến dịch quảng cáo "Lead Ads T10/2026" trên Facebook.
                            </p>
                            <button
                                type="button"
                                disabled={sending}
                                onClick={() => void handleSimulateWebhook("facebook", {
                                    fullName: "Trần Bảo Trâm",
                                    email: "baotram_fb@meta-demo.com",
                                    phone: "0918822334",
                                    company: "Bảo Trâm Fashion",
                                    notes: "[Facebook Lead Ads] Chiến dịch: Mở rộng bán hàng qua MXH | Form ID: 88291039",
                                })}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-xs"
                            >
                                {sending ? <CircularProgress size={14} color="inherit" /> : <Send size={14} />}
                                <span>{sending ? "Đang gửi..." : "Mô phỏng Lead từ Facebook Ads"}</span>
                            </button>
                        </div>
                    </div>
                )}

                {tabIndex === 2 && (
                    <div className="space-y-5">
                        <div className="rounded-lg border border-cyan-200 bg-cyan-50/60 p-4 dark:border-cyan-900 dark:bg-cyan-950/20">
                            <h3 className="text-sm font-semibold text-cyan-900 dark:text-cyan-300">Tích hợp Zalo Official Account (Zalo OA)</h3>
                            <p className="mt-1 text-xs text-cyan-800 dark:text-cyan-400">
                                Tự động đồng bộ khách hàng quan tâm và để lại số điện thoại qua tin nhắn hoặc Zalo Form vào danh sách Lead.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-(--crm-text-secondary) uppercase tracking-wider mb-1.5">
                                Webhook URL (Cấu hình trên Zalo for Developers)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={zaloWebhookUrl}
                                    className="flex-1 rounded-lg border border-(--crm-border) bg-(--crm-surface-subtle) px-3 py-2 text-xs font-mono text-(--crm-heading) outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(zaloWebhookUrl, "zalo_url")}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-(--crm-border) bg-white px-3 py-2 text-xs font-semibold text-(--crm-text) hover:bg-(--crm-surface-hover) shadow-xs"
                                >
                                    {copied === "zalo_url" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    <span>{copied === "zalo_url" ? "Đã chép" : "Sao chép"}</span>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-(--crm-border) p-4 bg-(--crm-surface-subtle)">
                            <h4 className="text-sm font-semibold text-(--crm-heading) mb-2">Thử nghiệm nhận Lead từ Zalo OA</h4>
                            <p className="text-xs text-(--crm-text-secondary) mb-3">
                                Bấm nút bên dưới để mô phỏng một khách hàng gửi thông tin liên hệ qua trang Zalo OA của công ty.
                            </p>
                            <button
                                type="button"
                                disabled={sending}
                                onClick={() => void handleSimulateWebhook("zalo", {
                                    fullName: "Lê Hoàng Phúc",
                                    email: "phuc.le@zalo-corp.vn",
                                    phone: "0909988776",
                                    company: "Hoàng Phúc Solar",
                                    notes: "[Zalo OA] Khách hàng nhấn 'Quan tâm' và chia sẻ số điện thoại qua tin nhắn tự động",
                                })}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-800 disabled:opacity-50 shadow-xs"
                            >
                                {sending ? <CircularProgress size={14} color="inherit" /> : <Send size={14} />}
                                <span>{sending ? "Đang gửi..." : "Mô phỏng Lead từ Zalo OA"}</span>
                            </button>
                        </div>
                    </div>
                )}

                {tabIndex === 3 && (
                    <div className="space-y-5">
                        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Tích hợp Google Ads (Lead Form Extension)</h3>
                            <p className="mt-1 text-xs text-amber-800 dark:text-amber-400">
                                Thu thập thông tin khách hàng điền tiện ích biểu mẫu khách hàng tiềm năng trực tiếp từ mẫu quảng cáo Google Search Ads.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-(--crm-text-secondary) uppercase tracking-wider mb-1.5">
                                Google Webhook URL
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={googleWebhookUrl}
                                    className="flex-1 rounded-lg border border-(--crm-border) bg-(--crm-surface-subtle) px-3 py-2 text-xs font-mono text-(--crm-heading) outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(googleWebhookUrl, "google_url")}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-(--crm-border) bg-white px-3 py-2 text-xs font-semibold text-(--crm-text) hover:bg-(--crm-surface-hover) shadow-xs"
                                >
                                    {copied === "google_url" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    <span>{copied === "google_url" ? "Đã chép" : "Sao chép"}</span>
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-(--crm-border) p-4 bg-(--crm-surface-subtle)">
                            <h4 className="text-sm font-semibold text-(--crm-heading) mb-2">Thử nghiệm nhận Lead từ Google Ads</h4>
                            <p className="text-xs text-(--crm-text-secondary) mb-3">
                                Bấm nút bên dưới để mô phỏng người dùng tìm kiếm từ khóa và điền biểu mẫu Google Lead Form.
                            </p>
                            <button
                                type="button"
                                disabled={sending}
                                onClick={() => void handleSimulateWebhook("google-ads", {
                                    fullName: "Võ Minh Khang",
                                    email: "khang.vo@vietnamtech.io",
                                    phone: "0938112299",
                                    company: "Việt Nam Tech Hub",
                                    notes: "[Google Ads] Từ khóa: 'phần mềm quản trị crm b2b' | Tiện ích biểu mẫu mở rộng",
                                })}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 shadow-xs"
                            >
                                {sending ? <CircularProgress size={14} color="inherit" /> : <Send size={14} />}
                                <span>{sending ? "Đang gửi..." : "Mô phỏng Lead từ Google Ads"}</span>
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

