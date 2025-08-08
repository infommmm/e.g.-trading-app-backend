import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLatestPricesByCommodity } from "@/lib/priceService";

export default async function CommodityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const commodity = await prisma.commodity.findUnique({ where: { slug } });
  if (!commodity) return notFound();
  const prices = await getLatestPricesByCommodity(slug);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{commodity.name}</h1>
        {commodity.description && <p className="text-gray-600">{commodity.description}</p>}
      </div>

      <div className="grid gap-2">
        <h2 className="text-xl font-semibold">Latest Prices</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">Country</th>
                <th className="p-2">Port</th>
                <th className="p-2">Price</th>
                <th className="p-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => (
                <tr key={p.id} className="border-b last:border-none">
                  <td className="p-2">{new Date(p.observedAt).toLocaleDateString()}</td>
                  <td className="p-2">{p.type}</td>
                  <td className="p-2">{p.country?.name ?? "-"}</td>
                  <td className="p-2">{p.port?.name ?? "-"}</td>
                  <td className="p-2">{p.value} {p.currency} ({p.unit})</td>
                  <td className="p-2">{p.source ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-2">
        <h2 className="text-xl font-semibold">Embed Widget</h2>
        <p className="text-gray-600">Display latest {commodity.name} price on your website.</p>
        <pre className="bg-gray-900 text-white p-3 rounded text-xs overflow-x-auto">{`<iframe src="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/widget?commodity=${commodity.slug}" width="100%" height="200" frameborder="0"></iframe>`}</pre>
      </div>
    </div>
  );
}