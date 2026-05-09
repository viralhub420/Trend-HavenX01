import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import React, { useMemo } from 'react'
import { useFormValue } from 'sanity'

// --- RANK MATH SEO ANALYZER COMPONENT ---
const SEOAnalyzer = () => {
  const title = useFormValue(['title']) || ''
  const description = useFormValue(['description']) || ''
  const body = useFormValue(['body']) || []
  const mainKeyword = useFormValue(['mainKeyword']) || ''
  const slug = useFormValue(['slug'])?.current || ''
  const mainImage = useFormValue(['mainImage'])

  const analysis = useMemo(() => {
    let plainText = ''
    let h2Count = 0
    let linkCount = 0
    let hasImages = false
    let imagesWithoutAlt = 0
    let paragraphCount = 0

    body.forEach(block => {
      if (block._type === 'block') {
        const blockText = block.children.map(child => child.text).join('')
        plainText += ' ' + blockText
        paragraphCount++
        if (block.style === 'h2' || block.style === 'h3') h2Count++
        
        block.children.forEach(child => {
          if (child.marks && child.marks.length > 0) linkCount++
        })
      }
      if (block._type === 'image') {
        hasImages = true
        if (!block.alt) imagesWithoutAlt++
      }
    })

    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
    const keywordLower = mainKeyword.toLowerCase()
    
    // Keyword Occurrence Logic
    const keywordOccurrence = (mainKeyword && plainText) 
      ? (plainText.toLowerCase().match(new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length 
      : 0
    
    const density = wordCount > 0 ? ((keywordOccurrence / wordCount) * 100).toFixed(2) : 0

    // SEO Categories
    const basicSEO = [
      { label: "Focus Keyword in Title", status: title.toLowerCase().includes(keywordLower) },
      { label: "Focus Keyword in Description", status: description.toLowerCase().includes(keywordLower) },
      { label: "Focus Keyword in URL", status: slug.includes(keywordLower.replace(/\s+/g, '-')) },
      { label: `Content length: ${wordCount} words (Target: 2500)`, status: wordCount >= 2500 },
    ]

    const additional = [
      { label: `Keyword in Subheadings (${h2Count} found)`, status: h2Count > 0 && plainText.toLowerCase().includes(keywordLower) },
      { label: `Keyword Density: ${density}% (${keywordOccurrence} times)`, status: density >= 0.5 && density <= 1.5 },
      { label: `Links: ${linkCount} added`, status: linkCount > 0 },
      { label: "Featured Image with Alt Text", status: !!mainImage && !!mainImage.alt },
    ]

    const titleReadability = [
      { label: "Keyword at beginning of Title", status: title.toLowerCase().startsWith(keywordLower) },
      { label: "Title contains a number", status: /\d+/.test(title) },
      { label: "Title has power words", status: /(Best|Ultimate|Top|Guide|Tips|2026)/i.test(title) },
    ]

    const allChecks = [...basicSEO, ...additional, ...titleReadability]
    const score = Math.round((allChecks.filter(c => c.status).length / allChecks.length) * 100)

    return { score, basicSEO, additional, titleReadability, wordCount, keywordOccurrence }
  }, [body, title, description, mainKeyword, slug, mainImage])

  const renderSection = (header, items) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase' }}>{header}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
          <span style={{ marginRight: '8px' }}>{item.status ? '✅' : '❌'}</span>
          <span style={{ color: item.status ? '#2e7d32' : '#d32f2f' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Rank Math SEO</h3>
        <div style={{ 
          width: '45px', height: '45px', borderRadius: '50%', border: `3px solid ${analysis.score > 80 ? '#4caf50' : '#ffa000'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px'
        }}>
          {analysis.score}
        </div>
      </div>
      {renderSection("Basic SEO", analysis.basicSEO)}
      {renderSection("Additional", analysis.additional)}
      {renderSection("Title Readability", analysis.titleReadability)}
    </div>
  )
}

// --- MAIN CONFIGURATION ---
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
          title: 'SEO Checklist',
          type: 'string',
          components: { field: SEOAnalyzer },
          readOnly: true
        },
        { name: 'title', type: 'string', title: 'Title' },
        { name: 'mainKeyword', type: 'string', title: 'Focus Keyword' },
        { name: 'slug', type: 'slug', options: { source: 'title' } },

        // ১. ক্যাটাগরি অপশন (Category)
        {
          name: 'category',
          type: 'string',
          title: 'Category',
          options: {
            list: [
              { title: 'AI Tools', value: 'ai-tools' },
              { title: 'Make Money Online', value: 'make-money' },
              { title: 'Health & Wellness', value: 'health' },
              { title: 'Tech News', value: 'tech-news' }
            ],
          },
        },

        // ২. ট্যাগ অপশন (Tags)
        {
          name: 'tags',
          type: 'array',
          title: 'Tags',
          of: [{ type: 'string' }],
          options: { layout: 'tags' }
        },

        { name: 'mainImage', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Alt Text' }] },

        // ৩. ইন্টারনাল ও এক্সটারনাল লিংক অপশন (Body-র ভেতর)
        { 
          name: 'body', 
          type: 'array', 
          title: 'Content Body',
          of: [
            { 
              type: 'block',
              marks: {
                annotations: [
                  // এক্সটারনাল লিংক (External Link)
                  {
                    name: 'link',
                    type: 'object',
                    title: 'External Link',
                    fields: [
                      {
                        name: 'href',
                        type: 'url',
                        title: 'URL'
                      }
                    ]
                  },
                  // ইন্টারনাল লিংক (Internal Link - অন্য পোস্টের সাথে কানেক্ট করার জন্য)
                  {
                    name: 'internalLink',
                    type: 'object',
                    title: 'Internal Link',
                    fields: [
                      {
                        name: 'reference',
                        type: 'reference',
                        title: 'Reference',
                        to: [{ type: 'post' }] 
                      }
                    ]
                  }
                ]
              }
            }, 
            { type: 'image', fields: [{ name: 'alt', type: 'string' }] }
          ] 
        },

        { name: 'description', type: 'text', title: 'Meta Description' }
      ]
    }
  ]
  }
