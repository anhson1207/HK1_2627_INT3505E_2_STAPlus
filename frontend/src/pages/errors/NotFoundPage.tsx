import { Button } from "@mui/material";
import { House } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();
    return <main className="flex min-h-screen items-center justify-center bg-(--crm-surface-subtle) px-5 text-center"><div className="max-w-md"><p className="text-8xl font-bold tracking-tight text-(--crm-primary)">404</p><h1 className="crm-page-title">Không tìm thấy trang</h1><p className="mt-3 text-sm text-(--crm-text-secondary)">Trang bạn đang tìm không tồn tại hoặc đã được chuyển đi.</p><Button variant="contained" startIcon={<House size={17} />} onClick={() => navigate("/dashboard")} sx={{ mt: 3 }}>Về Dashboard</Button></div></main>;
}
