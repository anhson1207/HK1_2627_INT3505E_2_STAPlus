import {
    Alert,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Snackbar,
} from "@mui/material";
import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Search,
    UserPlus,
    UserRoundCheck,
    UserRoundX,
    Users,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import UserForm from "../../components/settings/UserForm";
import { userService } from "../../services/userService";
import { useAuthStore } from "../../stores/authStore";
import type { CRMUser, UserRole, UserStatus } from "../../types/user";
import type { UserFormData } from "../../utils/settingsSchema";

const pageSize = 8;

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

function getRoleLabel(role: UserRole) {
    if (role === "ADMIN") return "Admin";
    if (role === "SALES") return "Sales";
    if (role === "SUPPORT") return "Support";
    return "Chưa phân quyền";
}

function getRoleBadgeStyle(role: UserRole) {
    switch (role) {
        case "ADMIN":
            return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
        case "SALES":
            return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
        case "SUPPORT":
            return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
        default:
            return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
}

export default function UserManagementPage() {
    const currentUser = useAuthStore((state) => state.user);
    const currentUserId = (currentUser as unknown as { id?: number })?.id;
    const [users, setUsers] = useState<CRMUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [role, setRole] = useState<UserRole | "">("");
    const [status, setStatus] = useState<UserStatus | "">("");
    const [page, setPage] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<CRMUser | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [message, setMessage] = useState("");

    const isAdmin = currentUser?.role === "ADMIN";

    useEffect(() => {
        let isMounted = true;
        userService.getUsers()
            .then((data) => {
                if (isMounted) {
                    setUsers(data);
                    setLoading(false);
                }
            })
            .catch((loadError) => {
                if (isMounted) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Không thể tải người dùng."
                    );
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const keyword = deferredSearch.trim().toLocaleLowerCase("vi");

        const list = users.filter(
            (user) =>
                (!role || user.role === role) &&
                (!status || user.status === status) &&
                (!keyword ||
                    [
                        user.fullName,
                        user.email,
                        user.department || "Chưa phân bổ",
                    ]
                        .filter(Boolean)
                        .some((value) =>
                            value!.toLocaleLowerCase("vi").includes(keyword)
                        ))
        );

        // Luôn ưu tiên đưa tài khoản PENDING (chờ duyệt) và tài khoản mới lên đầu bảng
        return list.sort((a, b) => {
            if (a.status === "PENDING" && b.status !== "PENDING") return -1;
            if (a.status !== "PENDING" && b.status === "PENDING") return 1;
            return b.id - a.id;
        });
    }, [users, deferredSearch, role, status]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const visible = filtered.slice(
        page * pageSize,
        (page + 1) * pageSize
    );

    const pendingCount = users.filter(
        (user) => user.status === "PENDING"
    ).length;

    const openCreate = () => {
        setEditing(null);
        setFormError("");
        setFormOpen(true);
    };

    const openEdit = (user: CRMUser) => {
        setEditing(user);
        setFormError("");
        setFormOpen(true);
    };

    const save = async (data: UserFormData) => {
        setFormError("");

        if (!isAdmin) {
            setFormError("Chỉ ADMIN mới được quản lý tài khoản người dùng.");
            return;
        }

        try {
            if (editing) {
                if (
                    editing.id === currentUserId &&
                    (data.role !== editing.role ||
                        data.status !== editing.status)
                ) {
                    throw new Error(
                        "Bạn không thể đổi vai trò hoặc trạng thái tài khoản của chính mình."
                    );
                }

                const updated = await userService.updateUser(
                    editing.id,
                    data
                );
                setUsers((current) =>
                    current.map((item) =>
                        item.id === updated.id ? updated : item
                    )
                );
                setMessage("Cập nhật thông tin tài khoản thành công.");
            } else {
                const created = await userService.createUser(data);
                setUsers((current) => [created, ...current]);
                setMessage("Tạo tài khoản người dùng mới thành công.");
            }

            setFormOpen(false);
            setEditing(null);
        } catch (saveError) {
            setFormError(
                saveError instanceof Error
                    ? saveError.message
                    : "Không thể lưu thông tin người dùng."
            );
        }
    };

    const toggleStatus = async (user: CRMUser) => {
        if (!isAdmin) {
            setError("Chỉ ADMIN mới có quyền thay đổi trạng thái người dùng.");
            return;
        }

        if (user.id === currentUserId) {
            setError("Bạn không thể tự khóa tài khoản của chính mình.");
            return;
        }

        setBusyId(user.id);
        setError("");

        try {
            const updated =
                user.status === "ACTIVE"
                    ? await userService.deactivateUser(user.id)
                    : await userService.activateUser(user.id);

            setUsers((current) =>
                current.map((item) =>
                    item.id === updated.id ? updated : item
                )
            );

            setMessage(
                updated.status === "ACTIVE"
                    ? "Đã kích hoạt tài khoản."
                    : "Đã ngừng hoạt động tài khoản."
            );
        } catch (actionError) {
            setError(
                actionError instanceof Error
                    ? actionError.message
                    : "Không thể cập nhật trạng thái."
            );
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-(--crm-heading)">
                        Quản lý người dùng & Phân quyền
                    </h2>
                    <p className="mt-1 text-sm text-(--crm-text-secondary)">
                        Danh sách tài khoản nhân viên, phân quyền vai trò ADMIN / SALES / SUPPORT và kiểm soát trạng thái hoạt động.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-(--crm-primary) px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:opacity-90 active:scale-[0.99]"
                    >
                        <UserPlus size={16} />
                        <span>Thêm tài khoản</span>
                    </button>
                )}
            </div>

            {pendingCount > 0 && (
                <div>
                    <Alert severity="info">
                        Có <strong>{pendingCount} tài khoản</strong> đang chờ Quản trị viên duyệt phân quyền.
                    </Alert>
                </div>
            )}

            {error && (
                <div>
                    <Alert severity="error">{error}</Alert>
                </div>
            )}

            {/* Unified Card Table Container */}
            <div className="overflow-hidden rounded-2xl border border-(--crm-border) bg-(--crm-surface) shadow-xs">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--crm-border) bg-(--crm-surface) p-4 sm:px-6">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-(--crm-text-muted)">
                            <Search size={16} />
                        </div>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(0);
                            }}
                            placeholder="Tìm tên, email, phòng ban..."
                            className="w-full rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) py-2 pl-9 pr-3 text-xs text-(--crm-heading) outline-none transition-all placeholder:text-(--crm-text-muted) focus:border-(--crm-primary) focus:bg-(--crm-surface) focus:ring-2 focus:ring-(--crm-primary)/15"
                            aria-label="Tìm kiếm người dùng"
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Role Filter */}
                        <div className="relative">
                            <select
                                aria-label="Lọc vai trò"
                                value={role}
                                onChange={(event) => {
                                    setRole(event.target.value as UserRole | "");
                                    setPage(0);
                                }}
                                className="appearance-none rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) py-2 pl-3.5 pr-8 text-xs font-medium text-(--crm-heading) outline-none cursor-pointer transition-all hover:bg-(--crm-surface-hover) focus:border-(--crm-primary) focus:ring-2 focus:ring-(--crm-primary)/15"
                            >
                                <option value="" className="bg-(--crm-surface) text-(--crm-heading)">
                                    Tất cả vai trò
                                </option>
                                <option value="UNASSIGNED" className="bg-(--crm-surface) text-(--crm-heading)">
                                    Chưa phân quyền
                                </option>
                                <option value="ADMIN" className="bg-(--crm-surface) text-(--crm-heading)">
                                    Quản trị viên (Admin)
                                </option>
                                <option value="SALES" className="bg-(--crm-surface) text-(--crm-heading)">
                                    Kinh doanh (Sales)
                                </option>
                                <option value="SUPPORT" className="bg-(--crm-surface) text-(--crm-heading)">
                                    Hỗ trợ (Support)
                                </option>
                            </select>
                            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--crm-text-muted)">
                                <ChevronDown size={14} />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                aria-label="Lọc trạng thái"
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value as UserStatus | "");
                                    setPage(0);
                                }}
                                className="appearance-none rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) py-2 pl-3.5 pr-8 text-xs font-medium text-(--crm-heading) outline-none cursor-pointer transition-all hover:bg-(--crm-surface-hover) focus:border-(--crm-primary) focus:ring-2 focus:ring-(--crm-primary)/15"
                            >
                                <option value="" className="bg-(--crm-surface) text-(--crm-heading)">
                                    Tất cả trạng thái
                                </option>
                                <option value="PENDING" className="bg-(--crm-surface) text-(--crm-heading)">
                                    Chờ duyệt
                                </option>
                                <option value="ACTIVE" className="bg-(--crm-surface) text-(--crm-heading)">
                                    Đang hoạt động
                                </option>
                                <option value="INACTIVE" className="bg-(--crm-surface) text-(--crm-heading)">
                                    Ngừng hoạt động
                                </option>
                            </select>
                            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--crm-text-muted)">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Data */}
                {loading ? (
                    <div className="flex min-h-64 items-center justify-center p-12">
                        <CircularProgress size={32} />
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-(--crm-text-muted)">
                        <Users size={36} className="text-(--crm-text-disabled)" />
                        <p className="mt-3 text-sm font-medium">Không tìm thấy tài khoản phù hợp bộ lọc.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)/50 text-[11px] font-bold uppercase tracking-wider text-(--crm-text-secondary)">
                                    <th className="px-5 py-3.5">Thành viên</th>
                                    <th className="px-5 py-3.5">Email</th>
                                    <th className="px-5 py-3.5 text-center">Vai trò</th>
                                    <th className="px-5 py-3.5">Phòng ban</th>
                                    <th className="px-5 py-3.5 text-center">Trạng thái</th>
                                    <th className="px-5 py-3.5 text-center">Ngày tạo</th>
                                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-(--crm-border-subtle)">
                                {visible.map((user) => {
                                    const isPending = user.status === "PENDING";
                                    const isBusy = busyId === user.id;
                                    const initial = (user.fullName || user.email).charAt(0).toUpperCase();

                                    return (
                                        <tr
                                            key={user.id}
                                            className="transition-colors hover:bg-(--crm-surface-subtle)/40"
                                        >
                                            {/* Name & Avatar */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 font-bold text-xs text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                                        {initial}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-(--crm-heading)" title={user.fullName}>
                                                            {user.fullName}
                                                        </p>
                                                        {user.username && (
                                                            <p className="text-[11px] text-(--crm-text-muted)">
                                                                @{user.username}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-5 py-3.5 text-xs text-(--crm-text-secondary)">
                                                <span className="truncate block max-w-xs" title={user.email}>
                                                    {user.email}
                                                </span>
                                            </td>

                                            {/* Role */}
                                            <td className="whitespace-nowrap px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeStyle(user.role)}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>

                                            {/* Department */}
                                            <td className="px-5 py-3.5 text-xs text-(--crm-text-secondary)">
                                                <span
                                                    className={
                                                        !user.department || user.department === "—" || user.department === "Chờ phân bổ" || user.department === "Chưa phân bổ"
                                                            ? "text-(--crm-text-muted) italic"
                                                            : "font-medium text-(--crm-heading)"
                                                    }
                                                >
                                                    {user.department && user.department !== "—" && user.department !== "Chờ phân bổ"
                                                        ? user.department
                                                        : "Chưa phân bổ"}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="whitespace-nowrap px-5 py-3.5 text-center">
                                                {user.status === "ACTIVE" ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Hoạt động
                                                    </span>
                                                ) : user.status === "PENDING" ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        Chờ duyệt
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                        Ngừng hoạt động
                                                    </span>
                                                )}
                                            </td>

                                            {/* Created At */}
                                            <td className="whitespace-nowrap px-5 py-3.5 text-center text-xs text-(--crm-text-secondary)">
                                                {dateFormat.format(new Date(user.createdAt))}
                                            </td>

                                            {/* Actions */}
                                            <td className="whitespace-nowrap px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {isAdmin && (
                                                        <button
                                                            type="button"
                                                            aria-label={`Sửa ${user.fullName}`}
                                                            title={
                                                                isPending
                                                                    ? "Phân quyền / duyệt tài khoản"
                                                                    : "Sửa thông tin tài khoản"
                                                            }
                                                            onClick={() => openEdit(user)}
                                                            className="rounded-lg p-1.5 text-(--crm-text-secondary) hover:bg-(--crm-primary)/10 hover:text-(--crm-primary) transition-colors"
                                                        >
                                                            {isPending ? (
                                                                <Check size={16} className="text-emerald-600" />
                                                            ) : (
                                                                <Pencil size={16} />
                                                            )}
                                                        </button>
                                                    )}

                                                    {isAdmin && (
                                                        <button
                                                            type="button"
                                                            aria-label={`${user.status === "ACTIVE" ? "Ngừng hoạt động" : "Kích hoạt"} ${user.fullName}`}
                                                            title={
                                                                user.status === "ACTIVE"
                                                                    ? "Ngừng hoạt động tài khoản"
                                                                    : user.role === "UNASSIGNED"
                                                                      ? "Cần phân quyền trước"
                                                                      : "Kích hoạt tài khoản"
                                                            }
                                                            disabled={
                                                                user.id === currentUserId ||
                                                                isBusy ||
                                                                (user.status !== "ACTIVE" &&
                                                                    user.role === "UNASSIGNED")
                                                            }
                                                            onClick={() => void toggleStatus(user)}
                                                            className="rounded-lg p-1.5 text-(--crm-text-secondary) hover:bg-(--crm-surface-hover) hover:text-(--crm-heading) transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            {isBusy ? (
                                                                <CircularProgress size={14} color="inherit" />
                                                            ) : user.status === "ACTIVE" ? (
                                                                <UserRoundX size={16} className="text-rose-500" />
                                                            ) : (
                                                                <UserRoundCheck size={16} className="text-emerald-600" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                {!loading && filtered.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--crm-border) bg-(--crm-surface-subtle)/30 px-5 py-3 text-xs text-(--crm-text-secondary)">
                        <span>
                            Hiển thị <strong>{visible.length}</strong> / <strong>{filtered.length}</strong> tài khoản
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page === 0}
                                onClick={() => setPage((v) => v - 1)}
                                className="inline-flex items-center gap-1 rounded-lg border border-(--crm-border) bg-(--crm-surface) px-2.5 py-1 text-xs font-semibold text-(--crm-heading) shadow-2xs hover:bg-(--crm-surface-hover) disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={14} />
                                <span>Trước</span>
                            </button>

                            <span className="px-2 text-xs font-medium text-(--crm-heading)">
                                {page + 1} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((v) => v + 1)}
                                className="inline-flex items-center gap-1 rounded-lg border border-(--crm-border) bg-(--crm-surface) px-2.5 py-1 text-xs font-semibold text-(--crm-heading) shadow-2xs hover:bg-(--crm-surface-hover) disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span>Sau</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    {editing
                        ? editing.status === "PENDING"
                            ? "Duyệt & phân quyền tài khoản"
                            : "Chỉnh sửa thông tin người dùng"
                        : "Thêm tài khoản người dùng mới"}
                </DialogTitle>

                <DialogContent>
                    <div className="pt-2">
                        <UserForm
                            key={editing?.id ?? "create"}
                            initialData={editing ?? undefined}
                            onSubmit={save}
                            onCancel={() => setFormOpen(false)}
                            submitLabel={
                                editing
                                    ? editing.status === "PENDING"
                                        ? "Lưu phân quyền"
                                        : "Lưu thay đổi"
                                    : "Tạo tài khoản"
                            }
                            error={formError}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={Boolean(message)}
                autoHideDuration={3000}
                onClose={() => setMessage("")}
                message={message}
            />
        </div>
    );
}
