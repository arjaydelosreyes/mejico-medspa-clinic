import type { Metadata } from 'next'
import { Jost, Bodoni_Moda } from 'next/font/google'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { AuthProvider } from '@/context/AuthContext'
import { QueryProvider } from '@/context/QueryProvider'
import './globals.css'

const jost = Jost({ subsets: ['latin'], variable: '--font-sans', weight: ['300', '400', '500', '600', '700'] })
const bodoni = Bodoni_Moda({ subsets: ['latin'], variable: '--font-serif', weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Mejico MedSpa Clinic',
  description: 'Book appointments and manage your medical spa experience.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn('font-sans', jost.variable, bodoni.variable)}>
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
