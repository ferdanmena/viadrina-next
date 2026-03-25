import { NextResponse } from "next/server";

const WP_API = "https://blog.viadrinatours.com/wp-json/wp/v2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "es";
    const perPage = searchParams.get("per_page") || "10";

    const res = await fetch(
      `${WP_API}/posts?lang=${lang}&per_page=${perPage}&_embed`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("BLOG API ERROR:", err);
      return NextResponse.json([], { status: 500 });
    }

    const posts = await res.json();

    const mapped = posts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      date: post.date,
      link: post.link,
      image:
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null,
    }));

    return NextResponse.json(mapped);

  } catch (error) {
    console.error("BLOG API CRASH:", error);
    return NextResponse.json([], { status: 500 });
  }
}