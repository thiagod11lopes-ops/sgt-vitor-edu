import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getSurfaceHref, isAbsoluteHref, type DeploymentSurface } from '@/config/deployment'

type SurfaceTarget = Exclude<DeploymentSurface, 'all'>

interface SurfaceLinkProps {
  surface: SurfaceTarget
  path: string
  className?: string
  children: ReactNode
}

export function SurfaceLink({ surface, path, className, children }: SurfaceLinkProps) {
  const href = getSurfaceHref(surface, path)

  if (isAbsoluteHref(href)) {
    return (
      <a href={href} className={className} rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}
