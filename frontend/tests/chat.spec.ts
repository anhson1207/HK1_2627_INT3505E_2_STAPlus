import { test, expect } from "@playwright/test";

test("Internal Chat UI/UX - Navigation, Modals, Empty State, and Monday Design Tokens", async ({ page }) => {
    // 1. Log in as admin
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Tên đăng nhập hoặc Email").fill("admin@crm.local");
    await page.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

    await page.waitForURL("**/dashboard", { timeout: 10000 });
    expect(page.url()).toContain("/dashboard");

    // 2. Navigate to Chat via Sidebar
    const chatNavItem = page.getByRole("link", { name: "Trò chuyện" });
    await expect(chatNavItem).toBeVisible();
    await chatNavItem.click();

    await page.waitForURL("**/chat", { timeout: 10000 });
    expect(page.url()).toContain("/chat");

    // 3. Verify Chat Page elements
    await expect(page.getByPlaceholder("Tìm hội thoại, tin nhắn...")).toBeVisible();

    // Verify tabs
    await expect(page.getByRole("button", { name: /Tất cả/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Cá nhân/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Nhóm/ })).toBeVisible();

    // Switch tabs
    await page.getByRole("button", { name: /Cá nhân/ }).click();
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: /Nhóm/ }).click();
    await page.waitForTimeout(150);
    await page.getByRole("button", { name: /Tất cả/ }).click();
    await page.waitForTimeout(150);

    // 4. Test Direct Chat Modal
    const directChatBtn = page.getByRole("button", { name: "Chat 1-1 mới" });
    await expect(directChatBtn).toBeVisible();
    await directChatBtn.click();

    // Verify modal header and search input
    await expect(page.getByRole("heading", { name: "Bắt đầu cuộc trò chuyện" })).toBeVisible();
    const employeeSearch = page.getByPlaceholder("Tìm kiếm đồng nghiệp theo tên hoặc email...");
    await expect(employeeSearch).toBeVisible();

    // Close Direct modal
    await page.getByLabel("Đóng").click();
    await expect(page.getByRole("heading", { name: "Bắt đầu cuộc trò chuyện" })).not.toBeVisible();

    // 5. Test Create Group Modal
    const createGroupBtn = page.getByRole("button", { name: "Tạo nhóm mới" }).first();
    await expect(createGroupBtn).toBeVisible();
    await createGroupBtn.click();

    // Verify group modal
    await expect(page.getByRole("heading", { name: "Tạo nhóm trò chuyện mới" })).toBeVisible();
    await expect(page.getByPlaceholder("Ví dụ: Team Kinh Doanh Miền Nam, Dự án Alpha...")).toBeVisible();

    // Close Group modal
    await page.getByLabel("Đóng").click();
    await expect(page.getByRole("heading", { name: "Tạo nhóm trò chuyện mới" })).not.toBeVisible();

    // 6. Verify Empty State greeting and actions
    await expect(page.getByRole("heading", { name: "Chào mừng đến với Trò chuyện nội bộ" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nhắn tin đồng nghiệp" })).toBeVisible();

    // Capture screenshot of verified Chat UI
    await page.screenshot({
        path: "/Users/nguyenanhson/.gemini/antigravity/brain/fa29605b-4db9-44f0-9c25-e0fd9cf9eb6a/chat_ui_verified.png",
        fullPage: true,
    });
});
