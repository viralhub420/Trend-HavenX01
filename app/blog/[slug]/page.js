import { createClient } from 'next-sanity'

const client = createClient({
  projectId: 'y1nsnm6h',
  dataset: 'production',
  useCdn: false, // লেটেস্ট ডাটা দেখার জন্য false রাখা ভালো
  apiVersion: '2023-01-01',
})

export default async function BlogPost({ params }) {
  // লেটেস্ট Next.js ভার্সনের জন্য params await করা হয়েছে
  const { slug } = await params 
  
  // Sanity থেকে টাইটেল, বডি কন্টেন্ট এবং ছবির ইউআরএল নিয়ে আসা
  const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    title,
    body,
    "imageUrl": mainImage.asset->url
  }`, { slug })

  if (!post) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>Post not found!</h1>
        <a href="/" style={{ color: '#0070f3' }}>Back to Home</a>
      </div>
    )
  }

  return (
    <article style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.8' }}>
      {/* পোস্টের টাইটেল */}
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#1a1a1a' }}>{post.title}</h1>
      
      <div style={{ marginBottom: '30px', color: '#666', fontSize: '0.9rem' }}>
        <span>Published on Trend HavenX</span>
      </div>

      {/* পোস্টের মেইন ইমেজ বা ফিচারড ইমেজ */}
      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          style={{ width: '100%', borderRadius: '12px', marginBottom: '30px', display: 'block' }} 
        />
      )}

      <hr style={{ border: '0', borderTop: '1px solid #eee', marginBottom: '30px' }} />

      {/* আসল পোস্ট কন্টেন্ট (Body) */}
      <div style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', color: '#333', textAlign: 'justify' }}>
        {typeof post.body === 'string' ? post.body : 'Content loading error. Check Sanity Body field.'}
      </div>

      {/* নিচে ফিরে যাওয়ার লিঙ্ক */}
      <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Back to Home
        </a>
      </div>
    </article>
  )
}
