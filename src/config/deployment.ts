export type DeploymentSurface = 'app' | 'system-admin' | 'store-admin' | 'all'

function parseHostname(url?: string): string | null {
  if (!url?.trim()) return null
  try {
    return new URL(url.trim()).hostname
  } catch {
    return null
  }
}

export function getDeploymentSurface(): DeploymentSurface {
  const forced = import.meta.env.VITE_DEPLOYMENT_SURFACE as DeploymentSurface | undefined
  if (forced === 'app' || forced === 'system-admin' || forced === 'store-admin') {
    return forced
  }

  if (typeof window === 'undefined') return 'all'

  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'all'
  if (hostname.endsWith('.github.io')) return 'all'

  const storeHost = parseHostname(import.meta.env.VITE_STORE_ADMIN_URL)
  const adminHost = parseHostname(import.meta.env.VITE_SYSTEM_ADMIN_URL)
  const appHost = parseHostname(import.meta.env.VITE_APP_URL)

  if (storeHost && hostname === storeHost) return 'store-admin'
  if (adminHost && hostname === adminHost) return 'system-admin'
  if (appHost && hostname === appHost) return 'app'

  return 'all'
}

export function isAbsoluteHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}

export function getSurfaceHref(
  target: Exclude<DeploymentSurface, 'all'>,
  path: string,
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const baseByTarget = {
    app: import.meta.env.VITE_APP_URL,
    'system-admin': import.meta.env.VITE_SYSTEM_ADMIN_URL,
    'store-admin': import.meta.env.VITE_STORE_ADMIN_URL,
  } as const

  const base = baseByTarget[target]?.replace(/\/$/, '')
  return base ? `${base}${normalizedPath}` : normalizedPath
}

export function getAppUrl(path = '/'): string {
  return getSurfaceHref('app', path)
}

export function getSystemAdminUrl(path = '/admin/login'): string {
  return getSurfaceHref('system-admin', path)
}

export function getStoreAdminUrl(path = '/loja-admin/login'): string {
  return getSurfaceHref('store-admin', path)
}
