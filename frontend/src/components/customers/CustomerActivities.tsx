import { CalendarClock, Mail, MessageSquareText, Phone, StickyNote } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ActivityType, CustomerActivity } from "../../types/customer360";

interface CustomerActivitiesProps {
    activities: readonly CustomerActivity[];
}

const activityConfig: Record<ActivityType, { label: string; icon: LucideIcon; className: string }> = {
    CALL: { label: "Cuộc gọi", icon: Phone, className: "bg-blue-50 text-blue-600" },
    EMAIL: { label: "Email", icon: Mail, className: "bg-violet-50 text-violet-600" },
    MEETING: { label: "Cuộc họp", icon: MessageSquareText, className: "bg-emerald-50 text-emerald-600" },
    NOTE: { label: "Ghi chú", icon: StickyNote, className: "bg-amber-50 text-amber-600" },
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
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400"><CalendarClock size={26} /></div>
                <p className="font-medium text-slate-700">Chưa có hoạt động nào</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
            <div className="space-y-0">
                {activities.map((activity, index) => {
                    const config = activityConfig[activity.type];
                    const Icon = config.icon;
                    const isLast = index === activities.length - 1;

                    return (
                        <div key={activity.id} className="relative flex gap-4 pb-7 last:pb-0">
                            {!isLast && <span className="absolute bottom-0 left-[19px] top-10 w-px bg-slate-200" />}
                            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.className}`}>
                                <Icon size={18} />
                            </div>
                            <div className="min-w-0 pt-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{config.label}</span>
                                    <span className="text-xs text-slate-400">{dateTimeFormatter.format(new Date(activity.createdAt))}</span>
                                </div>
                                <h3 className="mt-1 text-sm font-semibold text-slate-900">{activity.title}</h3>
                                <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
