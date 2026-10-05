import { useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
// import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore.ts";
export default function UserMenu() {
    const [open, setOpen] = useState(false);

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    
    if (!user) {
        return null;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((value) => !value)}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-100"
            >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                    {user.name.charAt(0)}
                </div>

                <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-gray-800">
                        {user.name}
                    </p>

                    <p className="text-xs text-gray-500">
                        {user.role}
                    </p>
                </div>

                <ChevronDown size={16} className="text-gray-500" />
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <UserRound size={17} />
                        Thông tin cá nhân
                    </button>

                    <div className="my-1 border-t border-gray-100" />

                    <button
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={17} />
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
}