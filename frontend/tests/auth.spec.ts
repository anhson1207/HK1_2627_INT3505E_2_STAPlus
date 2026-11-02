import { expect, test, type Page, type Route } from "@playwright/test";

// Contract/UI tests only. Responses are intercepted in isolated browser contexts;
// they are NOT evidence that the current backend supports username login or CORS.
const authOrigin = "http://localhost:8081";
const storageKey = "crm-soa.auth.backend.v1";
const fixture = { token: "test-only-token", username: "test.sales", role: "SALES", message: "Login successful" };
const credential = { username: "test.sales", password: "a" };

async function reply(route: Route, body: unknown, status = 200) {
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

async function fillLogin(page: Page) {
    await page.getByLabel("Tên đăng nhập", { exact: true }).fill(credential.username);
    await page.getByLabel("Mật khẩu", { exact: true }).fill(credential.password);
}

async function submitLogin(page: Page) {
    await fillLogin(page);
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
}

test.beforeEach(async ({ page }) => {
    // Prevent accidental calls to a real Auth service from the test suite.
    await page.route("**/api/auth/**", (route) => route.abort());
});

test("anonymous protected routes redirect; unsupported Auth UI is removed", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("input")).toHaveCount(2);
    await expect(page.getByText(/Google|Quên mật khẩu|xác nhận email/i)).toHaveCount(0);
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await expect(page.getByText("Vui lòng nhập tên đăng nhập")).toBeVisible();
    await expect(page.getByText("Vui lòng nhập mật khẩu")).toBeVisible();
});

test("register validates confirmation, sends only DTO fields, prevents duplicates, then goes to login", async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const requests: unknown[] = [];
    await page.route(authOrigin + "/api/auth/register", async (route) => {
        requests.push(route.request().postDataJSON());
        expect(route.request().headers().authorization).toBeUndefined();
        await gate;
        await reply(route, { token: null, username: credential.username, role: "SALES", message: "Register successful" });
    });
    await page.goto("/register");
    await expect(page.locator("input")).toHaveCount(4);
    await page.getByLabel("Tên đăng nhập", { exact: true }).fill(credential.username);
    await page.getByLabel("Email", { exact: true }).fill("test@example.com");
    await page.getByLabel("Mật khẩu", { exact: true }).fill("a");
    await page.getByLabel("Xác nhận mật khẩu", { exact: true }).fill("b");
    await page.getByRole("button", { name: "Đăng ký", exact: true }).click();
    await expect(page.getByText("Mật khẩu xác nhận không khớp")).toBeVisible();
    expect(requests).toHaveLength(0);
    await page.getByLabel("Xác nhận mật khẩu", { exact: true }).fill("a");
    await page.getByRole("button", { name: "Đăng ký", exact: true }).click();
    await expect(page.getByRole("button", { name: "Đang đăng ký..." })).toBeDisabled();
    // Attempt another native submit while the first operation is pending.
    await page.locator("form").dispatchEvent("submit");
    release();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("alert")).toContainText("Đăng ký thành công");
    await expect(page.getByLabel("Tên đăng nhập", { exact: true })).toHaveValue(credential.username);
    expect(requests).toEqual([{ username: credential.username, email: "test@example.com", password: "a" }]);
    expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
});

for (const role of ["ADMIN", "SALES", "MANAGER"]) {
    test(role + ": login, reload, role route and local logout without extra Auth calls", async ({ page }) => {
        const authRequests: string[] = [];
        page.on("request", (request) => {
            if (request.url().includes("/api/auth/")) authRequests.push(request.url());
        });
        await page.route(authOrigin + "/api/auth/login", async (route) => {
            expect(route.request().postDataJSON()).toEqual(credential);
            expect(route.request().headers().authorization).toBeUndefined();
            await reply(route, { ...fixture, role });
        });
        await page.goto("/login");
        await submitLogin(page);
        await expect(page).toHaveURL(/\/dashboard$/);
        const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
        expect(saved).toEqual({ token: fixture.token, user: { username: fixture.username, role } });
        await page.reload();
        await expect(page).toHaveURL(/\/dashboard$/);
        await expect(page.getByRole("button", { name: "Mở menu người dùng" })).toContainText(fixture.username);
        await page.goto("/tickets");
        await expect(page).toHaveURL(role === "SALES" ? /\/dashboard$/ : /\/tickets$/);
        await page.getByRole("button", { name: "Mở menu người dùng" }).click();
        await page.getByRole("menuitem", { name: "Đăng xuất", exact: true }).click();
        await expect(page).toHaveURL(/\/login$/);
        expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
        await page.goto("/dashboard");
        await expect(page).toHaveURL(/\/login$/);
        expect(authRequests).toEqual([authOrigin + "/api/auth/login"]);
    });
}

