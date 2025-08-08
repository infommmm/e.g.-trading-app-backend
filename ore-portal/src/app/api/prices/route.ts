import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PriceType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const commodity = searchParams.get("commodity");
  const country = searchParams.get("country");
  const typeParam = searchParams.get("type");
  const type = typeParam ? (typeParam as keyof typeof PriceType) : undefined;

  const where: {
    commodityId?: number;
    countryId?: number;
    type?: PriceType;
  } = {};

  if (commodity) {
    const c = await prisma.commodity.findUnique({ where: { slug: commodity } });
    if (!c) return NextResponse.json({ data: [] });
    where.commodityId = c.id;
  }
  if (country) {
    const ct = await prisma.country.findUnique({ where: { iso2: country } });
    if (ct) where.countryId = ct.id;
  }
  if (type) where.type = PriceType[type];

  const data = await prisma.price.findMany({ where, orderBy: { observedAt: "desc" }, take: 200 });
  return NextResponse.json({ data });
}