export type TargetKind = 'nic' | 'ip' | 'cidr' | 'mac'
export type DestinationKind = 'nic' | 'ip' | 'mac'

export interface StatusResponse {
  installed: boolean
  state: string
  config_path: string
  rule_count: number
  version: string
}

export interface RoutingRule {
  target: TargetKind
  'target-value': string
  destination: DestinationKind
  'destination-value': string
}

export interface RouteItem extends RoutingRule {
  index: number
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  const res = await fetch(`/api${path}`, { ...options, headers })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({ error: res.statusText }))) as {
      error?: string
    }
    throw new Error(body.error || `Request failed (${res.status})`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const api = {
  getStatus: () => request<StatusResponse>('/status'),
  listRoutes: () => request<RouteItem[]>('/routes'),
  createRoute: (rule: RoutingRule) =>
    request<RouteItem>('/routes', {
      method: 'POST',
      body: JSON.stringify(rule),
    }),
  updateRoute: (index: number, rule: RoutingRule) =>
    request<RouteItem>(`/routes/${index}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    }),
  deleteRoute: (index: number) =>
    request<void>(`/routes/${index}`, { method: 'DELETE' }),
}
