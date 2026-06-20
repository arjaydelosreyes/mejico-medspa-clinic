import LenisWrapper from './LenisWrapper'
import type { ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <LenisWrapper>{children}</LenisWrapper>
}
