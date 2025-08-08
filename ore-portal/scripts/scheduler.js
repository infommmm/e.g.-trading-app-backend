const cron = require("node-cron");
const { PrismaClient, PriceType } = require("@prisma/client");

const prisma = new PrismaClient();

async function simulateDailyPrices() {
  const commodities = await prisma.commodity.findMany();
  const countries = await prisma.country.findMany();
  for (const commodity of commodities) {
    for (const country of countries) {
      const last = await prisma.price.findFirst({ where: { commodityId: commodity.id, countryId: country.id }, orderBy: { observedAt: "desc" } });
      const base = last?.value ?? 100;
      const next = Math.max(10, base + (Math.random() - 0.5) * 5);
      await prisma.price.create({ data: { commodityId: commodity.id, countryId: country.id, type: PriceType.FOB, value: Number(next.toFixed(2)), currency: "USD", unit: "USD/ton", observedAt: new Date(), source: "cron" } });
    }
  }
  console.log(`[${new Date().toISOString()}] Daily prices updated.`);
}

async function simulateWeeklyReports() {
  const commodities = await prisma.commodity.findMany();
  for (const commodity of commodities) {
    const slug = `${commodity.slug}-weekly-report-${new Date().toISOString().slice(0, 10)}`;
    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: { commodityId: commodity.id, title: `${commodity.name} Weekly Report`, slug, category: "REPORT", summary: `Weekly overview for ${commodity.name}.`, content: `Automated weekly report for ${commodity.name}.`, author: "Bot", publishedAt: new Date() },
    });
  }
  console.log(`[${new Date().toISOString()}] Weekly reports published.`);
}

cron.schedule("0 0 * * *", simulateDailyPrices); // daily at midnight
cron.schedule("0 1 * * 1", simulateWeeklyReports); // weekly, Mondays 01:00

console.log("Scheduler started. Daily and weekly tasks scheduled.");