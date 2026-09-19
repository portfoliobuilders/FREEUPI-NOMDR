import { chromium } from "playwright-core";

const port = process.env.PORT || "3000";
const origin = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
page.setDefaultTimeout(15000);

try {
  await page.goto(`${origin}/setup`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Connect FREEUPI to Supabase" }).waitFor();
  await page.getByText("Invoice tables exist on the hosted database").waitFor();

  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  await page.getByLabel("Merchant / Account Holder Name").fill("Priya Stores");
  await page.getByLabel("UPI ID").fill("merchant@oksbi");
  await page.getByLabel("Total Amount").fill("8500");
  await page.getByLabel("Invoice / Payment Reference").fill("INV-2048");
  await page.getByLabel("Payment Note").fill("Workshop deposit");
  await page.getByRole("radio", { name: /Auto Split/i }).click();
  await page.getByLabel("Maximum amount per payment").fill("1999");
  await page.getByRole("button", { name: /Generate 5 QR Codes/i }).first().click();
  await page.getByText("₹1,999.00").first().waitFor();
  await page.getByText("₹504.00").first().waitFor();
  await page.getByRole("button", { name: "Copy Payment Link" }).first().click();
  await page.getByText("Payment link copied").waitFor();
  await page.getByRole("button", { name: "More payment actions" }).first().click();
  await page.getByText("Mark as Paid").click();
  await page.getByText("Manually marked as paid").first().waitFor();
  await page.getByRole("button", { name: "Save invoice" }).click();
  await Promise.race([
    page.getByText("Sign in to save invoices.").waitFor(),
    page.waitForURL(/\/login/),
  ]);
  console.log(JSON.stringify({ ok: true, origin }));
} catch (error) {
  console.error("E2E_FAIL", error instanceof Error ? error.message : error);
  await page.screenshot({ path: "/tmp/freeupi-e2e-fail.png", fullPage: true });
  process.exitCode = 1;
} finally {
  await browser.close();
}
