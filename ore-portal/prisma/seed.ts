import { PrismaClient, ArticleCategory, PriceType, TradeType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const commodities = [
    { slug: "manganese-ore", name: "Manganese Ore" },
    { slug: "copper-ore", name: "Copper Ore" },
    { slug: "iron-ore", name: "Iron Ore" },
    { slug: "tin-ore", name: "Tin Ore" },
    { slug: "chrome-ore", name: "Chrome Ore" },
  ];

  for (const commodity of commodities) {
    await prisma.commodity.upsert({
      where: { slug: commodity.slug },
      update: {},
      create: { ...commodity, description: `${commodity.name} market and trade data.` },
    });
  }

  const countries = [
    { iso2: "CN", name: "China" },
    { iso2: "IN", name: "India" },
    { iso2: "US", name: "United States" },
    { iso2: "BR", name: "Brazil" },
    { iso2: "AU", name: "Australia" },
    { iso2: "ZA", name: "South Africa" },
    { iso2: "RU", name: "Russia" },
    { iso2: "ID", name: "Indonesia" },
    { iso2: "TR", name: "Türkiye" },
  ];

  for (const country of countries) {
    await prisma.country.upsert({ where: { iso2: country.iso2 }, update: {}, create: country });
  }

  const portsByCountry: Record<string, string[]> = {
    CN: ["Tianjin", "Qingdao", "Shanghai"],
    IN: ["Visakhapatnam", "Paradip", "Mormugao"],
    US: ["New Orleans", "Los Angeles", "Houston"],
    BR: ["Santos", "Tubarao"],
    AU: ["Port Hedland", "Dampier"],
    ZA: ["Richards Bay", "Saldanha Bay"],
    RU: ["Novorossiysk"],
    ID: ["Balikpapan", "Jakarta"],
    TR: ["Mersin", "İskenderun"],
  };

  for (const [iso2, portNames] of Object.entries(portsByCountry)) {
    const country = await prisma.country.findUnique({ where: { iso2 } });
    if (!country) continue;
    for (const portName of portNames) {
      await prisma.port.upsert({
        where: { name_countryId: { name: portName, countryId: country.id } },
        update: {},
        create: { name: portName, countryId: country.id },
      });
    }
  }

  const allCommodities = await prisma.commodity.findMany();
  const allCountries = await prisma.country.findMany();
  const allPorts = await prisma.port.findMany();

  // Seed a few recent prices per commodity
  const now = new Date();
  for (const commodity of allCommodities) {
    for (const country of allCountries) {
      const countryPorts = allPorts.filter((p) => p.countryId === country.id);
      const base = 100 + commodity.id * 20 + country.id * 2;
      const values = [base, base + 5, base - 3, base + 8];
      for (let i = 0; i < values.length; i++) {
        const observedAt = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        await prisma.price.create({
          data: {
            commodityId: commodity.id,
            countryId: country.id,
            portId: countryPorts[0]?.id,
            type: [PriceType.FOB, PriceType.CIF, PriceType.PORT, PriceType.SALES][i % 4],
            currency: "USD",
            unit: "USD/ton",
            value: Math.max(10, values[i] + (i - 1) * 3),
            observedAt,
            source: "seed",
          },
        });
      }
    }

    // Seed sample articles
    for (const cat of [ArticleCategory.NEWS, ArticleCategory.BLOG, ArticleCategory.ARTICLE, ArticleCategory.REPORT]) {
      await prisma.article.upsert({
        where: { slug: `${commodity.slug}-${cat.toLowerCase()}` },
        update: {},
        create: {
          commodityId: commodity.id,
          title: `${commodity.name} ${cat.toLowerCase()} update`,
          slug: `${commodity.slug}-${cat.toLowerCase()}`,
          category: cat,
          summary: `Latest ${cat.toLowerCase()} on ${commodity.name}.`,
          content: `This is a seeded ${cat.toLowerCase()} for ${commodity.name}.`,
          author: "System",
        },
      });
    }

    // Seed trade stats for recent years
    for (const country of allCountries) {
      for (const type of [TradeType.EXPORT, TradeType.IMPORT]) {
        for (let year = now.getFullYear() - 3; year <= now.getFullYear(); year++) {
          const quantity = 1000 + commodity.id * 10 + country.id * 2 + (type === TradeType.EXPORT ? 100 : 50);
          const valueUsd = quantity * (120 + commodity.id * 5);
          await prisma.tradeStat.upsert({
            where: { commodityId_countryId_type_year: { commodityId: commodity.id, countryId: country.id, type, year } },
            update: {},
            create: { commodityId: commodity.id, countryId: country.id, type, year, quantityMt: quantity, valueUsd, unit: "ton" },
          });
        }
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });