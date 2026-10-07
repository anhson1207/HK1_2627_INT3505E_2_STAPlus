import { Activity, BriefcaseBusiness, CircleUserRound, Clock3, Ticket, UserPlus } from "lucide-react";
import type { RecentActivity } from "../../types/analytics";

interface RecentActivitiesProps {
  data: RecentActivity[];
}

const activityMeta = {
  LEAD: { icon: UserPlus, label: "Lead", className: "activity-icon--blue" },
  CUSTOMER: { icon: CircleUserRound, label: "Khách hàng", className: "activity-icon--green" },
  DEAL: { icon: BriefcaseBusiness, label: "Deal", className: "activity-icon--purple" },
  TICKET: { icon: Ticket, label: "Ticket", className: "activity-icon--orange" },
} as const;

export default function RecentActivities({ data }: RecentActivitiesProps) {
  return (
    <section className="crm-widget crm-activity-widget">
      <div className="crm-widget__header">
        <div>
          <p className="crm-widget__eyebrow">Hoạt động</p>
          <h2>Hoạt động gần đây</h2>
        </div>
        <span className="crm-widget__icon crm-tone--teal"><Activity size={20} aria-hidden="true" /></span>
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">Chưa có hoạt động gần đây.</div>
      ) : (
        <div className="activity-list" tabIndex={0} aria-label="Danh sách hoạt động gần đây">
          {data.map((activity) => {
            const meta = activityMeta[activity.type];
            const Icon = meta.icon;
            return (
              <article className={`activity-item ${meta.className}`} key={activity.id}>
                <span className={`activity-icon ${meta.className}`}>
                  <Icon size={17} aria-hidden="true" />
                </span>
                <div className="activity-item__content">
                  <span>{meta.label}</span>
                  <p>{activity.description}</p>
                  <time><Clock3 size={12} aria-hidden="true" />{activity.timeAgo}</time>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
