import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CommoditiesPage() {
  const commodities = await prisma.commodity.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Commodities</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {commodities.map((c) => (
          <Link key={c.id} href={`/commodities/${c.slug}`} className="rounded border p-4 bg-white hover:shadow">
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-gray-500">{c.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}