import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import React from 'react'

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
          // RANK MATH STYLE SEO ANALYZER
          {
            name: 'seoAnalyzer',
            title: 'Rank Math SEO Analysis',
            type: 'string',
            readOnly: true,
            components: {
              field: (props) => {
                const { document } = props
                const title = document?.title || ''
                const description = document?.description || ''
                const body = document?.body || []
                const mainKeyword = document?.mainKeyword || '' 
                
                const text = body
                  .map(block => (block._type === 'block' ? block.children.map(child => child.text).join('') : ''))
                  .join(' ')
                const wordCount = text.split(/\s+/).filter(Boolean).length

                let density = 0
                if (mainKeyword && text) {
                  const regex = new RegExp(`\\b${mainKeyword}\\b`, 'gi')
                  const count = (text.match(regex) || []).length
                  density = wordCount > 0 ? ((count / wordCount) * 100).toFixed(2) : 0
                }

                let score = 0
                if (title.length > 10) score += 20
                if (description.length >= 50 && description.length <= 140) score += 20
                if (wordCount >= 2500) score += 30
                if (density >= 0.5 && density <= 1.5) score += 30 

                return (
                  <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>SEO Performance</strong>
                      <span style={{ fontWeight: 'bold', color: score > 80 ? 'green' : 'orange' }}>Score: {score}/100</span>
                    </div>
                    <ul style={{ fontSize: '13px', listStyle: 'none', padding: 0 }}>
                      <li>{wordCount >= 2500 ? '✅' : '❌'} শব্দ সংখ্যা: {wordCount} (লক্ষ্য: ২৫০০)</li>
                      <li>{density >= 0.5 && density <= 1.5 ? '✅' : '⚠️'} কিউওয়ার্ড ডেনসিটি: {density}%</li>
                    </ul>
                  </div>
                )
              }
            }
          },
          { name: 'title', type: 'string', title: 'Title' },
          { name: 'mainKeyword', type: 'string', title: 'Focus Keyword', description: 'আপনার মেইন কিউওয়ার্ডটি এখানে দিন।' },
          { name: 'slug', type: 'slug', options: { source: 'title' }, title: 'Slug' },
          
          // ক্যাটাগরি এবং ট্যাগ অপশন
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
        
