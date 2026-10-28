import type { MetadataRoute } from 'next'

const siteUrl = 'https://frameriophoto.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/admin/', '/api/', '/booth/', '/gallery/', '/payment/']
    },
    sitemap: `${siteUrl}/sitemap.xml`
  }
}
