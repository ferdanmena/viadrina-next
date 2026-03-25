import Link from "next/link";
import Image from "next/image";
import { translations, Lang } from "@/lib/translations";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const safeLang: Lang = lang === "es" ? "es" : lang === "pl" ? "pl" : "en";
  const t = translations[safeLang];

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${process.env.VERCEL_URL}`;

  const res = await fetch(
    `${baseUrl}/api/blog?lang=${safeLang}&per_page=12`,
    { next: { revalidate: 3600 } }
  );

  const posts = res.ok ? await res.json() : [];

  return (
    <main className="container">
      <div className="blog-hero">
        <h1>Blog</h1>
        <p>
          {safeLang === "es"
            ? "Guías, consejos e historias sobre Europa Central"
            : "Guides, tips and stories about Central Europe"}
        </p>
      </div>

      <div className="blog-grid">
        {posts.map((post: any) => (
            <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-card"
          >
            <div className="blog-card-image">
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="blog-card-img"
                />
              )}
            </div>
            <div className="blog-card-content">
              <span className="blog-card-date">
                {new Date(post.date).toLocaleDateString(
                  safeLang === "es" ? "es-ES" : "en-GB",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </span>
              <h2>{post.title}</h2>
              <div
                className="blog-card-excerpt"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
              <span className="blog-read-more">
                {safeLang === "es" ? "Leer más →" : "Read more →"}
              </span>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}