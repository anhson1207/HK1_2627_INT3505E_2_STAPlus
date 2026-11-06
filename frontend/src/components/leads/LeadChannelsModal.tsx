import { Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Check, ChevronDown, ChevronUp, Copy, Globe, Megaphone, MessageCircle, MessageSquare, Radio, Send, X } from "lucide-react";
import { useState } from "react";
import { leadService } from "../../services/leadService";

interface LeadChannelsModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

const CHANNELS = [
    {
        id: "website",
        name: "Website",
        icon: Globe,
        color: "text-blue-600",
        bg: "bg-blue-50 text-blue-600 border-blue-200",
        activeBorder: "border-blue-600",
        tag: "Form liên hệ",
        desc: "Nhận khách tự động khi điền form đăng ký trên Website hoặc Landing page.",
        url: "http://localhost:8080/api/v1/leads/webhook/website",
        sampleLead: {
            fullName: "Nguyễn Văn An",
            email: "an.nguyen@congtyabc.vn",
            phone: "0988776655",
            company: "Tập đoàn ABC",
            notes: "Đăng ký tư vấn giải pháp qua form website",
        },
    },
    {
        id: "facebook",
        name: "Facebook Ads",
        icon: MessageSquare,
        color: "text-indigo-600",
        bg: "bg-indigo-50 text-indigo-600 border-indigo-200",
        activeBorder: "border-indigo-600",
        tag: "Lead Ads",
        desc: "Tự động nhận khách ngay khi điền biểu mẫu (Instant Form) trên Facebook & Instagram.",
        url: "http://localhost:8080/api/v1/leads/webhook/facebook",
        verifyToken: "staplus_fb_leadgen_secret_2026",
        sampleLead: {
            fullName: "Trần Bảo Trâm",
            email: "baotram@fashion.vn",
            phone: "0918822334",
            company: "Bảo Trâm Studio",
            notes: "Khách hàng điền form chiến dịch Facebook Ads T11/2026",
        },
    },
    {
        id: "zalo",
        name: "Zalo OA",
        icon: MessageCircle,
        color: "text-cyan-600",
        bg: "bg-cyan-50 text-cyan-600 border-cyan-200",
        activeBorder: "border-cyan-600",
        tag: "Zalo OA",
        desc: "Tự động lưu khách hàng khi quan tâm hoặc gửi số điện thoại qua Zalo Official Account.",
        url: "http://localhost:8080/api/v1/leads/webhook/zalo",
        sampleLead: {
            fullName: "Lê Hoàng Phúc",
            email: "phuc.le@solar.vn",
            phone: "0909988776",
            company: "Hoàng Phúc Solar",
            notes: "Khách quan tâm và chia sẻ SĐT qua tin nhắn Zalo OA",
        },
    },
    {
        id: "google-ads",
        name: "Google Ads",
        icon: Megaphone,
        color: "text-amber-600",
        bg: "bg-amber-50 text-amber-600 border-amber-200",
        activeBorder: "border-amber-600",
        tag: "Search Ads",
        desc: "Nhận khách điền tiện ích biểu mẫu (Lead Form) trực tiếp từ kết quả tìm kiếm Google.",
        url: "http://localhost:8080/api/v1/leads/webhook/google-ads",
        sampleLead: {
            fullName: "Võ Minh Khang",
            email: "khang.vo@vietnamtech.io",
            phone: "0938112299",
            company: "Việt Nam Tech Hub",
            notes: "Tìm kiếm từ khóa 'phần mềm crm b2b' trên Google Search",
        },
    },
];

