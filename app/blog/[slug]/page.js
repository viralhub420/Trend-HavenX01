import { createClient } from 'next-sanity'

const client = createClient({
  projectId: 'y1nsnm6h',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-01-01',
})

export default async function BlogPost({ params }) {
  // লেটেস্ট Next.js ভার্সনের জন্য params await করতে হয়
  const { slug } = await params 
  
  const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug })

  if (!post) return <h1 style={{ textAlign: 'center', marginTop: '50px' }}>Post not found!</h1>

  return (
    <article style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{post.title}</h1>
      <hr />
      <div style={{ marginTop: '20px', lineHeight: '1.8', fontSize: '1.1rem' }}>
        <p>Post content will appear here...</p>
      </div>
    </article>
  )
}
