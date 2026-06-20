'use client'

import { ReactLenis } from 'lenis/react'
import type { ReactNode } from 'react'

const LENIS_OPTIONS = {
  lerp: 0.08,
  smoothWheel: true,
  smoothTouch: false as const,
  touchMultiplier: 1.5,
  wheelMultiplier: 0.8,
}

export default function LenisWrapper({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      {children}
    </ReactLenis>
  )
}
