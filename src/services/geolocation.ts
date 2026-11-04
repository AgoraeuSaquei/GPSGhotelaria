import type { Coordinate } from './routing'

export type LocationErrorCode = 'permission-denied' | 'unavailable' | 'timeout' | 'unsupported'

export type LocationError = {
  code: LocationErrorCode
  message: string
}

export function locationFromPosition(position: GeolocationPosition): Coordinate {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  }
}

export function describeLocationError(error: GeolocationPositionError): LocationError {
  if (error.code === error.PERMISSION_DENIED) {
    return { code: 'permission-denied', message: 'Ative a localização do navegador para calcular o caminho até a pousada.' }
  }
  if (error.code === error.TIMEOUT) {
    return { code: 'timeout', message: 'O GPS demorou para responder. Tente novamente em um local aberto.' }
  }
  return { code: 'unavailable', message: 'Não foi possível obter o sinal do GPS agora. A navegação pode ficar limitada.' }
}

export function distanceBetween(a: Coordinate, b: Coordinate): number {
  const earthRadius = 6371000
  const radians = (value: number) => value * Math.PI / 180
  const dLat = radians(b.latitude - a.latitude)
  const dLon = radians(b.longitude - a.longitude)
  const lat1 = radians(a.latitude)
  const lat2 = radians(b.latitude)
  const haversine = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * earthRadius * Math.asin(Math.sqrt(haversine))
}

function projectPoint(point: Coordinate, start: Coordinate, end: Coordinate): { distance: number; t: number } {
  const latScale = 111320
  const lonScale = 111320 * Math.cos(point.latitude * Math.PI / 180)
  const px = (point.longitude - start.longitude) * lonScale
  const py = (point.latitude - start.latitude) * latScale
  const ex = (end.longitude - start.longitude) * lonScale
  const ey = (end.latitude - start.latitude) * latScale
  const lengthSquared = ex * ex + ey * ey || 1
  const t = Math.max(0, Math.min(1, (px * ex + py * ey) / lengthSquared))
  const dx = px - ex * t
  const dy = py - ey * t
  return { distance: Math.sqrt(dx * dx + dy * dy), t }
}

export function distanceToRoute(point: Coordinate, geometry: [number, number][]): number {
  let closest = Number.POSITIVE_INFINITY
  for (let index = 1; index < geometry.length; index += 1) {
    const start = { latitude: geometry[index - 1][1], longitude: geometry[index - 1][0] }
    const end = { latitude: geometry[index][1], longitude: geometry[index][0] }
    closest = Math.min(closest, projectPoint(point, start, end).distance)
  }
  return closest
}
