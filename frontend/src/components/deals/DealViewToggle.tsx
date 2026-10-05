import { Columns3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DealViewToggle({ view }: { view: "list" | "kanban" }) {
    const navigate = useNavigate();
    return (
        <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
            <button type="button" onClick={() => navigate("/deals")} className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}><List size={15} /> Danh sách</button>
            <button type="button" onClick={() => navigate("/deals/kanban")} className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium ${view === "kanban" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}><Columns3 size={15} /> Kanban</button>
        </div>
    );
}
