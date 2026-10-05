import type { ReactNode } from "react";

interface AuthPageShellProps {
    title: string;
    description: string;
    children: ReactNode;
}

export default function AuthPageShell({ title, description, children }: AuthPageShellProps) {
    return (
        <main className="fixed inset-0 z-50 flex min-h-screen w-screen items-center justify-center overflow-y-auto bg-[#F7F9FC] px-4 py-8">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <div className="mx-auto grid h-12 w-12 grid-cols-2 gap-0.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 shadow-md shadow-blue-200">
                        <span className="rounded-sm bg-white" /><span className="rounded-sm bg-cyan-200" />
                        <span className="rounded-sm bg-violet-200" /><span className="rounded-sm bg-white" />
                    </div>
                    <p className="mt-3 text-lg font-bold text-slate-900">CRM</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6 text-center">
                        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
                        <p className="mt-2 text-sm text-slate-500">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </main>
    );
}
