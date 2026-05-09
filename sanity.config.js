import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import React, { useMemo } from 'react'
import { useFormValue } from 'sanity'

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
    let internalLinks = 0
    let externalLinks = 0
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
          if (child.marks && child.marks.length > 0) {
            // সিম্পল লিংক ডিটেকশন (ইন্টারনাল vs এক্সটারনাল)
            internalLinks++ 
          }
        })
      }
      if (block._type === 'image') {
        hasImages = true
        if (!block.alt) imagesWithoutAlt++
      }
    })

    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
    const keywordLower = mainKeyword.toLowerCase()
    const keywordOccurrence = mainKeyword ? (plainText.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length : 0
    const density = wordCount > 0 ? ((keywordOccurrence / wordCount) * 100).toFixed(2) : 0

    // ১. Basic SEO
    const basicSEO = [
      { label: "Focus Keyword in Title", status: title.toLowerCase().includes(keywordLower) },
      { label: "Focus Keyword in Meta Description", status: description.toLowerCase().includes(keywordLower) },
      { label: "Focus Keyword in URL", status: slug.includes(keywordLower.replace(/\s+/g, '-')) },
      { label: `Content length: ${wordCount} words`, status: wordCount >= 2500 },
    ]

    // ২. Additional
    const additional = [
      { label: `Keyword in Subheadings (${h2Count} found)`, status: h2Count > 0 && plainText.toLowerCase().includes(keywordLower) },
      { label: `Keyword Density: ${density}% (${keywordOccurrence} times)`, status: density >= 0.5 && density <= 1.5 },
      { label: `Internal/External Links (${internalLinks} total)`, status: internalLinks > 0 },
      { label: "Featured Image with Alt Text", status: !!mainImage && !!mainImage.alt },
    ]

    // ৩. Title Readability (WordPress Style)
    const titleReadability = [
      { label: "Keyword at the beginning of Title", status: title.toLowerCase().startsWith(keywordLower) },
      { label: "Title contains a number", status: /\d+/.test(title) },
      { label: "Title has positive/negative sentiment", status: /(Best|Ultimate|Top|Easy|Guide|Tips|2026)/i.test(title) },
    ]

    // ৪. Content Readability
    const contentReadability = [
      { label: "Use of short paragraphs", status: (wordCount / paragraphCount) < 40 },
      { label: "Content contains images/videos", status: hasImages || !!mainImage },
    ]

    const allChecks = [...basicSEO, ...additional, ...titleReadability, ...contentReadability]
    const passCount = allChecks.filter(c => c.status).length
    const score = Math.round((passCount / allChecks.length) * 100)

    return { score, basicSEO, additional, titleReadability, contentReadability, wordCount, keywordOccurrence }
  }, [body, title, description, mainKeyword, slug, mainImage])

  const renderSection = (header, items) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px' }}>{header}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', marginBottom: '6px' }}>
          <span style={{ marginRight: '10px' }}>{item.status ? '✅' : '❌'}</span>
          <span style={{ color: item.status ? '#2e7d32' : '#d32f2f' }}>{item.label}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ padding: '20px', backgroundColor: '#fdfdfd', borderRadius: '10px', border: '1px solid #ddd', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Rank Math SEO</h3>
        <div style={{ 
          width: '60px', height: '60px', borderRadius: '50%', 
          border: `5px solid ${analysis.score > 80 ? '#4caf50' : analysis.score > 50 ? '#ffa000' : '#f44336'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px'
        }}>
          {analysis.score}
        </div>
      </div>

      {renderSection("Basic SEO", analysis.basicSEO)}
      {renderSection("Additional", analysis.additional)}
      {renderSection("Title Readability", analysis.titleReadability)}
      {renderSection("Content Readability", analysis.contentReadability)}

      <div style={{ fontSize: '11px', color: '#999', borderTop: '1px dotted #ccc', paddingTop: '10px' }}>
        Word Count: <b>{analysis.wordCount}</b> | Keyword: <b>{analysis.keywordOccurrence} times</b>
      </div>
    </div>
  )
}
