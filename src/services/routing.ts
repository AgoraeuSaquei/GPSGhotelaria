export type Coordinate = { latitude: number; longitude: number }

export type WalkingStep = {
  instruction: string
  distance: number
  duration: number
}

export type WalkingRoute = {
  geometry: [number, number][]
  distance: number
  duration: number
  steps: WalkingStep[]
}

const DEFAULT_ENDPOINT = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson'

function envValue(name: string, fallback = ''): string {
  return (import.meta.env[name] as string | undefined)?.trim() || fallback
}

export function hasRoutingConfiguration(): boolean {
  return Boolean(envValue('VITE_ORS_API_KEY'))
}

export async function fetchWalkingRoute(origin: Coordinate, destination: Coordinate, signal?: AbortSignal): Promise<WalkingRoute> {
  const apiKey = envValue('VITE_ORS_API_KEY')
  if (!apiKey) {
    throw new Error('Roteamento ainda não configurado. Defina VITE_ORS_API_KEY no arquivo .env.local.')
  }

  const endpoint = envValue('VITE_ORS_BASE_URL', DEFAULT_ENDPOINT)
  const response = await fetch(endpoint, {
    method: 'POST',
    signal,
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/geo+json, application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [origin.longitude, origin.latitude],
        [destination.longitude, destination.latitude],
      ],
      instructions: true,
      language: 'pt',
      units: 'm',
    }),
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(`O serviço de rota não respondeu (${response.status}). ${message.slice(0, 120)}`)
  }

  const payload = await response.json() as {
    features?: Array<{
      geometry?: { coordinates?: [number, number][] }
      properties?: {
        segments?: Array<{ distance?: number; duration?: number; steps?: Array<{ instruction?: string; distance?: number; duration?: number }> }>
      }
    }>
  }
  const feature = payload.features?.[0]
  const geometry = feature?.geometry?.coordinates
  const segment = feature?.properties?.segments?.[0]
  if (!geometry?.length || !segment) {
    throw new Error('O serviço de rota retornou um trajeto incompleto.')
  }

  return {
    geometry,
    distance: segment.distance ?? 0,
    duration: segment.duration ?? 0,
    steps: (segment.steps ?? []).map((step) => ({
      instruction: step.instruction || 'Siga em frente',
      distance: step.distance ?? 0,
      duration: step.duration ?? 0,
    })),
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`
}

export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}
