'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { User } from 'lucide-react'

type Tab = 'personal' | 'address' | 'medical'

export default function ProfilePage() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<Tab>('personal')
  const [loading, setLoading] = useState(false)

  const [personal, setPersonal] = useState({
    first_name: '', last_name: '', username: '', phone: '', gender: '', date_of_birth: '',
  })
  const [address, setAddress] = useState({
    house_street: '', barangay: '', city: '', province: '', postal_code: '',
  })
  const [medical, setMedical] = useState({
    allergies: '', chronic_conditions: '', skin_type: '', skin_conditions: '',
  })

  useEffect(() => {
    if (!profile) return
    setPersonal({
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      username: profile.username ?? '',
      phone: profile.phone ?? '',
      gender: profile.gender ?? '',
      date_of_birth: profile.date_of_birth ?? '',
    })

    const supabase = createClient()
    supabase.from('addresses').select('*').eq('profile_id', profile.id).maybeSingle()
      .then(({ data }) => {
        if (data) setAddress({
          house_street: data.house_street ?? '',
          barangay: data.barangay ?? '',
          city: data.city ?? '',
          province: data.province ?? '',
          postal_code: data.postal_code ?? '',
        })
      })
    supabase.from('medical_records').select('*').eq('profile_id', profile.id).maybeSingle()
      .then(({ data }) => {
        if (data) setMedical({
          allergies: data.allergies ?? '',
          chronic_conditions: data.chronic_conditions ?? '',
          skin_type: data.skin_type ?? '',
          skin_conditions: data.skin_conditions ?? '',
        })
      })
  }, [profile])

  async function savePersonal(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update(personal).eq('id', profile.id)
    setLoading(false)
    if (error) toast.error('Failed to save personal info.')
    else toast.success('Personal info updated!')
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('addresses').upsert({ ...address, profile_id: profile.id }, { onConflict: 'profile_id' })
    setLoading(false)
    if (error) toast.error('Failed to save address.')
    else toast.success('Address updated!')
  }

  async function saveMedical(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('medical_records').upsert({ ...medical, profile_id: profile.id }, { onConflict: 'profile_id' })
    setLoading(false)
    if (error) toast.error('Failed to save medical info.')
    else toast.success('Medical info updated!')
  }

  const initials = [personal.first_name[0], personal.last_name[0]].filter(Boolean).join('').toUpperCase() || '?'

  const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400'
  const labelClass = 'text-xs font-medium text-gray-500 block mb-1'

  const TABS: { key: Tab; label: string }[] = [
    { key: 'personal', label: 'Personal Info' },
    { key: 'address', label: 'Address' },
    { key: 'medical', label: 'Medical' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-16 text-center text-white" style={{ backgroundColor: '#1a1040' }}>
        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold"
          style={{ backgroundColor: '#6a4fb3' }}>
          {initials}
        </div>
        <h1 className="text-2xl font-bold">{personal.first_name} {personal.last_name}</h1>
        <p className="text-purple-300 text-sm mt-1">{profile?.role ?? 'client'}</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Tab bar */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? 'text-white' : 'text-gray-500 hover:text-gray-700'}`}
              style={tab === t.key ? { backgroundColor: '#6a4fb3' } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          {tab === 'personal' && (
            <form onSubmit={savePersonal} className="space-y-4">
              <h2 className="font-bold text-lg mb-2 flex items-center gap-2" style={{ color: '#382d6e' }}>
                <User size={18} /> Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input className={inputClass} value={personal.first_name}
                    onChange={e => setPersonal(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input className={inputClass} value={personal.last_name}
                    onChange={e => setPersonal(p => ({ ...p, last_name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Username</label>
                <input className={inputClass} value={personal.username}
                  onChange={e => setPersonal(p => ({ ...p, username: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={personal.phone} type="tel"
                  onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Gender</label>
                  <select className={inputClass} value={personal.gender}
                    onChange={e => setPersonal(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input className={inputClass} type="date" value={personal.date_of_birth}
                    onChange={e => setPersonal(p => ({ ...p, date_of_birth: e.target.value }))} />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #8573df, #382d6e)' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {tab === 'address' && (
            <form onSubmit={saveAddress} className="space-y-4">
              <h2 className="font-bold text-lg mb-2" style={{ color: '#382d6e' }}>Address</h2>
              <div>
                <label className={labelClass}>House / Street</label>
                <input className={inputClass} value={address.house_street}
                  onChange={e => setAddress(a => ({ ...a, house_street: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Barangay</label>
                <input className={inputClass} value={address.barangay}
                  onChange={e => setAddress(a => ({ ...a, barangay: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} value={address.city}
                    onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Province</label>
                  <input className={inputClass} value={address.province}
                    onChange={e => setAddress(a => ({ ...a, province: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Postal Code</label>
                <input className={inputClass} value={address.postal_code}
                  onChange={e => setAddress(a => ({ ...a, postal_code: e.target.value }))} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #8573df, #382d6e)' }}>
                {loading ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          )}

          {tab === 'medical' && (
            <form onSubmit={saveMedical} className="space-y-4">
              <h2 className="font-bold text-lg mb-2" style={{ color: '#382d6e' }}>Medical Information</h2>
              <div>
                <label className={labelClass}>Allergies</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={medical.allergies}
                  onChange={e => setMedical(m => ({ ...m, allergies: e.target.value }))}
                  placeholder="e.g. penicillin, latex..." />
              </div>
              <div>
                <label className={labelClass}>Chronic Conditions</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={medical.chronic_conditions}
                  onChange={e => setMedical(m => ({ ...m, chronic_conditions: e.target.value }))}
                  placeholder="e.g. diabetes, hypertension..." />
              </div>
              <div>
                <label className={labelClass}>Skin Type</label>
                <select className={inputClass} value={medical.skin_type}
                  onChange={e => setMedical(m => ({ ...m, skin_type: e.target.value }))}>
                  <option value="">Select</option>
                  <option value="normal">Normal</option>
                  <option value="dry">Dry</option>
                  <option value="oily">Oily</option>
                  <option value="combination">Combination</option>
                  <option value="sensitive">Sensitive</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Skin Conditions</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={medical.skin_conditions}
                  onChange={e => setMedical(m => ({ ...m, skin_conditions: e.target.value }))}
                  placeholder="e.g. acne, eczema..." />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #8573df, #382d6e)' }}>
                {loading ? 'Saving...' : 'Save Medical Info'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
