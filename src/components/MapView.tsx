import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Property } from '../data/properties'
import type { Coordinate, WalkingRoute } from '../services/routing'

type MapViewProps = {
  property: Property
  currentLocation?: Coordinate
  route?: WalkingRoute
  followLocation: boolean
  onMapReady?: (map: L.Map) => void
}

const BUZIOS_CENTER: L.LatLngExpression = [-22.7574, -41.8879]

function destinationIcon() {
  return L.divIcon({
    className: 'destination-marker-wrap',
    html: '<span class="destination-marker"><span class="destination-marker-dot"></span></span>',
    iconSize: [44, 52],
    iconAnchor: [22, 50],
  })
}

function userIcon() {
  return L.divIcon({
    className: 'user-marker-wrap',
    html: '<span class="user-marker"><span class="user-marker-pulse"></span></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export function MapView({ property, currentLocation, route, followLocation, onMapReady }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map>()
  const destinationRef = useRef<L.Marker>()
  const userRef = useRef<L.Marker>()
  const accuracyRef = useRef<L.Circle>()
  const routeRef = useRef<L.GeoJSON>()
  const routeLineRef = useRef<L.Polyline>()
  const hasFitRoute = useRef(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true }).setView(BUZIOS_CENTER, 15)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer(
      (import.meta.env.VITE_MAP_TILE_URL as string | undefined) || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: (import.meta.env.VITE_MAP_ATTRIBUTION as string | undefined) || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 20 },
    ).addTo(map)
    mapRef.current = map
    onMapReady?.(map)
    return () => {
      map.remove()
      mapRef.current = undefined
    }
  }, [onMapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    destinationRef.current?.remove()
    destinationRef.current = L.marker([property.latitude, property.longitude], { icon: destinationIcon(), title: property.name })
      .addTo(map)
      .bindTooltip(property.shortName, { direction: 'top', offset: [0, -42], className: 'destination-tooltip' })
    map.setView([property.latitude, property.longitude], 16)
    hasFitRoute.current = false
  }, [property])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    routeRef.current?.remove()
    routeLineRef.current?.remove()
    if (!route) return
    const latLngs = route.geometry.map(([longitude, latitude]) => [latitude, longitude] as [number, number])
    routeRef.current = L.geoJSON({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.geometry } } as GeoJSON.Feature<GeoJSON.LineString>, {
      style: { color: '#0f766e', weight: 7, opacity: 0.18, lineCap: 'round', lineJoin: 'round' },
    }).addTo(map)
    routeLineRef.current = L.polyline(latLngs, { color: '#0f766e', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(map)
    if (!hasFitRoute.current) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [28, 28] })
      hasFitRoute.current = true
    }
  }, [route])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !currentLocation) return
    const point: L.LatLngExpression = [currentLocation.latitude, currentLocation.longitude]
    if (!userRef.current) userRef.current = L.marker(point, { icon: userIcon(), zIndexOffset: 1000, title: 'Sua localização' }).addTo(map)
    else userRef.current.setLatLng(point)
    accuracyRef.current?.remove()
    accuracyRef.current = L.circle(point, { radius: 18, color: '#0f766e', weight: 1, opacity: 0.25, fillColor: '#14b8a6', fillOpacity: 0.08 }).addTo(map)
    if (followLocation) map.panTo(point, { animate: true, duration: 0.35 })
  }, [currentLocation, followLocation])

  return <div ref={containerRef} className="map-canvas" aria-label={`Mapa do caminho até ${property.name}`} />
}
