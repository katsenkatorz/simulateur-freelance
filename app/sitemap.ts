import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://simulateur-freelance-ten.vercel.app'
  const now = new Date()

  return [
    { url: base, lastModified: now, priority: 0.8 },
    { url: `${base}/micro`, lastModified: now, priority: 0.9 },
    { url: `${base}/ei`, lastModified: now, priority: 0.8 },
    { url: `${base}/eurl`, lastModified: now, priority: 0.8 },
    { url: `${base}/sasu`, lastModified: now, priority: 0.9 },
    { url: `${base}/holding`, lastModified: now, priority: 0.7 },
    { url: `${base}/comparer`, lastModified: now, priority: 0.85 },
    { url: `${base}/salarie`, lastModified: now, priority: 0.9 },
    { url: `${base}/portage`, lastModified: now, priority: 0.7 },
  ]
}
