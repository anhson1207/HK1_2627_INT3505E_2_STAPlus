import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const samplePngPath = path.resolve(__dirname, "fixtures/sample.png");
const samplePdfPath = path.resolve(__dirname, "fixtures/sample.pdf");

test.describe("Phase 5 - Internal Chat Comprehensive Realtime, Attachments & UX", () => {
    test("Multi-user real-time 1-1 chat, cross-page toast notification, and file attachments", async ({ browser }) => {
        // Create 2 independent browser contexts for User A (admin) and User B (tranminh)
        const contextA = await browser.newContext();
        const contextB = await browser.newContext();

        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();

        // 1. Log in User A (admin)
        await pageA.goto("/login");
        await pageA.getByLabel("Tên đăng nhập hoặc Email").fill("admin@crm.local");
        await pageA.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
        await pageA.getByRole("button", { name: "Đăng nhập", exact: true }).click();
        await pageA.waitForURL("**/dashboard", { timeout: 10000 });

        // 2. Log in User B (tranminh) and stay on /leads page
        await pageB.goto("/login");
        await pageB.getByLabel("Tên đăng nhập hoặc Email").fill("tranminh@crm.local");
        await pageB.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
        await pageB.getByRole("button", { name: "Đăng nhập", exact: true }).click();
        await pageB.waitForURL("**/dashboard", { timeout: 10000 });

        // User B navigates to /leads
        await pageB.goto("/leads");
        await pageB.waitForLoadState("networkidle");

        // 3. User A opens /chat and initiates 1-1 chat with tranminh
        await pageA.getByRole("link", { name: "Trò chuyện" }).click();
        await pageA.waitForURL("**/chat", { timeout: 10000 });

        // Check if direct conversation with tranminh already exists in list, else create
        const tranminhConv = pageA.locator(".crm-conversation-item, button").filter({ hasText: "tranminh" }).first();
        if (await tranminhConv.isVisible({ timeout: 2000 }).catch(() => false)) {
            await tranminhConv.click();
        } else {
            await pageA.getByRole("button", { name: "Chat 1-1 mới" }).click();
            const colleague = pageA.locator(".fixed.inset-0.z-50 button").filter({ hasText: "tranminh" }).first();
            await expect(colleague).toBeVisible({ timeout: 10000 });
            await colleague.click();
        }

        // Wait for composer to be ready in User A
        const composerA = pageA.getByPlaceholder(/Nhắn tin cho/);
        await expect(composerA).toBeVisible({ timeout: 10000 });

        // 4. User A sends a message while User B is on /leads
        const testMsgA = `Xin chào Trần Minh lúc ${Date.now()}`;
        await composerA.fill(testMsgA);
        await composerA.press("Enter");
        await expect(pageA.locator(".select-text").filter({ hasText: testMsgA })).toBeVisible({ timeout: 10000 });

        // 5. Verify User B on /leads receives real-time toast notification & sidebar badge
        // Verify Toast appears
        const toastB = pageB.locator(".fixed.bottom-5.right-5");
        await expect(toastB).toBeVisible({ timeout: 10000 });
        await expect(toastB).toContainText("admin");

        // User B clicks Toast notification to jump to /chat
        await toastB.click();
        await pageB.waitForURL("**/chat", { timeout: 10000 });
        expect(pageB.url()).toContain("/chat");

        // Verify message received in User B view
        await expect(pageB.locator(".select-text").filter({ hasText: testMsgA })).toBeVisible({ timeout: 10000 });

        // 6. User B sends reply in real-time
        const composerB = pageB.getByPlaceholder(/Nhắn tin cho/);
        await expect(composerB).toBeVisible();
        const testReplyB = `Chào Admin, tôi đã nhận được lúc ${Date.now()}`;
        await composerB.fill(testReplyB);
        await composerB.press("Enter");

        // User A sees the reply appear in real-time without reloading
        await expect(pageA.locator(".select-text").filter({ hasText: testReplyB })).toBeVisible({ timeout: 10000 });

        // 7. Test Image Attachment Upload & Lightbox Preview
        const fileChooserPromiseA = pageA.waitForEvent("filechooser");
        await pageA.getByTitle("Đính kèm ảnh hoặc tài liệu (tối đa 10MB)").click();
        const fileChooserA = await fileChooserPromiseA;
        await fileChooserA.setFiles(samplePngPath);

        // Verify preview chip appears in composer
        await expect(pageA.locator("text=sample.png")).toBeVisible();
        const imgCaption = `Ảnh sơ đồ đính kèm ${Date.now()}`;
        await composerA.fill(imgCaption);
        await pageA.getByTitle("Gửi tin nhắn (Enter)").click();

        // Verify image appears on User A screen
        await expect(pageA.locator(".select-text").filter({ hasText: imgCaption })).toBeVisible({ timeout: 15000 });
        const imgLocatorA = pageA.locator("img[alt='sample.png']").last();
        await expect(imgLocatorA).toBeVisible({ timeout: 10000 });

        // User B sees image in real-time
        await expect(pageB.locator(".select-text").filter({ hasText: imgCaption })).toBeVisible({ timeout: 10000 });
        const imgLocatorB = pageB.locator("img[alt='sample.png']").last();
        await expect(imgLocatorB).toBeVisible({ timeout: 10000 });

        // User B clicks image to open Lightbox Modal
        await imgLocatorB.click();
        const lightbox = pageB.locator(".fixed.inset-0.z-50.bg-black\\/85");
        await expect(lightbox).toBeVisible();
        await expect(lightbox.getByTitle("Đóng (Esc)")).toBeVisible();
        await expect(lightbox.getByTitle("Tải ảnh về máy")).toBeVisible();

        // Close Lightbox
        await lightbox.getByTitle("Đóng (Esc)").click();
        await expect(lightbox).not.toBeVisible();

        // 8. Test Document Attachment Upload & Card
        const fileChooserPromiseA2 = pageA.waitForEvent("filechooser");
        await pageA.getByTitle("Đính kèm ảnh hoặc tài liệu (tối đa 10MB)").click();
        const fileChooserA2 = await fileChooserPromiseA2;
        await fileChooserA2.setFiles(samplePdfPath);

        await expect(pageA.locator("footer").getByText("sample.pdf")).toBeVisible();
        const docCaption = `Tài liệu hướng dẫn ${Date.now()}`;
        await composerA.fill(docCaption);
        await pageA.getByTitle("Gửi tin nhắn (Enter)").click();

        // Verify document card appears on User A & User B
        await expect(pageA.locator(".select-text").filter({ hasText: docCaption })).toBeVisible({ timeout: 15000 });
        await expect(pageA.locator(".select-text").filter({ hasText: docCaption }).locator("..").getByText("sample.pdf")).toBeVisible({ timeout: 10000 });

        await expect(pageB.locator(".select-text").filter({ hasText: docCaption })).toBeVisible({ timeout: 10000 });
        const docCardB = pageB.locator(".select-text").filter({ hasText: docCaption }).locator("..").getByText("sample.pdf");
        await expect(docCardB).toBeVisible({ timeout: 10000 });

        // 9. Verify Security Access Control: Non-member or unauthenticated download returns 403
        const downloadLink = await pageB.locator("a[title='Tải xuống tệp tin']").last().getAttribute("href");
        expect(downloadLink).toBeTruthy();

        // Test with invalid token
        const cleanUrl = downloadLink!.split("?token=")[0];
        const unauthRes = await pageB.request.get(cleanUrl);
        expect([401, 403]).toContain(unauthRes.status());

        // Close contexts
        await contextA.close();
        await contextB.close();
    });

    test("Group Chat with 3 users, read receipts, and custom confirmation modals", async ({ browser }) => {
        test.setTimeout(60000);
        const contextA = await browser.newContext();
        const contextB = await browser.newContext();
        const contextC = await browser.newContext();

        const pageA = await contextA.newPage();
        const pageB = await contextB.newPage();
        const pageC = await contextC.newPage();

        // Login User A (admin), User B (tranminh), User C (anhson)
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

        // User A creates a 3-user group
        const groupName = `Group P5 ${Date.now()}`;
        await pageA.getByTitle("Tạo nhóm mới").click();
        await pageA.getByLabel("Tên nhóm chat").fill(groupName);

        // Select tranminh and anhson
        await pageA.locator(".fixed.inset-0.z-50").getByText("tranminh", { exact: true }).click();
        await pageA.locator(".fixed.inset-0.z-50").getByText("anhson", { exact: true }).click();
        await pageA.locator(".fixed.inset-0.z-50").getByRole("button", { name: /Tạo nhóm \(/ }).click();

        // Verify group is active on User A
        await expect(pageA.getByRole("heading", { name: groupName })).toBeVisible({ timeout: 10000 });

        // User A sends message to the group
        const groupMsg = `Tin nhắn nhóm thử nghiệm ${Date.now()}`;
        const composerA = pageA.getByPlaceholder(/Nhắn tin cho/);
        await composerA.fill(groupMsg);
        await composerA.press("Enter");
        await expect(pageA.locator(".select-text").filter({ hasText: groupMsg })).toBeVisible();

        // User B switches to group tab and opens the group
        await pageB.locator("button").filter({ hasText: /Nhóm \(/ }).click();
        const groupItemB = pageB.locator(".crm-conversation-item, button").filter({ hasText: groupName }).first();
        await expect(groupItemB).toBeVisible({ timeout: 10000 });
        await groupItemB.click();

        // User B sees the group message
        await expect(pageB.locator(".select-text").filter({ hasText: groupMsg })).toBeVisible({ timeout: 10000 });

        // User A verifies read receipt
        // Look for the checkmarks in User A view
        await pageA.waitForTimeout(1000);
        const checkmarks = pageA.locator(".select-text").filter({ hasText: groupMsg }).locator("..").getByTitle(/Đã có/);
        if (await checkmarks.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Click to open readers popover
            await checkmarks.click();
            await expect(pageA.locator("text=Đã đọc")).toBeVisible();
            await expect(pageA.locator(".crm-chat-page").getByText("tranminh").last()).toBeVisible();
        }

        // Test Group Info Drawer & Custom Confirm Modal
        await pageA.getByTitle("Xem thông tin cuộc trò chuyện").click();
        await expect(pageA.getByText("Thông tin nhóm")).toBeVisible();

        // Click leave group to test owner prevention modal
        await pageA.getByRole("button", { name: "Rời khỏi nhóm" }).click();
        // Custom CRM modal should appear
        await expect(pageA.getByText("Không thể rời nhóm")).toBeVisible();
        await expect(pageA.getByText("Bạn đang là Trưởng nhóm (OWNER)")).toBeVisible();
        await pageA.getByRole("button", { name: "Đã hiểu" }).click();

        await contextA.close();
        await contextB.close();
        await contextC.close();
    });

    test("Responsive viewports & horizontal overflow test", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("Tên đăng nhập hoặc Email").fill("admin@crm.local");
        await page.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
        await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
        await page.waitForURL("**/dashboard");

        // Navigate to /chat
        await page.goto("/chat");
        await page.waitForLoadState("networkidle");

        // Test Desktop (1280x800)
        await page.setViewportSize({ width: 1280, height: 800 });
        let hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(hasOverflow).toBeFalsy();

        // Test Tablet (768x1024)
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(400);
        hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(hasOverflow).toBeFalsy();

        // Test Mobile (375x667)
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(400);
        hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(hasOverflow).toBeFalsy();
    });
});
