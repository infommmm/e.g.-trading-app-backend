import { NextRequest, NextResponse } from "next/server";
import { getLatestPrice } from "@/lib/priceService";
import { PriceType } from "@prisma/client";

function parseQuery(q: string) {
  const lower = q.toLowerCase();
  const commodities = [
    { slug: "manganese-ore", names: ["manganese", "manganese ore", "mn ore"] },
    { slug: "copper-ore", names: ["copper", "copper ore"] },
    { slug: "iron-ore", names: ["iron", "iron ore"] },
    { slug: "tin-ore", names: ["tin", "tin ore"] },
    { slug: "chrome-ore", names: ["chrome", "chromium", "chrome ore", "chromite"] },
  ];
  const types: Record<string, PriceType> = { fob: PriceType.FOB, cif: PriceType.CIF, port: PriceType.PORT, spot: PriceType.SPOT, sales: PriceType.SALES };
  const commodity = commodities.find((c) => c.names.some((n) => lower.includes(n)))?.slug ?? "iron-ore";
  const type: PriceType | undefined = Object.entries(types).find(([k]) => lower.includes(k))?.[1];

  // crude ISO2 detection by uppercase 2 letters in the string
  const iso2Match = q.match(/\b[A-Z]{2}\b/);
  const countryIso2 = iso2Match ? iso2Match[0] : undefined;

  return { commodity, type, countryIso2 };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const query: string = body.query ?? "";
  const { commodity, type, countryIso2 } = parseQuery(query);
  const price = await getLatestPrice(commodity, { countryIso2, type });
  if (!price) return NextResponse.json({ answer: `No price data found for ${commodity}${countryIso2 ? " in " + countryIso2 : ""}.` });
  const answer = `${commodity.replace("-", " ")} ${type ?? price.type} latest price: ${price.value} ${price.currency} (${price.unit}) as of ${new Date(price.observedAt).toLocaleDateString()}${countryIso2 ? " in " + countryIso2 : ""}.`;
  return NextResponse.json({ answer, data: { commodity, type: type ?? price.type, countryIso2: countryIso2 ?? null, price } });
}