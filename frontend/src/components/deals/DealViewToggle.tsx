import { Columns3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DealViewToggle({ view }: { view: "list" | "kanban" }) {
    const navigate = useNavigate();
    return (
        <div className="crm-view-switch">
            <button type="button" aria-pressed={view === "list"} onClick={() => navigate("/deals")} className={`crm-filter-chip ${view === "list" ? "is-active" : ""}`}><List size={15} /> Danh sách</button>
            <button type="button" aria-pressed={view === "kanban"} onClick={() => navigate("/deals/kanban")} className={`crm-filter-chip ${view === "kanban" ? "is-active" : ""}`}><Columns3 size={15} /> Kanban</button>
        </div>
    );
}
