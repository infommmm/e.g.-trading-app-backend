import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug }, include: { commodity: true } });
  if (!article) return notFound();

  return (
    <article className="prose prose-gray max-w-none">
      <div className="text-sm text-gray-500">{article.category} {article.commodity ? `· ${article.commodity.name}` : ""}</div>
      <h1>{article.title}</h1>
      {article.author && <div className="text-sm text-gray-500">By {article.author}</div>}
      <div className="text-sm text-gray-500">{new Date(article.publishedAt).toLocaleString()}</div>
      {article.summary && <p className="text-gray-600">{article.summary}</p>}
      <div className="mt-4 whitespace-pre-wrap">{article.content}</div>
    </article>
  );
}