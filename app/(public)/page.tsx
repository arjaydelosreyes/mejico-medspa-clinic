import Link from 'next/link'
import Image from 'next/image'
import { Carousel } from '@/components/public/Carousel'
import { LandingAbout } from '@/components/public/LandingAbout'
import { Footer } from '@/components/shared/Footer'

export default function LandingPage() {
  return (
    <main>
      {/* Fixed header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(26, 16, 64, 0.85)' }}
      >
        <Image
          src="/images/mejico-MDSpa-logo-ntext.png"
          alt="Mejico MedSpa"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
        />
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full text-sm font-medium text-white border border-purple-400 hover:bg-purple-800 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-full text-sm font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: '#6a4fb3' }}
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center text-center"
        style={{
          backgroundImage: 'url(/images/MEJICO-bg-2.1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(26, 16, 64, 0.6)' }}
        />
        <div className="relative z-10 px-6 max-w-3xl">
          <Image
            src="/images/mejico-MDSpa-logo-transparent.png"
            alt="Mejico MedSpa Logo"
            width={160}
            height={160}
            className="mx-auto mb-6 animate-pulse"
          />
          <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
            Welcome to<br />
            <span style={{ color: '#8573df' }}>Mejico MedSpa Clinic</span>
          </h1>
          <p className="text-purple-200 text-lg mb-8">
            Your sanctuary for beauty, wellness, and self-care. Book your appointment today.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 rounded-full text-white font-semibold text-lg transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #8573df, #382d6e)' }}
          >
            Book Appointment
          </Link>
        </div>
      </section>

      <Carousel />
      <LandingAbout />
      <Footer />
    </main>
  )
}
