import { prisma } from "@/lib/prisma";

type StatsRow = { year: number; exportQty: number; exportValue: number; importQty: number; importValue: number };

export default async function ReportsPage() {
  const commodities = await prisma.commodity.findMany({ orderBy: { name: "asc" } });
  const years = Array.from(new Set((await prisma.tradeStat.findMany({ select: { year: true } })).map((t) => t.year))).sort((a, b) => b - a);

  const commodityToStats: Record<number, StatsRow[]> = {};
  for (const c of commodities) {
    const stats = await prisma.tradeStat.groupBy({ by: ["year", "type"], where: { commodityId: c.id }, _sum: { quantityMt: true, valueUsd: true } });
    commodityToStats[c.id] = years.map((y) => {
      const exp = stats.find((s) => s.year === y && s.type === "EXPORT");
      const imp = stats.find((s) => s.year === y && s.type === "IMPORT");
      return {
        year: y,
        exportQty: exp?._sum.quantityMt ?? 0,
        exportValue: exp?._sum.valueUsd ?? 0,
        importQty: imp?._sum.quantityMt ?? 0,
        importValue: imp?._sum.valueUsd ?? 0,
      };
    });
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <p className="text-gray-600">Quick exports/imports totals by commodity and year.</p>
      <div className="grid gap-6">
        {commodities.map((c) => (
          <div key={c.id} className="rounded border bg-white">
            <div className="border-b p-3 font-medium">{c.name}</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Year</th>
                    <th className="p-2">Export Qty</th>
                    <th className="p-2">Export Value</th>
                    <th className="p-2">Import Qty</th>
                    <th className="p-2">Import Value</th>
                  </tr>
                </thead>
                <tbody>
                  {commodityToStats[c.id].map((row) => (
                    <tr key={row.year} className="border-b last:border-none">
                      <td className="p-2">{row.year}</td>
                      <td className="p-2">{row.exportQty}</td>
                      <td className="p-2">${row.exportValue.toLocaleString()}</td>
                      <td className="p-2">{row.importQty}</td>
                      <td className="p-2">${row.importValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}