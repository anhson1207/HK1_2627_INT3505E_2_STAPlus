import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    workers: 2,
    retries: 0,
    reporter: "list",
    use: {
        baseURL: "http://127.0.0.1:4179",
        browserName: "chromium",
        channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
        trace: "retain-on-failure",
    },
    webServer: {
        command: "npm run dev -- --host 127.0.0.1 --port 4179 --strictPort",
        url: "http://127.0.0.1:4179",
        reuseExistingServer: false,
        env: { VITE_AUTH_API_BASE_URL: "http://localhost:8081" },
    },
});
