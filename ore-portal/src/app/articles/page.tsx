import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: "desc" }, take: 50 });
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((a) => (
          <Link key={a.id} href={`/articles/${a.slug}`} className="rounded border p-4 bg-white hover:shadow">
            <div className="text-xs text-gray-500">{a.category}</div>
            <div className="font-medium">{a.title}</div>
            <div className="text-sm text-gray-500 line-clamp-2">{a.summary}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}