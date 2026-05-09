import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import React, { useMemo } from 'react'
import { useFormValue } from 'sanity'

// SEO Analyzer Component
const SEOAnalyzer = () => {
  // useFormValue ব্যবহার করলে টাইপ করার সাথে সাথে ভ্যালু আপডেট হবে
  const title = useFormValue(['title']) || ''
  const description = useFormValue(['description']) || ''
  const body = useFormValue(['body']) || []
  const mainKeyword = useFormValue(['mainKeyword']) || ''

  // শব্দ সংখ্যা এবং কন্টেন্ট প্রসেসিং
  const { wordCount, density, text } = useMemo(() => {
    const plainText = body
      .map(block => 
        block._type === 'block' 
          ? block.children.map(child => child.text).join('') 
          : ''
      )
      .join(' ')
    
    const count = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
    
    let keyDensity = 0
    if (mainKeyword && count > 0) {
      const regex = new RegExp(`\\b${mainKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      const matches = (plainText.match(regex) || []).length
      keyDensity = ((matches / count) * 100).toFixed(2)
    }

    return { wordCount: count, density: keyDensity, text: plainText }
  }, [body, mainKeyword])

  // স্কোর ক্যালকুলেশন
  let score = 0
  if (title.length > 10) score += 20
  if (description.length >= 50 && description.length <= 140) score += 20
  if (wordCount >= 2500) score += 30
  if (density >= 0.5 && density <= 1.5) score += 30

  return (
    <div style={{ 
      padding: '15px', 
      backgroundColor: '#f8fafc', 
      borderRadius: '8px', 
      border: '1px solid #e2e8f0',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
        <strong style={{ color: '#334155' }}>SEO Performance</strong>
        <div style={{ 
          padding: '4px 12px', 
          borderRadius: '20px', 
          backgroundColor: score > 70 ? '#dcfce7' : '#fef9c3',
          color: score > 70 ? '#166534' : '#854d0e',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          Score: {score}/100
        </div>
      </div>
      <ul style={{ fontSize: '13px', listStyle: 'none', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '5px' }}>
          {wordCount >= 2500 ? '✅' : '❌'} <strong>শব্দ সংখ্যা:</strong> {wordCount} (লক্ষ্য: ২৫০০)
        </li>
        <li>
          {density >= 0.5 && density <= 1.5 ? '✅' : '⚠️'} <strong>কিউওয়ার্ড ডেনসিটি:</strong> {density}%
        </li>
      </ul>
      {wordCount < 2500 && (
        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
          * র‍্যাঙ্কিংয়ের জন্য অন্তত ২৫০০ শব্দ লিখুন।
        </p>
      )}
    </div>
  )
}

export default defineConfig({
  name: 'default',
  title: 'Trend HavenX Admin',
  projectId: 'y1nsnm6h', 
  dataset: 'production',
  basePath: '/studio',
  plugins: [deskTool()],
  schema: {
    types: [
      {
        name: 'post',
        type: 'document',
        title: 'Blog Post',
        fields: [
          {
            name: 'seoAnalyzer',
            title: 'Rank Math SEO Analysis',
            type: 'string',
            readOnly: true,
            components: {
              field: SEOAnalyzer
            }
          },
          { name: 'title', type: 'string', title: 'Title' },
          { name: 'mainKeyword', type: 'string', title: 'Focus Keyword', description: 'আপনার মেইন কিউওয়ার্ডটি এখানে দিন।' },
          { name: 'slug', type: 'slug', options: { source: 'title' }, title: 'Slug' },
          {
            name: 'category',
            type: 'string',
            title: 'Category',
            options: {
              list: [
                { title: 'Make Money Online', value: 'make-money-online' },
                { title: 'AI Tools', value: 'ai-tools' },
                { title: 'Health & Wellness', value: 'health-wellness' },
                { title: 'Tech News', value: 'tech-news' },
              ],
            },
          },
          {
            name: 'tags',
            type: 'array',
            title: 'Tags',
            of: [{ type: 'string' }],
            options: { layout: 'tags' },
          },
          { 
            name: 'mainImage', 
            type: 'image', 
            title: 'Featured Image',
            options: { hotspot: true },
            fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }]
          },
          { 
            name: 'body', 
            type: 'array', 
            title: 'Post Content',
            of: [
              { type: 'block' },
              { 
                type: 'image', 
                title: 'Inline Image',
                options: { hotspot: true },
                fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }]
              }
            ],
          },
          { 
            name: 'description', 
            type: 'text', 
            title: 'Meta Description', 
            validation: Rule => Rule.max(140)
          }
        ]
      }
    ],
  },
})
