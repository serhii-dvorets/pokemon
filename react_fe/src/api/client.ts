import type { ApiErrorPayload } from '../types/pokemon'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8000'

export class ApiError extends Error {
  statusCode: number

  code?: string

  messages: string[]

  constructor(statusCode: number, message: string, code?: string, messages?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.messages = messages || [message]
  }
}

function toApiError(statusCode: number, payload: unknown): ApiError {
  const body = (payload || {}) as ApiErrorPayload
  const message = Array.isArray(body.message)
    ? body.message.join(', ')
    : body.message || body.code || `Request failed with status ${statusCode}`

  const messages = body.messages || (Array.isArray(body.message) ? body.message : undefined)

  return new ApiError(statusCode, message, body.code, messages)
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    throw toApiError(response.status, payload)
  }

  return payload as T
}

export function getApiBaseUrl(): string {
  return API_BASE_URL
}