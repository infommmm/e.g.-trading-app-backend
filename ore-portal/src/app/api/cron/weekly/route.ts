import { NextRequest, NextResponse } from "next/server";
import { publishWeeklyReports } from "@/lib/cronJobs";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await publishWeeklyReports();
  return NextResponse.json(result);
}