import axios, { type AxiosInstance } from "axios";

interface ApiAuthHandlers {
    getToken: () => string | null;
    onUnauthorized: () => void;
}

export class ApiError extends Error {
    readonly status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export const hasConfiguredApi = Boolean(import.meta.env.VITE_API_BASE_URL);
let authHandlers: ApiAuthHandlers | null = null;

export function configureApiAuth(handlers: ApiAuthHandlers) {
    authHandlers = handlers;
}

function configureErrors(client: AxiosInstance, protectedRequests: boolean) {
    client.interceptors.response.use((response) => response, (error: unknown) => {
        if (!axios.isAxiosError(error)) return Promise.reject(error);
        const status = error.response?.status ?? 0;
        const sentToken = error.config?.headers.get("Authorization");
        const currentToken = authHandlers?.getToken();
        // No refresh endpoint exists. Ignore late 401s from an older session.
        if (protectedRequests && status === 401 && currentToken && sentToken === `Bearer ${currentToken}`) {
            authHandlers?.onUnauthorized();
        }
        const body: unknown = error.response?.data;
        const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string" && body.message.trim()
            ? body.message
            : status === 0
                ? error.code === "ECONNABORTED"
                    ? "Máy chủ phản hồi quá lâu. Vui lòng thử lại."
                    : "Không kết nối được server. Kiểm tra kết nối, địa chỉ Auth Service và cấu hình CORS."
                : status === 401
                    ? "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
                    : `Yêu cầu thất bại (${status}). Vui lòng thử lại.`;
        return Promise.reject(new ApiError(message, status));
    });
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
    timeout: 10000,
});
api.interceptors.request.use((config) => {
    const token = authHandlers?.getToken();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    return config;
});
configureErrors(api, true);

// Auth goes directly to auth-service until the gateway implements Auth routing.
// Public login/register requests must not carry a stale Authorization header.
export const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_BASE_URL,
    timeout: 10000,
});
authApi.interceptors.request.use((config) => {
    if (!config.baseURL) throw new ApiError("Chưa cấu hình VITE_AUTH_API_BASE_URL cho Auth Service.", 0);
    return config;
});
configureErrors(authApi, false);

export default api;
