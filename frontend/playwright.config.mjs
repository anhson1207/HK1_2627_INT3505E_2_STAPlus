import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    workers: 2,
    retries: 0,
    reporter: "list",
    use: {
        baseURL: "http://localhost:5173",
        browserName: "chromium",
        channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
        trace: "retain-on-failure",
    },
    webServer: {
        command: "npm run dev -- --host 127.0.0.1 --port 5173",
        url: "http://localhost:5173",
        reuseExistingServer: true,
        env: { VITE_AUTH_API_BASE_URL: "http://localhost:8081" },
    },
});
