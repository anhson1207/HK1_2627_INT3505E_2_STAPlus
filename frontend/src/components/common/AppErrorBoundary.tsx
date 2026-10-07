import { Button } from "@mui/material";
import { AlertTriangle, House, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class AppErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State { return { hasError: true }; }

    render() {
        if (!this.state.hasError) return this.props.children;
        return <main className="flex min-h-screen items-center justify-center bg-(--crm-surface-subtle) px-5 text-center"><div className="max-w-md rounded-lg border border-(--crm-border) bg-(--crm-surface) p-8 shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--crm-danger-soft) text-(--crm-danger)"><AlertTriangle size={27} /></div><h1 className="crm-page-title">Đã xảy ra lỗi</h1><p className="mt-2 text-sm text-(--crm-text-secondary)">Giao diện gặp sự cố ngoài dự kiến. Bạn có thể thử tải lại phần này.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button variant="outlined" startIcon={<RotateCcw size={16} />} onClick={() => this.setState({ hasError: false })}>Thử lại</Button><Button variant="contained" startIcon={<House size={16} />} onClick={() => window.location.assign("/dashboard")}>Về Dashboard</Button></div></div></main>;
    }
}
