import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Clock,
    RefreshCw,
    LogOut,
    Building2,
    XCircle,
    User,
    Mail,
    Shield,
} from "lucide-react";

import StatusLayout from "../../layouts/StatusLayout";
import { useAuthStore } from "../../stores/authStore";
import { joinRequestService } from "../../services/joinRequestService";
import type { JoinStatusResponse } from "../../types/auth";

export default function PendingApprovalPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, refreshUser } = useAuthStore();
    const [isChecking, setIsChecking] = useState(false);
    const [joinStatus, setJoinStatus] = useState<JoinStatusResponse | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // If not authenticated, redirect to login
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
        } else if (user?.status === "ACTIVE" && user?.role && user.role !== "UNASSIGNED") {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const checkStatus = async () => {
        setIsChecking(true);
        setMessage(null);
        try {
            const res = await joinRequestService.getMyJoinStatus();
            setJoinStatus(res);

            if (res.userStatus === "ACTIVE" || res.status === "APPROVED") {
                await refreshUser();
                navigate("/dashboard", { replace: true });
                return;
            }

            if (res.status === "REJECTED" || res.userStatus === "REJECTED") {
                setMessage("Yêu cầu tham gia của bạn đã bị từ chối bởi Quản trị viên.");
            } else {
                setMessage("Tài khoản vẫn đang trong hàng đợi phê duyệt.");
            }
        } catch {
            const updated = await refreshUser();
            if (updated?.status === "ACTIVE" && updated?.role && updated.role !== "UNASSIGNED") {
                navigate("/dashboard", { replace: true });
            } else {
                setMessage("Chưa có cập nhật mới từ Quản trị viên.");
            }
        } finally {
            setIsChecking(false);
        }
    };

    // Auto check status on mount
    useEffect(() => {
        void checkStatus();
    }, []);

    const isRejected =
        joinStatus?.status === "REJECTED" ||
        joinStatus?.userStatus === "REJECTED" ||
        user?.status === "REJECTED";

    return (
        <StatusLayout
            icon={
                isRejected ? (
                    <XCircle size={32} className="text-rose-600" />
                ) : (
                    <Clock size={32} className="text-amber-600" />
                )
            }
            iconBg={
                isRejected
                    ? "bg-rose-50 text-rose-600 ring-rose-50/60"
                    : "bg-amber-50 text-amber-600 ring-amber-50/60"
            }
            title={isRejected ? "Yêu cầu tham gia bị từ chối" : "Đang chờ Quản trị viên phê duyệt"}
            subtitle={
                isRejected
                    ? "Quản trị viên đã từ chối yêu cầu tham gia không gian làm việc này."
                    : "Tài khoản của bạn đã được lưu vào hệ thống STAPlus CRM. Vui lòng đợi Quản trị viên (Admin) kích hoạt và phân vai trò làm việc."
            }
            actions={
                <div className="space-y-3">
                    {!isRejected && (
                        <button
                            type="button"
                            disabled={isChecking}
                            onClick={() => void checkStatus()}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#007f9b] hover:bg-[#006278] active:bg-[#004f61] shadow-xs transition-all cursor-pointer"
                        >
                            <RefreshCw size={16} className={isChecking ? "animate-spin" : ""} />
                            <span>{isChecking ? "Đang kiểm tra..." : "Kiểm tra lại trạng thái"}</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                    >
                        <LogOut size={16} />
                        <span>Đăng xuất tài khoản</span>
                    </button>
                </div>
            }
            footerNote={
                isRejected
                    ? "Nếu có sự nhầm lẫn, vui lòng liên hệ trực tiếp với người quản trị để được hỗ trợ."
                    : "👑 Lưu ý: Quản trị viên sẽ nhận được thông báo xét duyệt tại mục Cài đặt > Yêu cầu tham gia."
            }
        >
            {/* Account & Workspace Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Building2 size={15} className="text-[#007f9b]" /> Doanh nghiệp:
                    </span>
                    <span className="font-bold text-slate-900">
                        {joinStatus?.companyName || user?.companyName || "STAPlus CRM"}
                    </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <User size={15} className="text-slate-400" /> Tài khoản:
                    </span>
                    <span className="font-semibold text-slate-800">
                        {user?.fullName || user?.username}
                    </span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Mail size={15} className="text-slate-400" /> Email làm việc:
                    </span>
                    <span className="text-slate-700 font-mono">{user?.email}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Shield size={15} className="text-slate-400" /> Trạng thái hồ sơ:
                    </span>
                    <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            isRejected
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                        }`}
                    >
                        {isRejected ? "Đã bị từ chối" : "Đang chờ duyệt vai trò"}
                    </span>
                </div>
            </div>

            {message && (
                <div className="mt-3 p-3 rounded-xl bg-slate-100 text-xs text-slate-600 text-center">
                    {message}
                </div>
            )}
        </StatusLayout>
    );
}
