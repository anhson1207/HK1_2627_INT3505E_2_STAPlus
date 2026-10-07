type QueryValue = string | number | boolean | null | undefined;

interface RequestConfig {
    params?: Record<string, QueryValue>;
}

interface ApiResponse<T> {
    data: T;
}

interface ApiAuthHandlers {
    getAccessToken: () => string | null;
    refreshAccessToken: () => Promise<string>;
    onUnauthorized: () => void;
}

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export const hasConfiguredApi = Boolean(import.meta.env.VITE_API_BASE_URL);
const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1").replace(/\/$/, "");
let authHandlers: ApiAuthHandlers | null = null;
let refreshRequest: Promise<string> | null = null;

export function configureApiAuth(handlers: ApiAuthHandlers) {
    authHandlers = handlers;
}

async function refreshAccessTokenOnce() {
    if (!authHandlers) throw new Error("Auth handlers chưa được cấu hình");
    if (!refreshRequest) {
        refreshRequest = authHandlers.refreshAccessToken().finally(() => {
            refreshRequest = null;
        });
    }
    return refreshRequest;
}

async function request<T>(path: string, init?: RequestInit, config?: RequestConfig, hasRetried = false): Promise<ApiResponse<T>> {
    const url = new URL(`${baseUrl}${path}`);
    Object.entries(config?.params ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, String(value));
        }
    });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
        const headers = new Headers(init?.headers);
        headers.set("Content-Type", "application/json");
        const accessToken = authHandlers?.getAccessToken();
        if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

        const response = await fetch(url, {
            ...init,
            headers,
            signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") ?? "";
        const body = response.status === 204
            ? undefined
            : contentType.includes("application/json")
                ? await response.json()
                : await response.text();

        if (response.status === 401 && !hasRetried && authHandlers && !path.startsWith("/auth/")) {
            try {
                await refreshAccessTokenOnce();
                return request<T>(path, init, config, true);
            } catch {
                authHandlers.onUnauthorized();
                throw new ApiError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
            }
        }

        if (!response.ok) {
            const message = typeof body === "object" && body && "message" in body
                ? String(body.message)
                : `Yêu cầu thất bại (${response.status})`;
            throw new ApiError(message, response.status);
        }

        return { data: body as T };
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new Error("Máy chủ phản hồi quá lâu. Vui lòng thử lại.", { cause: error });
        }
        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

const api = {
    get: <T>(path: string, config?: RequestConfig) => request<T>(path, undefined, config),
    post: <T>(path: string, data?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(data) }),
    put: <T>(path: string, data?: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
    patch: <T>(path: string, data?: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
    delete: <T = void>(path: string) => request<T>(path, { method: "DELETE" }),
};

export default api;
