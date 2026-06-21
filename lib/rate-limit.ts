import type { NextRequest } from 'next/server'

interface RateLimitRecord {
  count:   number
  resetAt: number
}

const store = new Map<string, RateLimitRecord>()

export function checkRateLimit(
  key:      string,
  max:      number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now    = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1 }
  }

  if (record.count >= max) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: max - record.count }
}

export function getRateLimitKey(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  )
}
