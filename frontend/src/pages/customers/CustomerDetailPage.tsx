import { Alert, CircularProgress, Tab, Tabs } from "@mui/material";
import { Activity, ArrowLeft, BadgeDollarSign, BriefcaseBusiness, Pencil, TicketCheck, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusChip from "../../components/common/StatusChip";
import CustomerActivities from "../../components/customers/CustomerActivities";
import CustomerDeals from "../../components/customers/CustomerDeals";
import CustomerOverview from "../../components/customers/CustomerOverview";
import CustomerTickets from "../../components/customers/CustomerTickets";
import { mockCustomerActivities, mockCustomerDeals, mockCustomerTickets } from "../../mocks/customer360";
import { customerService, getCustomerErrorMessage } from "../../services/customerService";
import type { Customer } from "../../types/customer";

const TAB_LABELS = ["Overview", "Deals", "Activities", "Tickets"] as const;
const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

interface SummaryCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    iconClassName: string;
}

function SummaryCard({ label, value, icon: Icon, iconClassName }: SummaryCardProps) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
                </div>
                <div className={`rounded-lg p-2.5 ${iconClassName}`}><Icon size={19} /></div>
            </div>
        </div>
    );
}

export default function CustomerDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const customerId = Number(id);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const deals = mockCustomerDeals.filter((deal) => deal.customerId === customerId);
    const activities = mockCustomerActivities.filter((activityItem) => activityItem.customerId === customerId);
    const tickets = mockCustomerTickets.filter((ticket) => ticket.customerId === customerId);
    const totalDealValue = deals.reduce((total, deal) => total + deal.value, 0);
    const openTickets = tickets.filter((ticket) => ticket.status === "OPEN").length;

    useEffect(() => {
        let active = true;

        const loadCustomer = async () => {
            if (!Number.isInteger(customerId) || customerId <= 0) {
                setError("Mã khách hàng không hợp lệ.");
                setLoading(false);
                return;
            }

            try {
                const data = await customerService.getCustomerById(customerId);
                if (active) setCustomer(data);
            } catch (loadError) {
                if (active) setError(getCustomerErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadCustomer();
        return () => { active = false; };
    }, [customerId]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await customerService.deleteCustomer(customerId);
            navigate("/customers", { replace: true });
        } catch (deleteError) {
            setError(getCustomerErrorMessage(deleteError));
            setConfirmDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div>;

    if (error || !customer) {
        return (
            <Alert severity="error" action={<button type="button" className="font-medium" onClick={() => navigate("/customers")}>Về danh sách</button>}>
                {error || "Không tìm thấy khách hàng."}
            </Alert>
        );
    }

    return (
        <div className="max-w-5xl">
            <div className="mb-5">
                <button type="button" onClick={() => navigate("/customers")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={17} /> Quay lại
                </button>
            </div>

            <div className="mb-5 flex flex-wrap items-start justify-between gap-5 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">{customer.name}</h1>
                    <p className="mt-1 text-sm font-medium text-slate-600">{customer.company}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <StatusChip status={customer.status} />
                        <span className="text-sm text-slate-500">Owner: <span className="font-medium text-slate-700">{customer.ownerName || "—"}</span></span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => navigate(`/customers/${customerId}/edit`)} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Pencil size={16} /> Chỉnh sửa
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        <Trash2 size={16} /> Xóa
                    </button>
                </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Total Deals" value={deals.length} icon={BriefcaseBusiness} iconClassName="bg-blue-50 text-blue-600" />
                <SummaryCard label="Total Deal Value" value={currencyFormatter.format(totalDealValue)} icon={BadgeDollarSign} iconClassName="bg-emerald-50 text-emerald-600" />
                <SummaryCard label="Activities" value={activities.length} icon={Activity} iconClassName="bg-violet-50 text-violet-600" />
                <SummaryCard label="Open Tickets" value={openTickets} icon={TicketCheck} iconClassName="bg-amber-50 text-amber-600" />
            </div>

            <div className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Tabs value={activeTab} onChange={(_, value: number) => setActiveTab(value)} variant="scrollable" scrollButtons="auto" aria-label="Thông tin liên quan của khách hàng">
                    {TAB_LABELS.map((label) => <Tab key={label} label={label} />)}
                </Tabs>
            </div>

            {activeTab === 0 && <CustomerOverview customer={customer} />}
            {activeTab === 1 && <CustomerDeals deals={deals} />}
            {activeTab === 2 && <CustomerActivities activities={activities} />}
            {activeTab === 3 && <CustomerTickets tickets={tickets} />}

            <ConfirmDialog
                open={confirmDelete}
                title="Xóa khách hàng?"
                description={`Khách hàng “${customer.name}” sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?`}
                loading={deleting}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
