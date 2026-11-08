import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../../components/common/BrandLogo";
import { Building2, Users, ArrowRight } from "lucide-react";

export default function RegisterChoicePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50/70 text-slate-800 font-sans antialiased">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <BrandLogo size="md" variant="dark" />
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="my-auto max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
                {/* Title Section */}
                <div className="text-center max-w-xl mx-auto mb-10">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Bạn muốn sử dụng STAPlus CRM như thế nào?
                    </h1>
                    <p className="mt-2.5 text-sm sm:text-base text-slate-500 leading-relaxed">
                        Lựa chọn phương thức bắt đầu để phù hợp với vai trò của bạn trong tổ chức.
                    </p>
                </div>

                {/* 2 Clean Balanced Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {/* CARD 1: TẠO CRM CHO DOANH NGHIỆP */}
                    <div
                        onClick={() => navigate("/register/company")}
                        className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-[#007f9b] p-7 sm:p-8 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-50 text-[#007f9b] ring-4 ring-cyan-50/50 group-hover:scale-105 transition-transform mb-5">
                                <Building2 size={24} />
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#007f9b] transition-colors">
                                Tạo CRM cho doanh nghiệp
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                Thiết lập không gian làm việc mới cho tổ chức để quản lý khách hàng, cơ hội bán hàng và đội ngũ.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/register/company");
                                }}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-[#007f9b] hover:bg-[#006278] active:bg-[#004f61] shadow-xs hover:shadow transition-all cursor-pointer"
                            >
                                <span>Tạo CRM cho doanh nghiệp</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* CARD 2: THAM GIA CÔNG TY */}
                    <div
                        onClick={() => navigate("/register/employee")}
                        className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-[#007f9b] p-7 sm:p-8 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 text-teal-600 ring-4 ring-teal-50/50 group-hover:scale-105 transition-transform mb-5">
                                <Users size={24} />
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#007f9b] transition-colors">
                                Tham gia công ty
                            </h2>

                            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                                Tham gia vào không gian làm việc của công ty bằng mã mời do người quản trị cung cấp.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/register/employee");
                                }}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-[#007f9b] bg-cyan-50 hover:bg-cyan-100/80 active:bg-cyan-200/80 border border-cyan-200 transition-all cursor-pointer"
                            >
                                <span>Tham gia công ty</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Back Link */}
                <div className="mt-10 text-center text-sm text-slate-500">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="font-semibold text-[#007f9b] hover:underline">
                        Đăng nhập ngay
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
                © 2026 STAPlus CRM. All rights reserved.
            </footer>
        </div>
    );
}
