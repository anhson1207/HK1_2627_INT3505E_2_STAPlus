import { test, expect } from "@playwright/test";

test("FE1 real backend integration - Full CRUD on Leads and Customers via API Gateway", async ({ page }) => {
    // ============================================
    // 1. Authenticate with real Auth Service
    // ============================================
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Tên đăng nhập hoặc Email").fill("admin@crm.local");
    await page.getByLabel("Mật khẩu", { exact: true }).fill("Admin@123456");
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

    await page.waitForURL("**/dashboard", { timeout: 10000 });
    expect(page.url()).toContain("/dashboard");

    // ============================================
    // 2. Leads Module - Real API Gateway (Port 8080 -> 8082)
    // ============================================
    await page.goto("http://localhost:5173/leads");
    await page.waitForLoadState("networkidle");

    // Read: Verify real leads from DB exist in the table
    const tableRows = page.locator(".crm-table tbody tr").first();
    await expect(tableRows).toBeVisible({ timeout: 10000 });

    // Create: Add new Lead
    await page.getByRole("button", { name: "Thêm Lead" }).click();
    await page.waitForURL("**/leads/new");

    const uniqueLeadTag = String(Date.now()).slice(-6);
    const leadFirst = "Đặng";
    const leadLast = "Minh Tuấn " + uniqueLeadTag;
    await page.getByLabel("Họ").fill(leadFirst);
    await page.getByLabel("Tên").fill(leadLast);
    await page.getByLabel("Email").fill(`tuan_${uniqueLeadTag}@testcorp.vn`);
    await page.getByLabel("Số điện thoại").fill("0918112233");
    await page.getByLabel("Công ty").fill("Tuấn Phát Corp");

    await page.locator("form").getByRole("button", { name: "Tạo Lead" }).click();
    await page.waitForURL(/\/leads\/\d+/, { timeout: 10000 });

    // Verify detail page
    const leadFullName = `${leadFirst} ${leadLast}`;
    await expect(page.getByText(leadFullName).first()).toBeVisible();

    // Update: Edit Lead
    await page.getByRole("button", { name: "Chỉnh sửa" }).click();
    await page.waitForURL(/\/leads\/\d+\/edit/);

    const updatedCompany = "Tuấn Phát Corporation Global";
    await page.getByLabel("Công ty").fill(updatedCompany);
    await page.locator("form").getByRole("button", { name: "Lưu thay đổi" }).click();
    await page.waitForURL(/\/leads\/\d+/, { timeout: 10000 });
    await expect(page.getByText(updatedCompany).first()).toBeVisible();

    // ============================================
    // 3. Customers Module - Real API Gateway (Port 8080 -> 8083)
    // ============================================
    await page.goto("http://localhost:5173/customers");
    await page.waitForLoadState("networkidle");

    // Read: Verify real customer from DB exists
    const customerRow = page.locator(".crm-table tbody tr").first();
    await expect(customerRow).toBeVisible({ timeout: 10000 });

    // Create: Add new Customer
    await page.getByRole("button", { name: "Thêm khách hàng" }).click();
    await page.waitForURL("**/customers/new");

    const uniqueCustTag = String(Date.now()).slice(-6);
    const testCustName = "Tập đoàn Hoàng Kim " + uniqueCustTag;
    await page.getByLabel("Tên khách hàng").fill(testCustName);
    await page.getByLabel("Email").fill(`hoangkim_${uniqueCustTag}@testcorp.vn`);
    await page.getByLabel("Số điện thoại").fill("0908889977");
    await page.getByLabel("Công ty").fill("Hoàng Kim Group");
    await page.getByLabel("Địa chỉ").fill("Ba Đình, Hà Nội");

    await page.locator("form").getByRole("button", { name: "Tạo khách hàng" }).click();
    await page.waitForURL("**/customers", { timeout: 10000 });

    // Verify customer appears in list
    await expect(page.getByText(testCustName).first()).toBeVisible({ timeout: 10000 });

    // Click customer to view detail
    await page.getByText(testCustName).first().click();
    await page.waitForURL(/\/customers\/\d+/, { timeout: 10000 });
    await expect(page.getByText("Hoàng Kim Group").first()).toBeVisible();

    // Update: Edit Customer
    await page.getByRole("button", { name: "Chỉnh sửa" }).click();
    await page.waitForURL(/\/customers\/\d+\/edit/);

    const updatedCustCompany = "Hoàng Kim Holding International";
    await page.getByLabel("Công ty").fill(updatedCustCompany);
    await page.locator("form").getByRole("button", { name: "Lưu thay đổi" }).click();
    await page.waitForURL(/\/customers\/\d+/, { timeout: 10000 });
    await expect(page.getByText(updatedCustCompany).first()).toBeVisible();
});
