import { Button } from "@mui/material";
import { House } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
    const navigate = useNavigate();
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-center"><div className="max-w-md"><p className="text-8xl font-bold tracking-tight text-amber-600">403</p><h1 className="mt-3 text-2xl font-semibold text-slate-900">Bạn không có quyền truy cập trang này</h1><p className="mt-3 text-sm text-slate-500">Hãy liên hệ quản trị viên nếu bạn cần quyền sử dụng chức năng này.</p><Button variant="contained" startIcon={<House size={17} />} onClick={() => navigate("/dashboard")} sx={{ mt: 3 }}>Về Dashboard</Button></div></main>;
}
