'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp } from 'lucide-react'

type Profile = {
  id: string; user_id: string; first_name: string | null; last_name: string | null
  username: string | null; role: string; created_at: string
}
type Address = { house_street: string | null; barangay: string | null; city: string | null; province: string | null; postal_code: string | null }
type Medical = { allergies: string | null; chronic_conditions: string | null; skin_type: string | null }

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [details, setDetails] = useState<Record<string, { address: Address | null; medical: Medical | null }>>({})

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('id, user_id, first_name, last_name, username, role, created_at').order('created_at', { ascending: false })
    setProfiles(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (details[id]) return
    const supabase = createClient()
    const [{ data: addr }, { data: med }] = await Promise.all([
      supabase.from('addresses').select('house_street, barangay, city, province, postal_code').eq('profile_id', id).maybeSingle(),
      supabase.from('medical_records').select('allergies, chronic_conditions, skin_type').eq('profile_id', id).maybeSingle(),
    ])
    setDetails(prev => ({ ...prev, [id]: { address: addr, medical: med } }))
  }

  async function updateRole(id: string, role: string) {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) { toast.error('Failed to update role.'); return }
    toast.success('Role updated!')
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role } : p))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#382d6e' }}>Profiles</h1>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: '#f5f3ff' }}>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <>
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-medium" style={{ color: '#382d6e' }}>
                    {[p.first_name, p.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.username ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.role}
                      onChange={e => updateRole(p.id, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none"
                    >
                      <option value="client">client</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleExpand(p.id)} className="text-purple-500 hover:text-purple-700">
                      {expanded === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                </tr>
                {expanded === p.id && details[p.id] && (
                  <tr key={`${p.id}-detail`} className="bg-purple-50">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <p className="font-semibold text-purple-700 mb-1">Address</p>
                          {details[p.id].address ? (
                            <p>{[details[p.id].address?.house_street, details[p.id].address?.barangay, details[p.id].address?.city, details[p.id].address?.province].filter(Boolean).join(', ') || '—'}</p>
                          ) : <p className="text-gray-400">No address on file.</p>}
                        </div>
                        <div>
                          <p className="font-semibold text-purple-700 mb-1">Medical</p>
                          {details[p.id].medical ? (
                            <>
                              <p>Allergies: {details[p.id].medical?.allergies || '—'}</p>
                              <p>Conditions: {details[p.id].medical?.chronic_conditions || '—'}</p>
                              <p>Skin type: {details[p.id].medical?.skin_type || '—'}</p>
                            </>
                          ) : <p className="text-gray-400">No medical record.</p>}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {profiles.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No profiles.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
