import { createClient } from 'next-sanity'

const client = createClient({
  projectId: 'y1nsnm6h',
  dataset: 'production',
  useCdn: false, // এটি false থাকলে সরাসরি ডাটাবেজ থেকে লেটেস্ট ডাটা দেখাবে
  apiVersion: '2023-01-01',
})

// প্রতি ৬০ সেকেন্ড পর পর সাইট অটোমেটিক আপডেট হবে
export const revalidate = 60 

export default async function Home() {
  // ডাটাবেজ থেকে পোস্ট নিয়ে আসা
  const posts = await client.fetch(`*[_type == "post"]{title, "slug": slug.current}`)

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', textAlign: 'center' }}>Trend HavenX Blog</h1>
      
      <div style={{ marginTop: '30px' }}>
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.slug} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <a href={`/${post.slug}`} style={{ fontSize: '1.6rem', color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
                {post.title}
              </a>
              <p style={{ color: '#666', marginTop: '10px' }}>Click to read the full article...</p>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <p style={{ fontSize: '1.2rem', color: '#888' }}>No posts found yet.</p>
            <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Tip: Make sure you clicked the "Publish" button in Sanity Studio.</p>
            <a href="/studio" style={{ color: '#0070f3', fontWeight: 'bold' }}>Go to Studio</a>
          </div>
        )}
      </div>
    </main>
  )
}
