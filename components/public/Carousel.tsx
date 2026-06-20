'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Autoplay, Navigation, Pagination } from 'swiper/modules'
import Image from 'next/image'

import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const slides = [
  {
    img: '/images/productimg1.png',
    title: 'Premium Skin Care',
    desc: 'Our medical-grade skin care treatments are designed to rejuvenate and restore your natural glow using the latest dermatological advances.',
  },
  {
    img: '/images/productimg2.png',
    title: 'Body Contouring',
    desc: 'Achieve your ideal silhouette with our non-invasive body contouring treatments, tailored to your unique body goals and concerns.',
  },
  {
    img: '/images/productimg3.png',
    title: 'Laser Therapy',
    desc: 'State-of-the-art laser treatments for hair removal, skin resurfacing, and pigmentation correction with minimal downtime.',
  },
  {
    img: '/images/productimg4.png',
    title: 'IV Drip Therapy',
    desc: 'Revitalize from the inside out with our customized IV vitamin drips, formulated to boost immunity, energy, and radiance.',
  },
  {
    img: '/images/productimg5.png',
    title: 'Facial Rejuvenation',
    desc: 'Turn back the clock with our comprehensive facial rejuvenation services, from chemical peels to microneedling and beyond.',
  },
  {
    img: '/images/productimg6.png',
    title: 'Wellness Programs',
    desc: 'Holistic wellness programs designed to balance your mind, body, and spirit through integrated medical spa therapies.',
  },
]

export function Carousel() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <section className="py-16 bg-brand-deeper">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white tracking-widest">WHY CHOOSE US?</h2>
        <div className="mx-auto mt-3 h-1 w-24 rounded bg-brand-light" />
      </div>

      <Swiper
        modules={[EffectCoverflow, Autoplay, Navigation, Pagination]}
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView="auto"
        coverflowEffect={{ rotate: 40, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        className="w-full pb-12"
        style={{ paddingTop: '1rem' }}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i} style={{ width: '300px' }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl mx-2 bg-brand-dark">
              <div className="relative h-48 w-full">
                <Image src={slide.img} alt={slide.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="text-white font-semibold text-base mb-2">{slide.title}</h3>
                <p className="text-purple-200 text-sm leading-relaxed">
                  {expanded === i ? slide.desc : `${slide.desc.slice(0, 80)}...`}
                </p>
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="mt-3 text-xs font-medium hover:opacity-80 transition px-3 py-1 rounded-full bg-brand text-white"
                >
                  {expanded === i ? 'Read less' : 'Read more'}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
