import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

const ACTION_LABELS: Record<string, string> = {
  login_success:             'Login Success',
  login_failure:             'Login Failure',
  logout:                    'Logout',
  role_change:               'Role Change',
  password_reset_request:    'Password Reset Request',
  appointment_status_change: 'Appointment Status Change',
  cancellation_approved:     'Cancellation Approved',
  cancellation_rejected:     'Cancellation Rejected',
}

const ACTION_COLORS: Record<string, string> = {
  login_success:          'bg-green-100 text-green-800',
  login_failure:          'bg-red-100 text-red-800',
  role_change:            'bg-purple-100 text-purple-800',
  password_reset_request: 'bg-yellow-100 text-yellow-800',
}

export default async function AuditLogsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  // Fetch profiles for all user IDs in logs
  const userIds = Array.from(new Set(logs?.map(l => l.user_id).filter(Boolean) ?? []))
  const { data: profiles } = userIds.length > 0
    ? await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds)
    : { data: [] }

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) ?? [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Showing the last 200 security events. Logs are read-only.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="px-4 py-3">Date / Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs?.map(log => {
              const profile = log.user_id ? profileMap.get(log.user_id) : null
              const colorClass = ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700'

              return (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {log.created_at
                      ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {profile
                      ? <span className="font-medium text-gray-800">{profile.first_name} {profile.last_name}</span>
                      : <span className="text-gray-400 text-xs">{log.user_id ? log.user_id.slice(0, 8) + '…' : '—'}</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                      {ACTION_LABELS[log.action] ?? log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {log.target_type
                      ? `${log.target_type}${log.target_id ? ` · ${log.target_id.slice(0, 8)}…` : ''}`
                      : '—'
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">
                    {log.metadata && Object.keys(log.metadata).length > 0
                      ? JSON.stringify(log.metadata)
                      : '—'
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {log.ip_address ?? '—'}
                  </td>
                </tr>
              )
            })}
            {!logs?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  No audit events recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
