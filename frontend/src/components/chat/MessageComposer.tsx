import React, { useState, useRef, useEffect, useCallback } from "react";
import { SendHorizontal, Smile, Paperclip, X, FileText, Loader2 } from "lucide-react";
import { chatService } from "../../services/chatService";
import { formatFileSize, getFileIconType } from "../../utils/chatUtils";
import type { MessageType } from "../../types/chat";

interface MessageComposerProps {
    conversationId: number;
    initialDraft?: string;
    onSendMessage: (
        content: string,
        attachment?: { url: string; name: string; size: number; type: MessageType }
    ) => Promise<void>;
    onDraftChange: (draft: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "👏", "🚀", "👀", "🙏", "✅", "💯"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "pdf", "docx", "xlsx", "txt"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const MessageComposer: React.FC<MessageComposerProps> = ({
    conversationId,
    initialDraft = "",
    onSendMessage,
    onDraftChange,
    disabled = false,
    placeholder = "Nhập tin nhắn... (Enter để gửi, Shift + Enter để xuống dòng)",
}) => {
    const [content, setContent] = useState(initialDraft);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Đồng bộ nội dung khi chuyển đổi giữa các cuộc trò chuyện
    useEffect(() => {
        setContent(initialDraft);
        setShowEmojiPicker(false);
        setSelectedFile(null);
        setUploadProgress(null);
        setPreviewUrl(null);
        setFileError(null);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    }, [conversationId]); // Chỉ reset khi chuyển sang cuộc trò chuyện khác

    // Tạo preview URL cho hình ảnh được chọn
    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }
        const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";
        if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [selectedFile]);

