import React from "react";

interface ModalProps {
    open: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

export default function Modal({
    open,
    title,
    children,
    onClose,
}: ModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="crm-modal-overlay">
            <div className="crm-modal">
                <div className="crm-modal__header">
                    <h2 className="text-base font-semibold text-(--crm-heading)">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng hộp thoại"
                        className="crm-icon-btn"
                    >
                        ×
                    </button>
                </div>

                <div className="crm-modal__body">
                    {children}
                </div>
            </div>
        </div>
    );
}
