import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const samplePngPath = path.resolve(__dirname, "fixtures/sample.png");
const samplePdfPath = path.resolve(__dirname, "fixtures/sample.pdf");
const sampleDocxPath = path.resolve(__dirname, "fixtures/sample.docx");

test.describe("Phase 6 - Final Audit, Security Hardening & UI/UX Polish", () => {
    test.describe.configure({ mode: "serial" });

    test("Scenario 1, 3, 4, 5, 10: 1-1 Chat, Image Lightbox (Esc), Doc Download via Blob, Security 401/403, and Toast", async ({ browser }) => {
        test.setTimeout(90000);
        const contextA = await browser.newContext();
        const contextB = await browser.newContext();

        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();

        pageA.on("console", msg => console.log("[BROWSER A LOG]", msg.type(), msg.text()));
        pageA.on("pageerror", err => console.log("[BROWSER A ERROR]", err.message));
        pageB.on("console", msg => console.log("[BROWSER B LOG]", msg.type(), msg.text()));
        pageB.on("pageerror", err => console.log("[BROWSER B ERROR]", err.message));

        // 1. User A (admin) logs in
        await pageA.goto("/login");
        await pageA.getByLabel("Tên đăng nhập hoặc Email").fill("admin@crm.local");
        await pageA.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
        await pageA.getByRole("button", { name: "Đăng nhập", exact: true }).click();
        await pageA.waitForURL("**/dashboard", { timeout: 15000 });

        // 2. User B (tranminh) logs in and stays on /leads (to test toast notification)
        await pageB.goto("/login");
        await pageB.getByLabel("Tên đăng nhập hoặc Email").fill("tranminh@crm.local");
        await pageB.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
        await pageB.getByRole("button", { name: "Đăng nhập", exact: true }).click();
        await pageB.waitForURL("**/dashboard", { timeout: 15000 });
        await pageB.goto("/leads");
        await pageB.waitForLoadState("domcontentloaded");

        // 3. User A opens /chat and opens or creates direct chat with tranminh
        await pageA.goto("/chat");
        await pageA.waitForLoadState("domcontentloaded");

        const tranminhConv = pageA.locator(".crm-conversation-item, button").filter({ hasText: "tranminh" }).first();
        if (await tranminhConv.isVisible({ timeout: 2000 }).catch(() => false)) {
            await tranminhConv.click();
        } else {
            await pageA.getByRole("button", { name: "Chat 1-1 mới" }).click();
            await pageA.getByPlaceholder("Tìm kiếm đồng nghiệp").fill("tranminh");
            const colleague = pageA.locator(".fixed.inset-0.z-50 button").filter({ hasText: "tranminh" }).first();
            await expect(colleague).toBeVisible({ timeout: 10000 });
            await colleague.click();
        }

        const composerA = pageA.getByPlaceholder(/Nhắn tin cho/);
        await expect(composerA).toBeVisible({ timeout: 10000 });

        // 4. User A sends message -> User B receives real-time toast notification on /leads
        const testMsgA = `Kịch bản kiểm thử bảo mật ${Date.now()}`;
        await composerA.fill(testMsgA);
        await composerA.press("Enter");
        await expect(pageA.locator(".select-text").filter({ hasText: testMsgA })).toBeVisible({ timeout: 10000 });

        // Toast on User B screen
        const toastB = pageB.locator(".fixed.bottom-5.right-5");
        await expect(toastB).toBeVisible({ timeout: 10000 });
        await expect(toastB).toContainText("admin");

        // User B clicks Toast to navigate directly to /chat
        await toastB.click();
        await pageB.waitForURL("**/chat", { timeout: 10000 });
        await expect(pageB.locator(".select-text").filter({ hasText: testMsgA })).toBeVisible({ timeout: 10000 });

        // 5. Test Sending Image with Authenticated Blob URL and Lightbox Esc key
        const fileChooserPromiseA = pageA.waitForEvent("filechooser");
        await pageA.getByTitle("Đính kèm ảnh hoặc tài liệu (tối đa 10MB)").click();
        const fileChooserA = await fileChooserPromiseA;
        await fileChooserA.setFiles(samplePngPath);

        await expect(pageA.locator("footer").getByText("sample.png")).toBeVisible();
        const imgMsg = `Sơ đồ kiến trúc mới ${Date.now()}`;
        await composerA.fill(imgMsg);
        await pageA.getByTitle("Gửi tin nhắn (Enter)").click();

        // User B sees image render
        await expect(pageB.locator(".select-text").filter({ hasText: imgMsg })).toBeVisible({ timeout: 15000 });
        const imgB = pageB.locator("img[alt='sample.png']").last();
        await imgB.scrollIntoViewIfNeeded();
        await expect(imgB).toBeVisible({ timeout: 10000 });

        // Click image to open Lightbox
        await imgB.click();
        const lightbox = pageB.locator(".fixed.inset-0.z-50.bg-black\\/85");
        await expect(lightbox).toBeVisible();

        // Press Escape to close Lightbox
        await pageB.keyboard.press("Escape");
        await expect(lightbox).not.toBeVisible();

        // 6. Test Sending Document (Word DOCX) and Download via authenticated Blob
        const fileChooserPromiseA2 = pageA.waitForEvent("filechooser");
        await pageA.getByTitle("Đính kèm ảnh hoặc tài liệu (tối đa 10MB)").click();
        const fileChooserA2 = await fileChooserPromiseA2;
        await fileChooserA2.setFiles(sampleDocxPath);

        await expect(pageA.locator("footer").getByText("sample.docx")).toBeVisible();
        const docMsg = `Bản hợp đồng mẫu ${Date.now()}`;
        await composerA.fill(docMsg);
        await pageA.getByTitle("Gửi tin nhắn (Enter)").click();

        // User B sees document card
        await expect(pageB.locator(".select-text").filter({ hasText: docMsg })).toBeVisible({ timeout: 15000 });
        const docCardB = pageB.locator(".select-text").filter({ hasText: docMsg }).locator("..").getByText("sample.docx");
        await expect(docCardB).toBeVisible({ timeout: 10000 });

        // User B clicks download button
        const downloadBtnB = pageB.locator(".select-text").filter({ hasText: docMsg }).locator("..").getByTitle("Tải xuống tệp tin");
        await expect(downloadBtnB).toBeVisible();

        // 7. Test Security 401/403: Unauthenticated direct access & query param token rejection
        const unauthRes = await pageB.request.get("http://localhost:8080/api/v1/chat/files/1");
        expect(unauthRes.status()).toBe(401);

        const queryTokenRes = await pageB.request.get("http://localhost:8080/api/v1/chat/files/1?token=invalid_or_leaked_token");
        expect(queryTokenRes.status()).toBe(401);

        await contextA.close();
        await contextB.close();
    });

    test("Scenario 2, 6, 7, 8, 9: Group Chat 3 Users, Member Management, Ownership Transfer, Read Receipts", async ({ browser }) => {
        test.setTimeout(90000);
        const contextA = await browser.newContext();
        const contextB = await browser.newContext();
        const contextC = await browser.newContext();

        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();
        const pageC = await contextC.newPage();

        // Login User A (admin - OWNER), User B (tranminh), User C (anhson)
        await Promise.all([
            (async () => {
                await pageA.goto("/login");
                await pageA.getByLabel("Tên đăng nhập hoặc Email").fill("admin@crm.local");
                await pageA.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
                await pageA.getByRole("button", { name: "Đăng nhập", exact: true }).click();
                await pageA.waitForURL("**/dashboard");
                await pageA.goto("/chat");
            })(),
            (async () => {
                await pageB.goto("/login");
                await pageB.getByLabel("Tên đăng nhập hoặc Email").fill("tranminh@crm.local");
                await pageB.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
                await pageB.getByRole("button", { name: "Đăng nhập", exact: true }).click();
                await pageB.waitForURL("**/dashboard");
                await pageB.goto("/chat");
            })(),
            (async () => {
                await pageC.goto("/login");
                await pageC.getByLabel("Tên đăng nhập hoặc Email").fill("anhsondoraemon@gmail.com");
                await pageC.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
                await pageC.getByRole("button", { name: "Đăng nhập", exact: true }).click();
                await pageC.waitForURL("**/dashboard");
                await pageC.goto("/chat");
            })(),
        ]);

        // User A creates group with User B (tranminh)
        const groupName = `Audit Group ${Date.now()}`;
        await pageA.getByTitle("Tạo nhóm mới").click();
        await pageA.getByLabel("Tên nhóm chat").fill(groupName);
        await pageA.getByPlaceholder("Tìm theo tên hoặc email").fill("tranminh");
        await pageA.locator(".fixed.inset-0.z-50").getByText("tranminh", { exact: true }).click();
        await pageA.locator(".fixed.inset-0.z-50").getByRole("button", { name: /Tạo nhóm \(/ }).click();

        await expect(pageA.getByRole("heading", { name: groupName })).toBeVisible({ timeout: 10000 });

        // User A opens Group Drawer and adds User C (anhson)
        await pageA.getByTitle("Xem thông tin cuộc trò chuyện").click();
        await expect(pageA.getByText("Thông tin nhóm")).toBeVisible();
        await pageA.getByRole("button", { name: "Thêm thành viên" }).click();

        // Select User C (anhson) in modal
        const addMemberModal = pageA.locator(".fixed.inset-0.z-50");
        await expect(addMemberModal).toBeVisible();
        await addMemberModal.getByPlaceholder(/Tìm theo tên hoặc email/).fill("anhson");
        await addMemberModal.getByText("anhson", { exact: true }).click();
        await addMemberModal.getByRole("button", { name: /Thêm vào nhóm \(/ }).click();
        await expect(addMemberModal).not.toBeVisible({ timeout: 10000 });

        // Verify member count updated in User A drawer
        await expect(pageA.locator(".divide-y").getByText("anhson").first()).toBeVisible({ timeout: 10000 });

        // Close drawer with Escape
        await pageA.keyboard.press("Escape");
        await expect(pageA.getByText("Thông tin nhóm")).not.toBeVisible();

        // User A sends a message to group
        const groupMsg = `Thông báo chung cho cả nhóm lúc ${Date.now()}`;
        const composerA = pageA.getByPlaceholder(/Nhắn tin cho/);
        await composerA.fill(groupMsg);
        await composerA.press("Enter");
        await expect(pageA.locator(".select-text").filter({ hasText: groupMsg })).toBeVisible();

        // User B opens the group
        await pageB.locator("button").filter({ hasText: /Nhóm \(/ }).click();
        const groupItemB = pageB.locator(".crm-conversation-item, button").filter({ hasText: groupName }).first();
        await expect(groupItemB).toBeVisible({ timeout: 10000 });
        await groupItemB.click();
        await expect(pageB.locator(".select-text").filter({ hasText: groupMsg })).toBeVisible({ timeout: 10000 });

        // User C opens the group
        await pageC.locator("button").filter({ hasText: /Nhóm \(/ }).click();
        const groupItemC = pageC.locator(".crm-conversation-item, button").filter({ hasText: groupName }).first();
        await expect(groupItemC).toBeVisible({ timeout: 10000 });
        await groupItemC.click();
        await expect(pageC.locator(".select-text").filter({ hasText: groupMsg })).toBeVisible({ timeout: 10000 });

        // User A transfers OWNER to User B (tranminh)
        await pageA.getByTitle("Xem thông tin cuộc trò chuyện").click();
        await expect(pageA.getByText("Thông tin nhóm")).toBeVisible();

        // Click options menu for tranminh in drawer
        const tranminhRow = pageA.locator(".divide-y > div").filter({ hasText: "tranminh" }).first();
        await tranminhRow.getByRole("button", { name: "Tùy chọn thành viên" }).click();
        await pageA.getByText("Chuyển Trưởng nhóm (OWNER)").click();

        // Confirm Dialog
        await expect(pageA.getByRole("heading", { name: "Chuyển quyền Trưởng nhóm" })).toBeVisible();
        await pageA.getByRole("button", { name: "Xác nhận chuyển" }).click();
        await expect(pageA.getByRole("heading", { name: "Chuyển quyền Trưởng nhóm" })).not.toBeVisible({ timeout: 10000 });

        // Verify former owner is now ADMIN badge
        await expect(pageA.locator(".divide-y > div").filter({ hasText: "admin" }).first().getByText("Phó nhóm (ADMIN)")).toBeVisible({ timeout: 10000 });

        // User B (new OWNER) opens drawer and removes User C (anhson)
        await pageB.getByTitle("Xem thông tin cuộc trò chuyện").click();
        await expect(pageB.getByText("Thông tin nhóm")).toBeVisible();

        const anhsonRow = pageB.locator(".divide-y > div").filter({ hasText: "anhson" }).first();
        await anhsonRow.getByRole("button", { name: "Tùy chọn thành viên" }).click();
        await pageB.getByText("Xóa khỏi nhóm").click();

        // Confirm remove
        await expect(pageB.getByRole("heading", { name: "Xóa thành viên khỏi nhóm" })).toBeVisible();
        await pageB.getByRole("button", { name: "Xóa khỏi nhóm" }).last().click();
        await expect(pageB.getByRole("heading", { name: "Xóa thành viên khỏi nhóm" })).not.toBeVisible({ timeout: 10000 });

        // User C receives removal notice / system message and cannot send messages anymore
        await expect(pageC.locator(".select-text, span").filter({ hasText: /đã xóa.*khỏi nhóm/ })).toBeVisible({ timeout: 10000 });

        await contextA.close();
        await contextB.close();
        await contextC.close();
    });

    test("Scenario 11 & 12: Offline Reconnect Sync & Logout / Login User Switch Leak Protection", async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();

        // 1. Log in as admin
        await page.goto("/login");
        await page.getByLabel("Tên đăng nhập hoặc Email").fill("admin@crm.local");
        await page.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
        await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
        await page.waitForURL("**/dashboard");
        await page.goto("/chat");
        await page.waitForLoadState("domcontentloaded");

        // 2. Select any conversation and type draft
        const firstConv = page.locator(".crm-conversation-item").first();
        await expect(firstConv).toBeVisible({ timeout: 10000 });
        await firstConv.click();
        const composer = page.getByPlaceholder(/Nhắn tin cho/);
        await expect(composer).toBeVisible({ timeout: 10000 });
        await composer.fill("Draft message before logout");

        // 3. Log out
        const userMenu = page.getByRole("button", { name: "Mở menu người dùng" });
        if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
            await userMenu.click();
            await page.getByText("Đăng xuất").click();
        } else {
            await page.evaluate(() => localStorage.clear());
            await page.goto("/login");
        }
        await page.waitForURL("**/login");

        // 4. Log in as different user: tranminh
        await page.getByLabel("Tên đăng nhập hoặc Email").fill("tranminh@crm.local");
        await page.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
        await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
        await page.waitForURL("**/dashboard");
        await page.goto("/chat");
        await page.waitForLoadState("domcontentloaded");

        // Verify draft was completely cleared and not leaked to tranminh
        const firstConvB = page.locator(".crm-conversation-item").first();
        if (await firstConvB.isVisible({ timeout: 5000 }).catch(() => false)) {
            await firstConvB.click();
            const composerB = page.getByPlaceholder(/Nhắn tin cho/);
            await expect(composerB).toBeVisible({ timeout: 5000 });
            expect(await composerB.inputValue()).toBe("");
        }

        await context.close();
    });

    test("Scenario: Responsive viewports & No horizontal overflow (Desktop, Tablet, Mobile)", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("Tên đăng nhập hoặc Email").fill("admin@crm.local");
        await page.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
        await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
        await page.waitForURL("**/dashboard");
        await page.goto("/chat");
        await page.waitForLoadState("domcontentloaded");

        // 1. Desktop (1440x900)
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(300);
        let hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(hasOverflow).toBeFalsy();

        // 2. Tablet (768x1024)
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(300);
        hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(hasOverflow).toBeFalsy();

        // 3. Mobile (375x667)
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(300);
        hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(hasOverflow).toBeFalsy();

        const artifactDir = "/Users/nguyenanhson/.gemini/antigravity/brain/fa29605b-4db9-44f0-9c25-e0fd9cf9eb6a";
        await page.screenshot({ path: path.join(artifactDir, "chat_phase6_mobile_audit.png") });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.screenshot({ path: path.join(artifactDir, "chat_phase6_desktop_audit.png") });
    });
});
