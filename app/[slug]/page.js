import { createClient } from 'next-sanity'
import { PortableText } from '@portabletext/react'

const client = createClient({
  projectId: 'y1nsnm6h',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
})
export async function generateMetadata({ params }) {
  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      description,
      "imageUrl": mainImage.asset->url
    }`,
    { slug: params.slug }
  );

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description || post.title,
    alternates: {
      canonical: `https://www.trendhavenx.online/${params.slug}`,
    },
  };
}
if (!post) {
return {
title: "Post Not Found",
description: "This post could not be found."
};
}

return {
title: post.title,
description: post.description || post.title,
alternates: {
canonical: "https://www.trendhavenx.online/${params.slug}",
},
openGraph: {
title: post.title,
description: post.description || post.title,
url: "https://www.trendhavenx.online/${params.slug}",
type: "article",
images: post.imageUrl
? [
{
url: post.imageUrl,
width: 1200,
height: 630,
},
]
: [],
},
twitter: {
card: "summary_large_image",
title: post.title,
description: post.description || post.title,
images: post.imageUrl ? [post.imageUrl] : [],
},
};
}
// স্যানিটির বডি কন্টেন্টের ভেতর ছবি, লিংক ইত্যাদি দেখানোর জন্য সঠিক কম্পোনেন্ট
const components = {
  types: {
    image: ({ value }) => {
      // স্যানিটি থেকে ইমেজের সঠিক URL তৈরি করার সহজ পদ্ধতি
      if (!value?.asset?._ref) return null;
      
      const id = value.asset._ref
        .replace('image-', '')
        .replace('-jpg', '.jpg')
        .replace('-png', '.png')
        .replace('-webp', '.webp');
      const imageUrl = `https://cdn.sanity.io/images/y1nsnm6h/production/${id}`;

      return (
        <div style={{ margin: '40px 0', textAlign: 'center' }}>
          <img
            src={imageUrl}
            alt={value.alt || 'Trend HavenX Blog Image'}
            style={{ 
              width: '100%', 
              maxWidth: '800px', 
              borderRadius: '12px', 
              boxShadow: '0 10px 15px rgba(0,0,0,0.1)' 
            }}
          />
          {value.alt && (
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '12px', fontStyle: 'italic' }}>
              {value.alt}
            </p>
          )}
        </div>
      )
    },
  },
  marks: {
    link: ({ children, value }) => (
      <a 
        href={value.href} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ color: '#0070f3', textDecoration: 'underline' }}
      >
        {children}
      </a>
    ),
    internalLink: ({ children, value }) => {
      // এটি সরাসরি স্লাগ অনুযায়ী কাজ করবে
      const href = `/blog/${value.reference?._ref}` 
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
  
  // স্যানিটি থেকে ডাটা ফেচ করা
  const post = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    title,
    description,
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
      {post.category && (
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
           <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {post.category}
           </span>
        </div>
      )}

      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#111', textAlign: 'center', fontWeight: '800' }}>
        {post.title}
      </h1>
      
      {/* ট্যাগগুলো প্রদর্শন */}
      {post.tags && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {post.tags.map((tag, index) => (
            <span key={index} style={{ color: '#666', fontSize: '0.9rem', margin: '0 8px', display: 'inline-block' }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* মেইন ইমেজ */}
      {post.imageUrl && (
        <div style={{ marginBottom: '40px' }}>
          <img 
            src={post.imageUrl} 
            alt={post.imageAlt || post.title} 
            style={{ width: '100%', borderRadius: '16px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} 
          />
        </div>
      )}

      {/* বডি কন্টেন্ট (টেক্সট, মাঝখানের ছবি ও লিংক) */}
      <div style={{ fontSize: '1.2rem', color: '#2d3748' }}>
        <PortableText value={post.body} components={components} />
      </div>

      <div style={{ marginTop: '60px', borderTop: '2px solid #f0f0f0', paddingTop: '30px', textAlign: 'center' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
          ← Back to Home
        </a>
      </div>
    </article>
  )
}