    // Tự động điều chỉnh chiều cao textarea theo nội dung
    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, 140);
        textarea.style.height = `${newHeight}px`;
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setContent(val);
        onDraftChange(val);
        adjustHeight();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra dung lượng
        if (file.size > MAX_FILE_SIZE) {
            setFileError("Kích thước tệp vượt quá 10MB.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        // Kiểm tra đuôi tệp
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setFileError(`Định dạng .${ext} không được hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP, PDF, DOCX, XLSX, TXT.`);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setSelectedFile(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadProgress(null);
        setPreviewUrl(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async () => {
        const trimmed = content.trim();
        if ((!trimmed && !selectedFile) || isSending || disabled) return;

        setIsSending(true);
        setFileError(null);

        try {
            let attachmentData: { url: string; name: string; size: number; type: MessageType } | undefined = undefined;

            if (selectedFile) {
                setUploadProgress(0);
                const uploaded = await chatService.uploadFile(conversationId, selectedFile, (percent) => {
                    setUploadProgress(percent);
                });
                attachmentData = {
                    url: uploaded.fileUrl,
                    name: uploaded.originalFilename,
                    size: uploaded.fileSize,
                    type: uploaded.messageType,
                };
            }

            await onSendMessage(trimmed, attachmentData);

            setContent("");
            setSelectedFile(null);
            setUploadProgress(null);
            setPreviewUrl(null);
            onDraftChange("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.focus();
            }
        } catch (err: unknown) {
            console.error("Gửi tin nhắn hoặc upload tệp thất bại:", err);
            const msg = err instanceof Error ? err.message : "Gửi thất bại";
            setFileError(msg);
        } finally {
            setIsSending(false);
            setUploadProgress(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAddEmoji = (emoji: string) => {
        const next = content + emoji;
        setContent(next);
        onDraftChange(next);
        setShowEmojiPicker(false);
        textareaRef.current?.focus();
        setTimeout(adjustHeight, 0);
    };

    // Đóng emoji picker khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker]);

    const canSend = (content.trim().length > 0 || selectedFile !== null) && !isSending && !disabled;

    return (
        <div className="relative border-t border-(--crm-border) bg-white p-3 sm:px-4 sm:py-3.5 shadow-xs">
            {/* Quick Emoji Picker Menu */}
            {showEmojiPicker && (
                <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full left-4 mb-2 p-2 rounded-xl bg-white border border-(--crm-border) shadow-lg z-20 flex flex-wrap gap-1.5 max-w-72 select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                    {COMMON_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => handleAddEmoji(emoji)}
                            className="w-8 h-8 rounded-lg hover:bg-(--crm-surface-hover) flex items-center justify-center text-lg transition-transform active:scale-95"
                            title={emoji}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Error banner nếu có */}
            {fileError && (
                <div className="mb-2 px-3 py-1.5 rounded-lg bg-(--crm-danger-soft) text-(--crm-danger) text-xs flex items-center justify-between">
                    <span>{fileError}</span>
                    <button type="button" onClick={() => setFileError(null)} className="hover:opacity-75">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Preview tệp đính kèm chuẩn bị gửi */}
            {selectedFile && (
                <div className="mb-2 p-2 rounded-xl bg-(--crm-surface-subtle) border border-(--crm-border) flex items-center gap-3 relative max-w-sm">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={selectedFile.name}
                            className="w-12 h-12 rounded-lg object-cover border border-(--crm-border)"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-(--crm-info-soft) text-(--crm-primary) flex items-center justify-center shrink-0">
                            {getFileIconType(selectedFile.name) === "pdf" ? (
                                <FileText size={22} className="text-red-500" />
                            ) : getFileIconType(selectedFile.name) === "excel" ? (
                                <FileText size={22} className="text-emerald-600" />
                            ) : (
                                <FileText size={22} />
                            )}
                        </div>
                    )}

                    <div className="flex-1 min-w-0 pr-6">
                        <p className="text-xs font-medium text-(--crm-heading) truncate">{selectedFile.name}</p>
                        <p className="text-[11px] text-(--crm-text-muted)">{formatFileSize(selectedFile.size)}</p>
                        {uploadProgress !== null && (
                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div
                                    className="bg-(--crm-primary) h-full transition-all duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={isSending}
                        className="absolute top-1.5 right-1.5 p-1 rounded-md text-(--crm-text-muted) hover:text-(--crm-danger) hover:bg-white transition-colors"
                        title="Hủy tệp"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}

            <div className="flex items-end gap-1.5 sm:gap-2 rounded-xl border border-(--crm-border) bg-white p-1.5 focus-within:border-(--crm-primary) focus-within:ring-2 focus-within:ring-(--crm-primary)/20 transition-all">
                {/* Nút Đính kèm tệp */}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx,.txt"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isSending}
                    className="p-2 rounded-lg text-(--crm-text-muted) hover:text-(--crm-text) hover:bg-(--crm-surface-hover) transition-colors cursor-pointer"
                    title="Đính kèm ảnh hoặc tài liệu (tối đa 10MB)"
                >
                    <Paperclip size={19} />
                </button>

                {/* Nút Emoji */}
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    disabled={disabled || isSending}
                    className={`p-2 rounded-lg transition-colors ${
                        showEmojiPicker
                            ? "bg-(--crm-info-soft) text-(--crm-primary)"
                            : "text-(--crm-text-muted) hover:text-(--crm-text) hover:bg-(--crm-surface-hover)"
                    }`}
                    title="Chèn biểu tượng cảm xúc"
                >
                    <Smile size={19} />
                </button>

                {/* Textarea nhập tin nhắn */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled || isSending}
                    placeholder={disabled ? "Bạn không còn trong nhóm này" : placeholder}
                    rows={1}
                    className="flex-1 max-h-36 resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-(--crm-heading) placeholder:text-(--crm-text-muted) focus:outline-none focus:ring-0 leading-relaxed"
                />

                {/* Nút gửi tin nhắn */}
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className={`p-2.5 rounded-lg font-medium transition-all flex items-center justify-center shrink-0 ${
                        canSend
                            ? "bg-(--crm-primary) text-white hover:bg-(--crm-primary-hover) shadow-xs active:scale-95 cursor-pointer"
                            : "bg-(--crm-surface-hover) text-(--crm-text-disabled) cursor-not-allowed opacity-70"
                    }`}
                    title="Gửi tin nhắn (Enter)"
                >
                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
                </button>
            </div>
        </div>
    );
};

