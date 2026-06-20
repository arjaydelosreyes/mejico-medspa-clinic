'use client'

import { useState, useEffect } from 'react'
import gsap from 'gsap'
import { Preloader } from './Preloader'
import { HeroSection } from './HeroSection'

export function LandingPageClient() {
  const [introReady, setIntroReady] = useState(false)
  const [skipPreloader, setSkipPreloader] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadyShown = sessionStorage.getItem('preloaderShown') === '1'
    if (reduced || alreadyShown) {
      setIntroReady(true)
      setSkipPreloader(true)
    }
    // sessionStorage key is written only in onDone, never here —
    // prevents React Strict Mode double-invocation from skipping the preloader
  }, [])

  // Phase 3 — hero entrance after curtain lifts
  useEffect(() => {
    if (!introReady) return

    const texts = gsap.utils.toArray<Element>('[data-hero-text]')
    const image = document.querySelector('[data-hero-image]')
    const line = document.querySelector('[data-scroll-line]')

    if (skipPreloader) {
      gsap.set(texts, { opacity: 1, y: 0 })
      if (image) gsap.set(image, { opacity: 1, x: 0 })
      if (line) gsap.set(line, { scaleY: 1 })
      return
    }

    gsap.fromTo(
      texts,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
    )
    if (image) {
      gsap.fromTo(
        image,
        { x: 80, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.15 }
      )
    }
    if (line) {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.6, ease: 'power3.out', transformOrigin: 'bottom center', delay: 0.75 }
      )
    }
  }, [introReady, skipPreloader])

  return (
    <>
      {!introReady && !skipPreloader && (
        <Preloader onDone={() => {
          sessionStorage.setItem('preloaderShown', '1')
          setIntroReady(true)
        }} />
      )}
      <HeroSection introReady={introReady} />
    </>
  )
}
