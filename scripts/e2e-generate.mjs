import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
page.setDefaultTimeout(15000);

try {
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.getByLabel("Merchant / Account Holder Name").fill("Priya Stores");
  await page.getByLabel("UPI ID").fill("merchant@oksbi");
  await page.getByLabel("Total Amount").fill("10000");
  await page.getByLabel("Invoice / Payment Reference").fill("INV-2048");
  await page.getByLabel("Payment Note").fill("Workshop deposit");
  await page.getByLabel("Payment Structure").click();
  await page.getByRole("option", { name: "Equal Instalments" }).click();
  await page.getByRole("button", { name: "Generate QR Codes" }).click();
  await page.getByText("₹2,500.00").first().waitFor();
  await page.getByRole("button", { name: "Copy Payment Link" }).first().click();
  await page.getByText("Payment link copied").waitFor();
  await page.getByRole("button", { name: "More payment actions" }).first().click();
  await page.getByText("Mark as Paid").click();
  await page.getByText("Payment marked as paid").waitFor();
  await page.getByText("Manually marked as paid").first().waitFor();
  await page.getByRole("link", { name: "View invoice" }).click();
  await page.getByRole("heading", { name: "INV-2048" }).waitFor();
  console.log(JSON.stringify({ ok: true }));
} catch (error) {
  console.error("E2E_FAIL", error instanceof Error ? error.message : error);
  await page.screenshot({ path: "/tmp/freeupi-e2e-fail.png", fullPage: true });
  process.exitCode = 1;
} finally {
  await browser.close();
}
