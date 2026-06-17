import { createClient } from "next-sanity";

const client = createClient({
  projectId: "y1nsnm6h",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

export default async function sitemap() {
  const posts = await client.fetch(
    `*[_type == "post"]{
      "slug": slug.current,
      _updatedAt
    }`
  );

  return [
    {
      url: "https://www.trendhavenx.online",
      lastModified: new Date(),
    },
    ...posts.map((post) => ({
      url: `https://www.trendhavenx.online/${post.slug}`,
      lastModified: post._updatedAt,
    })),
  ];
}
