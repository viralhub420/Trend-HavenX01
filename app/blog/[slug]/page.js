import { createClient } from 'next-sanity'

const client = createClient({
  projectId: 'y1nsnm6h',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
})

export default async function BlogPost({ params }) {
  const { slug } = await params 
  
  const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    title,
    body,
    "imageUrl": mainImage.asset->url
  }`, { slug })

  if (!post) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Post not found!</div>
  }

  // বডি কন্টেন্টকে টেক্সট হিসেবে রূপান্তর করার ফাংশন
  const renderBody = (body) => {
    if (typeof body === 'string') return body;
    if (Array.isArray(body)) {
      return body.map(block => {
        if (block._type !== 'block' || !block.children) return '';
        return block.children.map(child => child.text).join('');
      }).join('\n\n');
    }
    return 'No content available.';
  };

  return (
    <article style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '10px', color: '#1a1a1a', textAlign: 'center' }}>{post.title}</h1>
      
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>Published on Trend HavenX</p>

      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          style={{ width: '100%', borderRadius: '12px', marginBottom: '30px' }} 
        />
      )}

      <div style={{ fontSize: '1.15rem', whiteSpace: 'pre-wrap', color: '#333' }}>
        {renderBody(post.body)}
      </div>

      <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Back to Home
        </a>
      </div>
    </article>
  )
}
