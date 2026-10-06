import { CalendarClock, Mail, MessageSquareText, Phone, StickyNote } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ActivityType, CustomerActivity } from "../../types/customer360";

interface CustomerActivitiesProps {
    activities: readonly CustomerActivity[];
}

const activityConfig: Record<ActivityType, { label: string; icon: LucideIcon; className: string }> = {
    CALL: { label: "Cuộc gọi", icon: Phone, className: "bg-(--crm-info-soft) text-(--crm-primary)" },
    EMAIL: { label: "Email", icon: Mail, className: "bg-(--crm-surface-selected) text-(--crm-purple)" },
    MEETING: { label: "Cuộc họp", icon: MessageSquareText, className: "bg-(--crm-success-soft) text-(--crm-green-dark)" },
    NOTE: { label: "Ghi chú", icon: StickyNote, className: "bg-(--crm-warning-soft) text-(--crm-warning)" },
};

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export default function CustomerActivities({ activities }: CustomerActivitiesProps) {
    if (activities.length === 0) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-(--crm-border) bg-(--crm-surface) px-6 text-center">
                <div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)"><CalendarClock size={26} /></div>
                <p className="font-medium text-(--crm-text)">Chưa có hoạt động nào</p>
            </div>
        );
    }

    return (
        <div className="crm-card crm-card__body">
            <div className="crm-timeline">
                {activities.map((activity) => {
                    const config = activityConfig[activity.type];
                    const Icon = config.icon;

                    return (
                        <div key={activity.id} className="crm-timeline-item">
                            <div className={`crm-timeline-item__icon ${config.className}`}>
                                <Icon size={18} />
                            </div>
                            <div className="min-w-0 pt-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-(--crm-text-secondary)">{config.label}</span>
                                    <span className="text-xs text-(--crm-text-muted)">{dateTimeFormatter.format(new Date(activity.createdAt))}</span>
                                </div>
                                <h3 className="mt-1 text-sm font-semibold text-(--crm-heading)">{activity.title}</h3>
                                <p className="mt-1 text-sm text-(--crm-text-secondary)">{activity.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