test("login loading does not unmount form and suppresses duplicate requests", async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    let count = 0;
    await page.route(authOrigin + "/api/auth/login", async (route) => {
        count += 1;
        await gate;
        await reply(route, { message: "Invalid password", status: 401 }, 401);
    });
    await page.goto("/login");
    await submitLogin(page);
    await expect(page.getByRole("button", { name: "Đang đăng nhập..." })).toBeDisabled();
    await expect(page.getByLabel("Tên đăng nhập", { exact: true })).toBeDisabled();
    await page.locator("form").dispatchEvent("submit");
    release();
    await expect(page.getByRole("alert")).toContainText("Invalid password");
    await expect(page.getByRole("button", { name: "Đăng nhập", exact: true })).toBeEnabled();
    expect(count).toBe(1);
});

for (const [status, message] of [[401, "Invalid password"], [404, "User not found"], [500, "Internal server error"]] as const) {
    test("login displays backend error " + status + " without saving a session", async ({ page }) => {
        await page.route(authOrigin + "/api/auth/login", (route) => reply(route, { message, status }, status));
        await page.goto("/login");
        await submitLogin(page);
        await expect(page.getByRole("alert")).toContainText(message);
        await expect(page).toHaveURL(/\/login$/);
        expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
    });
}

test("register duplicate email shows the backend message", async ({ page }) => {
    await page.route(authOrigin + "/api/auth/register", (route) => reply(route, { message: "Email already exists", status: 400 }, 400));
    await page.goto("/register");
    await fillLogin(page);
    await page.getByLabel("Email", { exact: true }).fill("test@example.com");
    await page.getByLabel("Xác nhận mật khẩu", { exact: true }).fill("a");
    await page.getByRole("button", { name: "Đăng ký", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Email already exists");
    await expect(page).toHaveURL(/\/register$/);
});

test("network failure produces a visible actionable error", async ({ page }) => {
    await page.goto("/login");
    await submitLogin(page);
    await expect(page.getByRole("alert")).toContainText("Không kết nối được server");
    await expect(page.getByRole("button", { name: "Đăng nhập", exact: true })).toBeEnabled();
});

for (const body of [{ ...fixture, token: "" }, { ...fixture, role: "UNKNOWN" }, { username: "test" }]) {
    test("rejects incomplete or unsupported login response " + JSON.stringify(body), async ({ page }) => {
        await page.route(authOrigin + "/api/auth/login", (route) => reply(route, body));
        await page.goto("/login");
        await submitLogin(page);
        await expect(page.getByRole("alert")).toContainText("Phản hồi đăng nhập không hợp lệ");
        expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
    });
}

for (const stored of ["invalid-json", JSON.stringify({ token: "", user: { username: "test", role: "SALES" } }), JSON.stringify({ token: "test", user: { username: "test", role: "UNKNOWN" } })]) {
    test("malformed saved session cannot enter CRM " + stored, async ({ page }) => {
        await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: stored });
        await page.goto("/dashboard");
        await expect(page).toHaveURL(/\/login$/);
    });
}

test("legacy persisted mock session is not restored", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("crm-soa.auth.v2", JSON.stringify({ state: { isAuthenticated: true, user: { role: "ADMIN" }, accessToken: "legacy" } })));
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
});

test("protected Axios request attaches Bearer and clears session on 401 without retry", async ({ page }) => {
    let calls = 0;
    await page.route(authOrigin + "/api/auth/login", (route) => reply(route, fixture));
    await page.route("http://localhost:8080/api/v1/leads/1", async (route) => {
        calls += 1;
        expect(route.request().headers().authorization).toBe("Bearer " + fixture.token);
        await reply(route, { message: "Unauthorized" }, 401);
    });
    await page.goto("/login");
    await submitLogin(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.evaluate(async () => {
        const modulePath = "/src/services/api.ts";
        const { default: api } = await import(modulePath);
        await api.get("/leads/1").catch(() => undefined);
    });
    await expect(page).toHaveURL(/\/login$/);
    expect(calls).toBe(1);
    expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
});

test("late protected 401 from a previous token does not clear the new session", async ({ page }) => {
    await page.route(authOrigin + "/api/auth/login", (route) => reply(route, fixture));
    await page.goto("/login");
    await submitLogin(page);
    await expect(page).toHaveURL(/\/dashboard$/);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    await page.route("http://localhost:8080/api/v1/leads/1", async (route) => {
        await gate;
        await reply(route, { message: "Unauthorized" }, 401);
    });
    const requestSent = page.waitForRequest("http://localhost:8080/api/v1/leads/1");
    const pending = page.evaluate(async () => {
        const modulePath = "/src/services/api.ts";
        const { default: api } = await import(modulePath);
        await api.get("/leads/1").catch(() => undefined);
    });
    await requestSent;
    await page.evaluate(async () => {
        const modulePath = "/src/stores/authStore.ts";
        const { useAuthStore } = await import(modulePath);
        useAuthStore.setState({ token: "new-test-token" });
    });
    release();
    await pending;
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).not.toBeNull();
});

test("mobile forms retain spacing and fit the viewport", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/register");
    const boxes = await page.locator(".MuiFormControl-root").evaluateAll((items) => items.map((item) => {
        const box = item.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom };
    }));
    for (let index = 1; index < boxes.length; index++) expect(boxes[index].top - boxes[index - 1].bottom).toBeGreaterThanOrEqual(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("register-mobile.png"), fullPage: true });
});
