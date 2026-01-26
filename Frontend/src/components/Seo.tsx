import { useEffect } from 'react'

type SeoProps = {
  title?: string
  description?: string
  noindex?: boolean
  canonicalPath?: string
}

const SITE_NAME = 'AxisCloud'

function buildCanonicalUrl(pathname?: string) {
  if (typeof window === 'undefined') return undefined
  const origin = window.location.origin
  const path = pathname ?? window.location.pathname
  const safePath = path.startsWith('/') ? path : `/${path}`
  return `${origin}${safePath}`
}

export function Seo({ title, description, noindex, canonicalPath }: SeoProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const canonical = buildCanonicalUrl(canonicalPath)

  useEffect(() => {
    document.title = fullTitle

    const ensureMeta = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        document.head.appendChild(el)
      }
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v)
      }
    }

    const ensureLink = (selector: string, attrs: Record<string, string>) => {
      let el = document.head.querySelector(selector) as HTMLLinkElement | null
      if (!el) {
        el = document.createElement('link')
        document.head.appendChild(el)
      }
      for (const [k, v] of Object.entries(attrs)) {
        el.setAttribute(k, v)
      }
    }

    ensureMeta('meta[name="application-name"]', { name: 'application-name', content: SITE_NAME })
    ensureMeta('meta[name="theme-color"]', { name: 'theme-color', content: '#0f172a' })
    ensureMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' })

    if (description) {
      ensureMeta('meta[name="description"]', { name: 'description', content: description })
    }

    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    if (description) {
      ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    }
    if (canonical) {
      ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    }

    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' })
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    if (description) {
      ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    }

    if (canonical) {
      ensureLink('link[rel="canonical"]', { rel: 'canonical', href: canonical })
    }
  }, [fullTitle, description, noindex, canonical])

  return null
}
