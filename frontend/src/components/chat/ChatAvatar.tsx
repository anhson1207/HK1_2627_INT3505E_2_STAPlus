import React from "react";
import { Users } from "lucide-react";
import { getAvatarColor, getInitials } from "../../utils/chatUtils";

interface ChatAvatarProps {
    name?: string | null;
    avatarUrl?: string | null;
    isGroup?: boolean;
    isOnline?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
};

const dotSizeClasses = {
    sm: "w-2.5 h-2.5 right-0 bottom-0 ring-1",
    md: "w-3 h-3 right-0 bottom-0 ring-2",
    lg: "w-3.5 h-3.5 right-0.5 bottom-0.5 ring-2",
    xl: "w-4 h-4 right-1 bottom-1 ring-2",
};

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
    name,
    avatarUrl,
    isGroup = false,
    isOnline = false,
    size = "md",
    className = "",
}) => {
    const sClass = sizeClasses[size];
    const dotClass = dotSizeClasses[size];
    const colorClass = isGroup ? "bg-cyan-700 text-white" : getAvatarColor(name || "");

    return (
        <div className={`relative inline-flex shrink-0 items-center justify-center rounded-full select-none ${sClass} ${className}`}>
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name || "Avatar"}
                    className="w-full h-full object-cover rounded-full"
                />
            ) : isGroup ? (
                <div className={`w-full h-full rounded-full flex items-center justify-center font-semibold shadow-xs ${colorClass}`}>
                    <Users size={size === "sm" ? 14 : size === "md" ? 18 : 22} />
                </div>
            ) : (
                <div className={`w-full h-full rounded-full flex items-center justify-center font-semibold tracking-wider shadow-xs ${colorClass}`}>
                    {getInitials(name)}
                </div>
            )}

            {/* Online Indicator */}
            {isOnline && !isGroup && (
                <span
                    title="Đang hoạt động (Online)"
                    className={`absolute rounded-full bg-(--crm-green) ring-white ${dotClass}`}
                />
            )}
        </div>
    );
};

