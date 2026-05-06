import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

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
          { name: 'title', type: 'string', title: 'Title' },
          { name: 'slug', type: 'slug', options: { source: 'title' }, title: 'Slug' },
          { name: 'mainImage', type: 'image', title: 'Featured Image' },
          { name: 'body', type: 'array', of: [{type: 'block'}], title: 'Post Content' },
          { 
            name: 'description', 
            type: 'text', 
            title: 'Meta Description', 
            description: '১৪০ ক্যারেক্টারের মধ্যে রাখুন (SEO এর জন্য)' 
          }
        ]
      }
    ],
  },
})
