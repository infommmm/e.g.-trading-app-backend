import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const commodities = await prisma.commodity.findMany({ orderBy: { name: "asc" } });
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: "desc" }, take: 6 });

  return (
    <div className="grid gap-8">
      <section>
        <h1 className="text-2xl font-semibold mb-3">Commodities</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {commodities.map((c) => (
            <Link key={c.id} href={`/commodities/${c.slug}`} className="rounded border p-4 bg-white hover:shadow">
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-500">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.slug}`} className="rounded border p-4 bg-white hover:shadow">
              <div className="text-sm text-gray-500">{a.category}</div>
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-gray-500 line-clamp-2">{a.summary}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
