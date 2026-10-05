import { BriefcaseBusiness, CircleUserRound, Ticket, UserPlus } from "lucide-react";
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
    <section className="dashboard-card">
      <div className="dashboard-card__header">
        <div>
          <p className="dashboard-card__eyebrow">Hoạt động</p>
          <h2>Hoạt động gần đây</h2>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="chart-empty">Chưa có hoạt động gần đây.</div>
      ) : (
        <div className="activity-list">
          {data.map((activity) => {
            const meta = activityMeta[activity.type];
            const Icon = meta.icon;
            return (
              <article className="activity-item" key={activity.id}>
                <span className={`activity-icon ${meta.className}`}>
                  <Icon size={17} aria-hidden="true" />
                </span>
                <div className="activity-item__content">
                  <span>{meta.label}</span>
                  <p>{activity.description}</p>
                </div>
                <time>{activity.timeAgo}</time>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
