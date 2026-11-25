import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    Briefcase,
    Clock,
    Coffee,
    Flag,
    Hand,
    Heart,
    PawPrint,
    Search,
    Smile,
    X,
} from "lucide-react";

import {
    EMOJI_CATEGORIES,
    getRecentEmojis,
    recordRecentEmoji,
    type EmojiCategoryId,
    type EmojiItem,
} from "../../data/messengerEmojis";

interface EmojiPickerPopoverProps {
    onSelectEmoji: (emoji: string) => void;
    onClose: () => void;
}

const CATEGORY_TABS: Array<{
    id: EmojiCategoryId;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
}> = [
    { id: "recent", label: "Gần đây", icon: Clock },
    { id: "smileys", label: "Mặt cười & cảm xúc", icon: Smile },
    { id: "gestures", label: "Cử chỉ & con người", icon: Hand },
    { id: "hearts", label: "Trái tim & biểu tượng", icon: Heart },
    { id: "nature", label: "Động vật & thiên nhiên", icon: PawPrint },
    { id: "food", label: "Đồ ăn & thức uống", icon: Coffee },
    { id: "work", label: "Công việc & vật dụng", icon: Briefcase },
    { id: "flags", label: "Cờ & ký hiệu", icon: Flag },
];

export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({
    onSelectEmoji,
    onClose,
}) => {
    const [recentEmojis, setRecentEmojis] = useState<EmojiItem[]>(() => getRecentEmojis());
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<EmojiCategoryId>(() =>
        recentEmojis.length > 0 ? "recent" : "smileys"
    );
    const [hoveredEmoji, setHoveredEmoji] = useState<EmojiItem | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Partial<Record<EmojiCategoryId, HTMLDivElement | null>>>({});

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const visibleTabs = useMemo(
        () =>
            CATEGORY_TABS.filter(
                (tab) => tab.id !== "recent" || recentEmojis.length > 0
            ),
        [recentEmojis.length]
    );

    const searchResults = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return null;
        const matched: EmojiItem[] = [];
        const seen = new Set<string>();
        for (const category of EMOJI_CATEGORIES) {
            for (const item of category.emojis) {
                if (item.keywords.includes(q) && !seen.has(item.char)) {
                    seen.add(item.char);
                    matched.push(item);
                }
            }
        }
        return matched;
    }, [searchQuery]);

    const handlePick = (item: EmojiItem) => {
        onSelectEmoji(item.char);
        setRecentEmojis(recordRecentEmoji(item.char));
    };

    const defaultCategory = recentEmojis.length > 0 ? "recent" : "smileys";

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (!value.trim()) {
            setActiveCategory(defaultCategory);
        }
    };

    const handleJumpToCategory = (categoryId: EmojiCategoryId) => {
        setSearchQuery("");
        setActiveCategory(categoryId);
        const sectionEl = sectionRefs.current[categoryId];
        if (sectionEl && listContainerRef.current) {
            listContainerRef.current.scrollTop = Math.max(0, sectionEl.offsetTop - 8);
        }
    };

    const handleScroll = () => {
        if (searchQuery.trim() || !listContainerRef.current) return;
        const container = listContainerRef.current;
        const scrollTop = container.scrollTop + 28;
        let currentId: EmojiCategoryId = defaultCategory;
        for (const tab of visibleTabs) {
            const el = sectionRefs.current[tab.id];
            if (el && el.offsetTop <= scrollTop) {
                currentId = tab.id;
            }
        }
        setActiveCategory(currentId);
    };

    const renderEmojiGrid = (items: EmojiItem[], keyPrefix: string) => (
        <div className="grid grid-cols-8 gap-0.5">
            {items.map((item, idx) => (
                <button
                    key={`${keyPrefix}-${item.char}-${idx}`}
                    type="button"
                    onClick={() => handlePick(item)}
                    onMouseEnter={() => setHoveredEmoji(item)}
                    onFocus={() => setHoveredEmoji(item)}
                    className="flex h-9 w-full items-center justify-center rounded-lg text-[21px] leading-none transition-transform hover:scale-115 hover:bg-(--crm-surface-hover) active:scale-95 focus:outline-none focus:ring-2 focus:ring-(--crm-primary)/35 cursor-pointer"
                    aria-label={item.name}
                    title={item.name}
                >
                    {item.char}
                </button>
            ))}
        </div>
    );

    return (
        <div
            role="dialog"
            aria-label="Chọn biểu tượng cảm xúc"
            className="w-[344px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-(--crm-border) bg-(--crm-surface) shadow-[0_14px_38px_-10px_rgba(15,23,42,0.28)] select-none animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
            {/* Search input */}
            <div className="border-b border-(--crm-border-subtle) p-2.5">
                <div className="flex items-center gap-2 rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) px-2.5 py-1.5 focus-within:border-(--crm-primary) focus-within:ring-2 focus-within:ring-(--crm-primary)/15">
                    <Search size={14} className="shrink-0 text-(--crm-text-muted)" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Tìm biểu tượng cảm xúc..."
                        className="w-full bg-transparent text-xs text-(--crm-heading) placeholder:text-(--crm-text-muted) focus:outline-none"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => handleSearchChange("")}
                            className="rounded-md p-0.5 text-(--crm-text-muted) hover:bg-(--crm-surface-hover) hover:text-(--crm-heading)"
                            aria-label="Xóa tìm kiếm"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Category quick-jump bar */}
            {!searchResults && (
                <div
                    role="tablist"
                    aria-label="Danh mục biểu tượng cảm xúc"
                    className="grid grid-flow-col auto-cols-fr border-b border-(--crm-border-subtle) bg-(--crm-surface-subtle)/60 px-1.5 py-1"
                >
                    {visibleTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeCategory === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => handleJumpToCategory(tab.id)}
                                title={tab.label}
                                aria-label={tab.label}
                                className={`flex h-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                                    active
                                        ? "bg-(--crm-info-soft) text-(--crm-primary)"
                                        : "text-(--crm-text-muted) hover:bg-(--crm-surface-hover) hover:text-(--crm-heading)"
                                }`}
                            >
                                <Icon size={16} />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Scrollable emoji grid */}
            <div
                ref={listContainerRef}
                onScroll={handleScroll}
                className="relative h-64 overflow-y-auto px-2.5 py-2 space-y-3"
            >
                {searchResults ? (
                    searchResults.length > 0 ? (
                        <div>
                            <p className="mb-1.5 px-1 text-[11px] font-semibold text-(--crm-text-secondary)">
                                Kết quả tìm kiếm ({searchResults.length})
                            </p>
                            {renderEmojiGrid(searchResults, "search")}
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center px-4">
                            <Smile size={26} className="text-(--crm-text-muted) mb-2 opacity-70" />
                            <p className="text-xs font-medium text-(--crm-heading)">
                                Không tìm thấy biểu tượng phù hợp
                            </p>
                            <p className="mt-0.5 text-[11px] text-(--crm-text-muted)">
                                Thử từ khóa khác như “cười”, “tim”, “vỗ tay”, “cà phê”…
                            </p>
                        </div>
                    )
                ) : (
                    <>
                        {recentEmojis.length > 0 && (
                            <div
                                ref={(el) => {
                                    sectionRefs.current.recent = el;
                                }}
                            >
                                <p className="mb-1 px-1 text-[11px] font-semibold text-(--crm-text-secondary)">
                                    Dùng gần đây
                                </p>
                                {renderEmojiGrid(recentEmojis, "recent")}
                            </div>
                        )}

                        {EMOJI_CATEGORIES.map((category) => (
                            <div
                                key={category.id}
                                ref={(el) => {
                                    sectionRefs.current[category.id] = el;
                                }}
                            >
                                <p className="mb-1 px-1 text-[11px] font-semibold text-(--crm-text-secondary)">
                                    {category.label}
                                </p>
                                {renderEmojiGrid(category.emojis, category.id)}
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Footer live preview */}
            <div className="flex h-9 items-center gap-2 border-t border-(--crm-border-subtle) bg-(--crm-surface-subtle)/70 px-3">
                {hoveredEmoji ? (
                    <>
                        <span className="text-lg leading-none">{hoveredEmoji.char}</span>
                        <span className="truncate text-xs font-medium text-(--crm-heading)">
                            {hoveredEmoji.name}
                        </span>
                    </>
                ) : (
                    <span className="text-[11px] text-(--crm-text-muted)">
                        Chọn nhiều biểu tượng liên tiếp · Nhấn Esc để đóng
                    </span>
                )}
            </div>
        </div>
    );
};
