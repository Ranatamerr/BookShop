import type { Hono } from 'hono'

export function createTestClient(app: Hono) {
  return {
    get: (path: string, options?: RequestInit) => {
      return app.request(path, { method: 'GET', ...options })
    },
    post: (path: string, body?: unknown, options?: RequestInit) => {
      return app.request(path, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      })
    },
    put: (path: string, body?: unknown, options?: RequestInit) => {
      return app.request(path, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      })
    },
    delete: (path: string, options?: RequestInit) => {
      return app.request(path, { method: 'DELETE', ...options })
    },
  }
}
