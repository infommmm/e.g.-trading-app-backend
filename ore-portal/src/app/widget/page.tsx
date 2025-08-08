import { getLatestPrice } from "@/lib/priceService";
import { PriceType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function WidgetPage({ searchParams }: { searchParams: Promise<{ commodity?: string; country?: string; type?: string }> }) {
  const sp = await searchParams;
  const commoditySlug = sp.commodity ?? "iron-ore";
  const type = (sp.type as PriceType) || PriceType.FOB;
  const price = await getLatestPrice(commoditySlug, { countryIso2: sp.country, type });

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="text-xs text-gray-500">Latest {type} price</div>
        <div className="text-lg font-semibold">{commoditySlug.replace("-", " ")}</div>
        {price ? (
          <div className="text-2xl">{price.value} {price.currency} <span className="text-sm text-gray-500">({price.unit})</span></div>
        ) : (
          <div className="text-gray-500">No data</div>
        )}
      </div>
    </div>
  );
}