import type { MetadataRoute } from 'next'
import { industries } from '@/lib/industries'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://pivotcalls.co'
  const now = new Date()

  const corePages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/demo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const industryIndex: MetadataRoute.Sitemap = [
    {
      url: `${base}/industries`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
  ]

  const industryPages: MetadataRoute.Sitemap = industries.map((ind) => ({
    url: `${base}/industries/${ind.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...corePages, ...industryIndex, ...industryPages]
}
