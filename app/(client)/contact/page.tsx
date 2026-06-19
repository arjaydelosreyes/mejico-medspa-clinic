'use client'

import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { toast } from 'sonner'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRef.current) return
    setLoading(true)
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      toast.success("Message sent! We'll get back to you soon.")
      formRef.current.reset()
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa, #e4e8ff)' }}>
      <div className="py-20 text-center text-white" style={{ backgroundColor: '#1a1040' }}>
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="text-purple-300 mt-2">{"We'd love to hear from you"}</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#382d6e' }}>Send a Message</h2>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <input name="from_name" type="text" placeholder="Your name" required className={inputClass} />
            <input name="from_email" type="email" placeholder="Email address" required className={inputClass} />
            <input name="subject" type="text" placeholder="Subject" required className={inputClass} />
            <textarea name="message" rows={5} placeholder="Your message" required className={`${inputClass} resize-none`} />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8573df, #382d6e)' }}
            >
              <Send size={16} />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Contact info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold" style={{ color: '#382d6e' }}>Get In Touch</h2>
          {[
            { Icon: Mail, label: 'Email', value: 'mejicomedspa@gmail.com' },
            { Icon: Phone, label: 'Phone', value: '+63 912 345 6789' },
            { Icon: MapPin, label: 'Address', value: 'Davao City, Philippines' },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#6a4fb3' }}
              >
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#382d6e' }}>{label}</p>
                <p className="text-gray-600 text-sm">{value}</p>
              </div>
            </div>
          ))}

          <div className="rounded-2xl overflow-hidden bg-purple-50 h-48 flex items-center justify-center mt-4">
            <p className="text-sm text-gray-400">Davao City, Philippines</p>
          </div>
        </div>
      </div>
    </div>
  )
}
