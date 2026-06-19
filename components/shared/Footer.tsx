import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#382d6e' }} className="text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Image
            src="/images/mejico-MDSpa-logo-ntext.png"
            alt="Mejico MedSpa"
            width={100}
            height={36}
            className="mb-4 h-9 w-auto object-contain"
          />
          <p className="text-sm text-purple-200 leading-relaxed">
            Your trusted partner in wellness and aesthetic care.
          </p>
          <div className="flex gap-3 mt-4">
            {['f', 'in', 'tw'].map(label => (
              <span
                key={label}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition text-xs font-bold"
                style={{ backgroundColor: '#6a4fb3' }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-4">Services</h4>
          <ul className="space-y-2 text-sm text-purple-200">
            {['Skin Care', 'Body Treatments', 'Laser Therapy', 'IV Drip', 'Consultations'].map(s => (
              <li key={s} className="hover:text-white transition cursor-pointer">{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-4">Useful Links</h4>
          <ul className="space-y-2 text-sm text-purple-200">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
            <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm text-purple-200">
            <li className="flex items-center gap-2"><Mail size={16} /> mejicomedspa@gmail.com</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +63 912 345 6789</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> Leuterio, San Vicente West, Calapan City, Oriental Mindoro</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-purple-800 pt-6 text-center text-xs text-purple-300">
        &copy; 2026 Mejico MedSpa Clinic. All rights reserved.
      </div>
    </footer>
  )
}
