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
}

function SummaryCard({ label, value, icon: Icon }: SummaryCardProps) {
    return (
        <div className="crm-kpi">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="crm-kpi__label">{label}</p>
                    <p className="crm-kpi__value">{value}</p>
                </div>
                <div className="crm-kpi__icon"><Icon size={19} /></div>
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
                <button type="button" onClick={() => navigate("/customers")} className="flex items-center gap-2 text-sm text-(--crm-text-secondary) hover:text-(--crm-heading)">
                    <ArrowLeft size={17} /> Quay lại
                </button>
            </div>

            <div className="crm-page-header crm-customer-heading">
                <div>
                    <h1 className="crm-page-title">{customer.name}</h1>
                    <p className="mt-1 text-sm font-medium text-(--crm-text-secondary)">{customer.company}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <StatusChip status={customer.status} />
                        <span className="text-sm text-(--crm-text-secondary)">Owner: <span className="font-medium text-(--crm-text)">{customer.ownerName || "—"}</span></span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => navigate(`/customers/${customerId}/edit`)} className="crm-btn crm-btn--secondary">
                        <Pencil size={16} /> Chỉnh sửa
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(true)} className="crm-btn crm-btn--secondary crm-danger-action">
                        <Trash2 size={16} /> Xóa
                    </button>
                </div>
            </div>

            <div className="crm-kpi-grid mb-5">
                <SummaryCard label="Total Deals" value={deals.length} icon={BriefcaseBusiness} />
                <SummaryCard label="Total Deal Value" value={currencyFormatter.format(totalDealValue)} icon={BadgeDollarSign} />
                <SummaryCard label="Activities" value={activities.length} icon={Activity} />
                <SummaryCard label="Open Tickets" value={openTickets} icon={TicketCheck} />
            </div>

            <div className="mb-5 overflow-hidden rounded-lg border border-(--crm-border) bg-(--crm-surface)">
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
