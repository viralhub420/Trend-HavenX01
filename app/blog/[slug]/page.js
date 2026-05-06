import { createClient } from 'next-sanity'
import { PortableText } from '@portabletext/react'

const client = createClient({
  projectId: 'y1nsnm6h',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
})

// স্যানিটির ডেটাগুলো (ছবি, লিংক) ব্লগে দেখানোর জন্য এই কম্পোনেন্টগুলো দরকার
const components = {
  types: {
    // পোস্টের মাঝখানে ছবি দেখানোর জন্য
    image: ({ value }) => {
      return (
        <div style={{ margin: '30px 0', textAlign: 'center' }}>
          <img
            src={client.fetch(`*[_id == $id][0].url`, { id: value.asset._ref })}
            alt={value.alt || 'Trend HavenX Blog Image'}
            style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          />
          {value.alt && <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>{value.alt}</p>}
        </div>
      )
    },
  },
  marks: {
    // এক্সটারনাল লিংকের জন্য
    link: ({ children, value }) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'underline' }}>
        {children}
      </a>
    ),
    // ইন্টারনাল লিংকের জন্য (আপনার সাইটের অন্য পোস্টের লিংক)
    internalLink: ({ children, value }) => {
      const href = `/blog/${value.reference?._ref}` // এটি স্লাগ অনুযায়ী কাজ করবে
      return (
        <a href={href} style={{ color: '#0070f3', fontWeight: 'bold', textDecoration: 'none' }}>
          {children}
        </a>
      )
    },
  },
}

export default async function BlogPost({ params }) {
  const { slug } = await params 
  
  // আমরা এখন ক্যাটাগরি এবং ট্যাগও ফর্চ (fetch) করছি
  const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    title,
    body,
    mainKeyword,
    category,
    tags,
    "imageUrl": mainImage.asset->url,
    "imageAlt": mainImage.alt
  }`, { slug })

  if (!post) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Post not found!</div>
  }

  return (
    <article style={{ padding: '20px', maxWidth: '850px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      
      {/* ক্যাটাগরি প্রদর্শন */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
         <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {post.category || 'General'}
         </span>
      </div>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#111', textAlign: 'center', fontWeight: '800' }}>{post.title}</h1>
      
      {/* ট্যাগগুলো প্রদর্শন */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {post.tags?.map((tag, index) => (
          <span key={index} style={{ color: '#666', fontSize: '0.9rem', marginRight: '10px' }}>#{tag}</span>
        ))}
      </div>

      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt={post.imageAlt || post.title} 
          style={{ width: '100%', borderRadius: '16px', marginBottom: '40px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} 
        />
      )}

      {/* এই অংশটিই আপনার স্যানিটির সব কন্টেন্ট (টেক্সট, ছবি, লিংক) সুন্দরভাবে দেখাবে */}
      <div style={{ fontSize: '1.2rem', color: '#2d3748' }}>
        <PortableText value={post.body} components={components} />
      </div>

      <div style={{ marginTop: '60px', borderTop: '2px solid #f7f7f7', paddingTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
          ← Back to Home
        </a>
      </div>
    </article>
  )
}
