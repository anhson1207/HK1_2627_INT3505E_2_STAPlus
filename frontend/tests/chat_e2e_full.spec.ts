import { test, expect } from "@playwright/test";

test("E2E Direct & Group Chat with Realtime and Drawers", async ({ page }) => {
    page.on("console", (msg) => console.log(`[PAGE ${msg.type().toUpperCase()}]:`, msg.text()));
    page.on("pageerror", (err) => console.log("[PAGE ERROR]:", err.message));

    // 1. Log in as admin
    await page.goto("/login");
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

    // 3. Start a Direct Chat with first colleague
    const directChatBtn = page.getByRole("button", { name: "Chat 1-1 mới" });
    await expect(directChatBtn).toBeVisible();
    await directChatBtn.click();

    // Verify modal and wait for users list
    await expect(page.getByRole("heading", { name: "Bắt đầu cuộc trò chuyện" })).toBeVisible();
    const firstColleagueBtn = page.locator(".fixed.inset-0.z-50 button").filter({ hasText: "@crm.local" }).first();
    await expect(firstColleagueBtn).toBeVisible({ timeout: 10000 });

    // Select colleague
    await firstColleagueBtn.click();
    await page.waitForTimeout(600);

    // Verify modal closed and composer visible
    await expect(page.getByRole("heading", { name: "Bắt đầu cuộc trò chuyện" })).not.toBeVisible();
    const composer = page.getByPlaceholder(/Nhắn tin cho/);
    await expect(composer).toBeVisible();

    // Send a message
    const testDirectMsg = `Tin nhắn kiểm thử 1-1 lúc ${new Date().toLocaleTimeString("vi-VN")}`;
    await composer.fill(testDirectMsg);
    await composer.press("Enter");
    await page.waitForTimeout(1000);

    // Verify message appears in viewport
    await expect(page.locator(".select-text").filter({ hasText: testDirectMsg })).toBeVisible();

    // Open Direct Info Drawer
    const infoBtn = page.getByTitle("Xem thông tin cuộc trò chuyện");
    await expect(infoBtn).toBeVisible();
    await infoBtn.click();
    await page.waitForTimeout(400);

    // Verify colleague drawer
    await expect(page.getByRole("heading", { name: "Thông tin đồng nghiệp" })).toBeVisible();

    // Take Direct Chat Screenshot
    await page.screenshot({
        path: "/Users/nguyenanhson/.gemini/antigravity/brain/fa29605b-4db9-44f0-9c25-e0fd9cf9eb6a/chat_direct_verified.png",
        fullPage: true,
    });

    // Close drawer
    await page.getByRole("heading", { name: "Thông tin đồng nghiệp" }).locator("..").getByRole("button").click();
    await page.waitForTimeout(300);

    // 4. Test Create Group Chat
    const createGroupBtn = page.getByRole("button", { name: "Tạo nhóm mới" }).first();
    await expect(createGroupBtn).toBeVisible();
    await createGroupBtn.click();

    const groupNameInput = page.getByPlaceholder("Ví dụ: Team Kinh Doanh Miền Nam, Dự án Alpha...");
    await expect(groupNameInput).toBeVisible();
    const groupName = `Ban Chuyển Đổi Số ${Date.now().toString().slice(-4)}`;
    await groupNameInput.fill(groupName);

    // Select first available member in checklist
    const memberCheckbox = page.locator("form div.cursor-pointer").first();
    await expect(memberCheckbox).toBeVisible({ timeout: 10000 });
    await memberCheckbox.click();
    await page.waitForTimeout(200);

    // Submit group creation
    const submitGroupBtn = page.getByRole("button", { name: /Tạo nhóm \(\d+ người\)/ });
    await expect(submitGroupBtn).toBeVisible();
    await submitGroupBtn.click();
    await page.waitForTimeout(1500);

    // Verify group chat header
    await expect(page.getByRole("heading", { name: new RegExp(groupName) })).toBeVisible();

    // Send message to group
    const groupComposer = page.getByPlaceholder(new RegExp(`Nhắn tin cho ${groupName}`));
    await expect(groupComposer).toBeVisible();

    const testGroupMsg = `Chào mừng các thành viên đến với ${groupName}!`;
    await groupComposer.fill(testGroupMsg);
    await groupComposer.press("Enter");
    await page.waitForTimeout(1000);

    // Verify group message
    await expect(page.locator(".select-text").filter({ hasText: testGroupMsg })).toBeVisible();

    // Open Group Info Drawer
    const groupInfoBtn = page.getByTitle("Xem thông tin cuộc trò chuyện");
    await groupInfoBtn.click();
    await page.waitForTimeout(400);

    // Verify group management drawer
    await expect(page.getByText("Thông tin nhóm")).toBeVisible();
    await expect(page.getByText("Trưởng nhóm")).toBeVisible(); // OWNER badge

    // Take Group Chat Screenshot
    await page.screenshot({
        path: "/Users/nguyenanhson/.gemini/antigravity/brain/fa29605b-4db9-44f0-9c25-e0fd9cf9eb6a/chat_group_verified.png",
        fullPage: true,
    });
});
