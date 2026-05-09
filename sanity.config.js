import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import React, { useMemo } from 'react'
import { useFormValue } from 'sanity'

// --- RANK MATH STYLE SEO ANALYZER START ---
const SEOAnalyzer = () => {
  const title = useFormValue(['title']) || ''
  const description = useFormValue(['description']) || ''
  const body = useFormValue(['body']) || []
  const mainKeyword = useFormValue(['mainKeyword']) || ''
  const slug = useFormValue(['slug'])?.current || ''

  const analysis = useMemo(() => {
    let plainText = ''
    let h2Count = 0
    let h3Count = 0
    let hasLinks = false
    let hasImages = false
    let imagesWithoutAlt = 0

    body.forEach(block => {
      if (block._type === 'block') {
        const blockText = block.children.map(child => child.text).join('')
        plainText += ' ' + blockText
        if (block.style === 'h2') h2Count++
        if (block.style === 'h3') h3Count++
        if (JSON.stringify(block).includes('link')) hasLinks = true
      }
      if (block._type === 'image') {
        hasImages = true
        if (!block.alt) imagesWithoutAlt++
      }
    })

    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
    const keywordLower = mainKeyword.toLowerCase()
    
    // BASIC SEO CHECKS
    const basicSEO = [
      { label: "Focus Keyword in SEO Title", status: title.toLowerCase().includes(keywordLower) },
      { label: "Focus Keyword inside Meta Description", status: description.toLowerCase().includes(keywordLower) },
      { label: "Focus Keyword used in the URL", status: slug.includes(keywordLower.replace(/\s+/g, '-')) },
      { label: "Content is long enough (2500+ words)", status: wordCount >= 2500 },
    ]

    // ADDITIONAL CHECKS
    const additional = [
      { label: "Focus Keyword found in Subheading(s)", status: h2Count > 0 && plainText.toLowerCase().includes(keywordLower) },
      { label: "Add an image with Focus Keyword as Alt text", status: hasImages && imagesWithoutAlt === 0 },
      { label: "Keyword Density (Target: 0.5% - 1.5%)", status: wordCount > 0 && (plainText.match(new RegExp(keywordLower, 'gi')) || []).length / wordCount * 100 >= 0.5 },
      { label: "Link out to external resources", status: hasLinks },
    ]

    const totalChecks = [...basicSEO, ...additional]
    const passCount = totalChecks.filter(c => c.status).length
    const score = Math.round((passCount / totalChecks.length) * 100)

    return { wordCount, score, basicSEO, additional }
  }, [body, title, description, mainKeyword, slug])

  const renderSection = (title, items) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '8px', color: '#555', textTransform: 'uppercase' }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '12px', marginBottom: '6px' }}>
          <span style={{ marginRight: '8px' }}>{item.status ? '✅' : '❌'}</span>
          <span style={{ color: item.status ? '#2e7d32' : '#d32f2f' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cfd8dc', marginBottom: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', margin: 0, color: '#1a1a1a' }}>Rank Math SEO</h2>
        <div style={{ 
          width: '55px', height: '55px', borderRadius: '50%', border: `4px solid ${analysis.score > 80 ? '#4caf50' : analysis.score > 50 ? '#ffa000' : '#f44336'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', color: '#333'
        }}>
          {analysis.score}
        </div>
      </div>

      {renderSection("Basic SEO", analysis.basicSEO)}
      {renderSection("Additional", analysis.additional)}

      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dotted #ccc', fontSize: '11px', color: '#78909c' }}>
        <strong>Words:</strong> {analysis.wordCount} | <strong>Target:</strong> 2500 for USA/UK
      </div>
    </div>
  )
}
// --- RANK MATH STYLE SEO ANALYZER END ---

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
