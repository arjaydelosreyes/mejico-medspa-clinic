import Image from 'next/image'
import { Target, Eye } from 'lucide-react'
import type React from 'react'

export function LandingAbout() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-purple-100">
      <div
        data-reveal
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-brand-dark">ABOUT US</h2>
        <p className="mt-2 text-gray-600">Excellence in Medical Aesthetics</p>
      </div>

      {/* Our Story */}
      <div
        data-reveal
        style={{ '--reveal-delay': '80ms' } as React.CSSProperties}
        className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center mb-16"
      >
        <Image
          src="/images/mejico-image5.png"
          alt="Our Story"
          width={500}
          height={400}
          className="rounded-2xl shadow-lg object-cover"
        />
        <div>
          <h3 className="text-2xl font-bold mb-4 text-brand-dark">Our Story</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Mejico MedSpa Clinic was founded with a vision to provide world-class aesthetic
            and wellness services to every individual. We believe beauty and confidence go
            hand-in-hand.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our team of licensed professionals combines cutting-edge technology with
            personalized care to deliver results you&apos;ll love.
          </p>
        </div>
      </div>

      {/* Meet Our Founder */}
      <div
        data-reveal
        style={{ '--reveal-delay': '80ms' } as React.CSSProperties}
        className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center mb-16"
      >
        <div className="order-2 md:order-1">
          <h3 className="text-2xl font-bold mb-4 text-brand-dark">Meet Our Founder</h3>
          <p className="text-gray-700 leading-relaxed">
            With over a decade of experience in medical aesthetics, our founder established
            Mejico MedSpa Clinic to make premium treatments accessible and inclusive for
            everyone.
          </p>
        </div>
        <Image
          src="/images/mejico-MDSpa-logo.png"
          alt="Our Founder"
          width={500}
          height={400}
          className="rounded-2xl shadow-lg object-contain order-1 md:order-2"
        />
      </div>

      {/* Mission & Vision */}
      <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        {[
          {
            Icon: Target,
            title: 'Our Mission',
            text: 'To empower every client with transformative aesthetic care that enhances natural beauty and boosts confidence through safe, evidence-based treatments.',
          },
          {
            Icon: Eye,
            title: 'Our Vision',
            text: 'To be the leading medical spa in the region, recognized for excellence in care, innovation, and a welcoming environment for all.',
          },
        ].map(({ Icon, title, text }, i) => (
          <div
            key={title}
            data-reveal
            style={{ '--reveal-delay': `${i * 150}ms` } as React.CSSProperties}
            className="bg-white rounded-2xl p-8 shadow-md hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-brand">
                <Icon size={20} className="text-white" />
              </div>
              <h4 className="text-lg font-bold text-brand-dark">{title}</h4>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
