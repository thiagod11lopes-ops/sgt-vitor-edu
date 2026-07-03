/** Resolve caminho estático da loja (funciona com base `/sgt-vitor-edu/` no GitHub Pages). */
const LEGACY_IMAGE_MAP: Record<string, string> = {
  '/store/revolver.png': 'store/revolver.svg',
  '/store/glock.png': 'store/glock.svg',
  '/store/taurus-g2c.png': 'store/taurus-g2c.svg',
  '/store/municao-cbc.png': 'store/municao-cbc.svg',
  '/store/coldre.png': 'store/coldre.svg',
  '/store/mira-red-dot.png': 'store/mira-red-dot.svg',
}

export function resolveStoreImage(image: string): string {
  if (!image) return ''
  if (/^(https?:|data:)/i.test(image)) return image

  const mapped = LEGACY_IMAGE_MAP[image] ?? image
  const normalized = mapped.replace(/^\//, '')
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${normalized}`
}
