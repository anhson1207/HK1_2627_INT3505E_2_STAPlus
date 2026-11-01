
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Snackbar,
} from "@mui/material";
import {
    Check,
    Pencil,
    Plus,
    Search,
    UserRoundCheck,
    UserRoundX,
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

function getStatusLabel(status: UserStatus) {
    if (status === "ACTIVE") return "Hoạt động";
    if (status === "PENDING") return "Chờ duyệt";
    return "Ngừng hoạt động";
}

function getRoleLabel(role: UserRole) {
    if (role === "ADMIN") return "Admin";
    if (role === "SALES") return "Sales";
    if (role === "SUPPORT") return "Support";
    return "Chưa phân quyền";
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
                    [user.fullName, user.email, user.department]
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

                if (
                    data.status === "ACTIVE" &&
                    data.role === "UNASSIGNED"
                ) {
                    throw new Error(
                        "Hãy phân vai trò SALES hoặc SUPPORT trước khi kích hoạt."
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

                setMessage(
                    updated.status === "ACTIVE" &&
                        editing.status !== "ACTIVE"
                        ? "Đã duyệt và kích hoạt tài khoản."
                        : "Cập nhật người dùng thành công."
                );
            } else {
                const created = await userService.createUser(data);

                setUsers((current) => [...current, created]);
                setPage(0);
                setMessage("Tạo người dùng thành công.");
            }

            setFormOpen(false);
        } catch (saveError) {
            setFormError(
                saveError instanceof Error
                    ? saveError.message
                    : "Không thể lưu người dùng."
            );
        }
    };

    const toggleStatus = async (user: CRMUser) => {
        if (!isAdmin) {
            setError("Chỉ ADMIN mới được thay đổi trạng thái tài khoản.");
            return;
        }

        if (user.id === currentUserId) {
            setError("Bạn không thể thay đổi trạng thái tài khoản của chính mình.");
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
        <div>
            <div className="crm-page-header">
                <div>
                    <h2 className="text-lg font-semibold text-(--crm-heading)">
                        Quản lý người dùng
                    </h2>
                    <p className="crm-page-description">
                        Quản lý vai trò, trạng thái và duyệt tài khoản đăng ký.
                    </p>
                </div>

                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<Plus size={17} />}
                        onClick={openCreate}
                    >
                        Thêm người dùng
                    </Button>
                )}
            </div>

            {pendingCount > 0 && (
                <Alert severity="info" className="mb-4">
                    Có {pendingCount} tài khoản đang chờ ADMIN duyệt.
                </Alert>
            )}

            {error && (
                <Alert severity="error" className="mb-4">
                    {error}
                </Alert>
            )}

            <div className="crm-board">
                <div className="flex flex-wrap gap-3 border-b border-(--crm-border) p-4">
                    <label className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border border-(--crm-border) px-3">
                        <Search
                            size={16}
                            className="text-(--crm-text-muted)"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(0);
                            }}
                            placeholder="Tìm tên, email, phòng ban..."
                            className="h-9 w-full min-w-0 bg-transparent text-xs outline-none"
                        />
                    </label>

                    <select
                        aria-label="Lọc vai trò"
                        value={role}
                        onChange={(event) => {
                            setRole(event.target.value as UserRole | "");
                            setPage(0);
                        }}
                        className="crm-filter-chip"
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="UNASSIGNED">Chưa phân quyền</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SALES">Sales</option>
                        <option value="SUPPORT">Support</option>
                    </select>

                    <select
                        aria-label="Lọc trạng thái"
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value as UserStatus | "");
                            setPage(0);
                        }}
                        className="crm-filter-chip"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <CircularProgress />
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex min-h-64 items-center justify-center text-sm text-(--crm-text-secondary)">
                        Không tìm thấy người dùng.
                    </div>
                ) : (
                    <div className="crm-table-wrap">
                        <table className="crm-table">
                            <thead>
                                <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle) text-left text-xs text-(--crm-text-secondary)">
                                    <th className="px-4 py-3">Tên</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Vai trò</th>
                                    <th className="px-4 py-3">Phòng ban</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3">Ngày tạo</th>
                                    <th className="px-4 py-3">Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {visible.map((user) => {
                                    const isPending =
                                        user.status === "PENDING";
                                    const isBusy = busyId === user.id;

                                    const statusClass =
                                        user.status === "ACTIVE"
                                            ? "bg-(--crm-success-soft) text-(--crm-green-dark)"
                                            : user.status === "PENDING"
                                              ? "bg-amber-100 text-amber-800"
                                              : "bg-(--crm-surface-hover) text-(--crm-text-secondary)";

                                    return (
                                        <tr
                                            key={user.id}
                                            className="border-b border-(--crm-border-subtle) last:border-b-0 hover:bg-(--crm-surface-subtle)"
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-(--crm-heading)">
                                                {user.fullName}
                                            </td>

                                            <td className="px-4 py-3 text-xs text-(--crm-text-secondary)">
                                                {user.email}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-(--crm-info-soft) px-2.5 py-1 text-xs font-medium text-(--crm-primary)">
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-xs text-(--crm-text-secondary)">
                                                {user.department || "—"}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
                                                >
                                                    {getStatusLabel(user.status)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-xs text-(--crm-text-secondary)">
                                                {dateFormat.format(
                                                    new Date(user.createdAt)
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    {isAdmin && (
                                                        <button
                                                            type="button"
                                                            aria-label={`Sửa ${user.fullName}`}
                                                            title={
                                                                isPending
                                                                    ? "Phân quyền / duyệt tài khoản"
                                                                    : "Sửa"
                                                            }
                                                            onClick={() =>
                                                                openEdit(user)
                                                            }
                                                            className="rounded-lg p-2 text-(--crm-primary) hover:bg-(--crm-info-soft)"
                                                        >
                                                            {isPending ? (
                                                                <Check size={16} />
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
                                                                    ? "Ngừng hoạt động"
                                                                    : user.role === "UNASSIGNED"
                                                                      ? "Cần phân quyền trước"
                                                                      : "Kích hoạt"
                                                            }
                                                            disabled={
                                                                user.id === currentUserId ||
                                                                isBusy ||
                                                                (user.status !== "ACTIVE" &&
                                                                    user.role === "UNASSIGNED")
                                                            }
                                                            onClick={() =>
                                                                void toggleStatus(user)
                                                            }
                                                            className="rounded-lg p-2 text-(--crm-text-secondary) hover:bg-(--crm-surface-hover) disabled:opacity-30"
                                                        >
                                                            {isBusy ? (
                                                                <CircularProgress size={16} />
                                                            ) : user.status === "ACTIVE" ? (
                                                                <UserRoundX size={16} />
                                                            ) : (
                                                                <UserRoundCheck size={16} />
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

                {!loading && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--crm-border) px-4 py-3 text-xs text-(--crm-text-secondary)">
                        <span>{filtered.length} người dùng</span>

                        <div className="flex items-center gap-2">
                            <Button
                                size="small"
                                disabled={page === 0}
                                onClick={() =>
                                    setPage((value) => value - 1)
                                }
                            >
                                Trước
                            </Button>

                            <span>
                                {page + 1}/{totalPages}
                            </span>

                            <Button
                                size="small"
                                disabled={page + 1 >= totalPages}
                                onClick={() =>
                                    setPage((value) => value + 1)
                                }
                            >
                                Sau
                            </Button>
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
                            ? "Duyệt tài khoản"
                            : "Chỉnh sửa người dùng"
                        : "Thêm người dùng"}
                </DialogTitle>

                <DialogContent>
                    <div className="pt-2">
                        <UserForm
                            key={editing?.id ?? "new"}
                            initialData={editing ?? undefined}
                            onSubmit={save}
                            onCancel={() => setFormOpen(false)}
                            submitLabel={
                                editing?.status === "PENDING"
                                    ? "Lưu phân quyền"
                                    : editing
                                      ? "Lưu thay đổi"
                                      : "Tạo người dùng"
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