export default function LeadChannelsModal({ open, onClose, onSuccess }: LeadChannelsModalProps) {
    const [selectedChannelId, setSelectedChannelId] = useState("website");
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSnippet, setShowSnippet] = useState(false);

    const activeChannel = CHANNELS.find((c) => c.id === selectedChannelId) || CHANNELS[0];

    const copyToClipboard = (text: string, key: string) => {
        void navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleSimulate = async () => {
        setSending(true);
        setError(null);
        try {
            await leadService.captureWebhookLead(activeChannel.id, activeChannel.sampleLead);
            onSuccess(`Đã nhận thành công 1 khách mới từ kênh ${activeChannel.name}!`);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Gửi thử nghiệm thất bại");
        } finally {
            setSending(false);
        }
    };

    const snippetCode = `fetch('${activeChannel.url}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@test.vn',
    phone: '0988776655',
    company: 'Công ty ABC'
  })
});`;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-2xs">
                        <Radio size={19} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Kênh thu thập khách hàng</h2>
                        <p className="text-xs text-slate-500">Tự động kết nối và nhận khách từ Website & Mạng xã hội</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
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

                {/* 1. Channel Selector Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CHANNELS.map((ch) => {
                        const Icon = ch.icon;
                        const isSelected = ch.id === selectedChannelId;
                        return (
                            <button
                                key={ch.id}
                                type="button"
                                onClick={() => {
                                    setSelectedChannelId(ch.id);
                                    setShowSnippet(false);
                                }}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition text-center select-none ${
                                    isSelected
                                        ? "bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                                }`}
                            >
                                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                                    isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                                }`}>
                                    <Icon size={16} />
                                </div>
                                <span className={`text-xs font-bold leading-tight ${isSelected ? "text-slate-900" : "text-slate-600"}`}>
                                    {ch.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 2. Channel Details Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{activeChannel.name}</span>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${activeChannel.bg}`}>
                                {activeChannel.tag}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                        {activeChannel.desc}
                    </p>

                    {/* Webhook URL Field */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Đường dẫn kết nối (Webhook URL)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                readOnly
                                value={activeChannel.url}
                                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none select-all"
                            />
                            <button
                                type="button"
                                onClick={() => copyToClipboard(activeChannel.url, "url")}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition active:scale-98"
                            >
                                {copiedKey === "url" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                <span>{copiedKey === "url" ? "Đã chép" : "Sao chép"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Optional Token for Facebook */}
                    {activeChannel.verifyToken && (
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Verify Token
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={activeChannel.verifyToken}
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(activeChannel.verifyToken!, "token")}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition active:scale-98"
                                >
                                    {copiedKey === "token" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    <span>{copiedKey === "token" ? "Đã chép" : "Sao chép"}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Code snippet collapse (Clean & compact) */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={() => setShowSnippet(!showSnippet)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                        >
                            <span>{showSnippet ? "Thu gọn mẫu code" : "Xem code mẫu nhúng Webhook"}</span>
                            {showSnippet ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showSnippet && (
                            <div className="mt-2 relative">
                                <pre className="rounded-xl bg-slate-800 p-3 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                                    {snippetCode}
                                </pre>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(snippetCode, "snippet")}
                                    className="absolute top-2 right-2 rounded-lg bg-slate-700/80 px-2 py-1 text-[11px] font-semibold text-white hover:bg-slate-700 transition flex items-center gap-1"
                                >
                                    {copiedKey === "snippet" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    <span>{copiedKey === "snippet" ? "Đã chép" : "Chép code"}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Fast Test Simulation Banner */}
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                            <Send size={15} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-950">
                                Thử nghiệm kênh {activeChannel.name}
                            </p>
                            <p className="text-[11px] text-blue-700">
                                Gửi 1 khách hàng mẫu ({activeChannel.sampleLead.fullName}) vào CRM
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        disabled={sending}
                        onClick={() => void handleSimulate()}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-98 transition shadow-xs disabled:opacity-50"
                    >
                        {sending ? <CircularProgress size={13} color="inherit" /> : <Send size={13} />}
                        <span>{sending ? "Đang gửi..." : "Gửi thử ngay"}</span>
                    </button>
                </div>
            </DialogContent>

            {/* Footer */}
            <DialogActions className="border-t border-slate-100 bg-white px-6 py-3.5 flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                    Đóng
                </button>
            </DialogActions>
        </Dialog>
    );
}