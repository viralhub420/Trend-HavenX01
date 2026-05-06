import { createClient } from 'next-sanity'

const client = createClient({
  projectId: 'y1nsnm6h',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-01-01',
})

export default async function BlogPost({ params }) {
  const { slug } = params
  const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug })

  if (!post) return <h1>Post not found!</h1>

  return (
    <article style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{post.title}</h1>
      <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
        {/* এখানে কন্টেন্ট দেখানোর জন্য পরে আমরা একটি রিচ টেক্সট প্যাকেজ যোগ করব */}
        <p>Post content will appear here...</p>
      </div>
    </article>
  )
}
  
