import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import { MapView } from './components/MapView'
import { QRCodeCard } from './components/QRCodeCard'
import { PROPERTIES, propertyFromPath, type Property, withBasePath } from './data/properties'
import { describeLocationError, distanceBetween, distanceToRoute, locationFromPosition } from './services/geolocation'
import { fetchWalkingRoute, formatDistance, formatDuration, hasRoutingConfiguration, type Coordinate, type WalkingRoute } from './services/routing'

function App() {
  const property = propertyFromPath(window.location.pathname)
  return property ? <Navigation property={property} /> : <Home />
}

function Home() {
  return (
    <main className="home-shell">
      <header className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">↗</span>
        <div><p className="brand-name">GPS G-Hotelaria</p><p className="brand-tagline">Seu caminho de volta, sem complicação.</p></div>
      </header>
      <section className="home-intro">
        <p className="eyebrow">Armação dos Búzios · RJ</p>
        <h1>Onde você está hospedado?</h1>
        <p>Escolha sua pousada ou abra o link exclusivo do QR Code. Depois, permita o GPS para receber uma rota real a pé.</p>
      </section>
      <div className="property-list">
        {PROPERTIES.map((item) => <a className="property-card" href={withBasePath(`/voltar/${item.slug}`)} key={item.slug}>
          <span className="property-index">0{PROPERTIES.indexOf(item) + 1}</span>
          <span><strong>{item.name}</strong><small>{item.address}</small></span>
          <span className="arrow" aria-hidden="true">→</span>
        </a>)}
      </div>
      <p className="privacy-note"><span className="privacy-dot" /> Sua localização fica somente neste celular e não é armazenada.</p>
    </main>
  )
}

type NavigationProps = { property: Property }

type NavigationStatus = 'idle' | 'locating' | 'routing' | 'navigating' | 'arrived' | 'error'

function Navigation({ property }: NavigationProps) {
  const [currentLocation, setCurrentLocation] = useState<Coordinate>()
  const [route, setRoute] = useState<WalkingRoute>()
  const [status, setStatus] = useState<NavigationStatus>('idle')
  const [message, setMessage] = useState('')
  const [followLocation, setFollowLocation] = useState(true)
  const [map, setMap] = useState<L.Map>()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const watchId = useRef<number>()
  const routeRef = useRef<WalkingRoute>()
  const locationRef = useRef<Coordinate>()
  const routeBusyRef = useRef(false)
  const lastRouteAtRef = useRef(0)

  useEffect(() => {
    routeRef.current = route
  }, [route])

  useEffect(() => {
    locationRef.current = currentLocation
  }, [currentLocation])

  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  useEffect(() => () => {
    if (watchId.current !== undefined) navigator.geolocation.clearWatch(watchId.current)
  }, [])

  async function calculateRoute(origin: Coordinate) {
    if (routeBusyRef.current) return
    routeBusyRef.current = true
    setStatus('routing')
    setMessage('Calculando uma rota segura para pedestres…')
    try {
      const nextRoute = await fetchWalkingRoute(origin, { latitude: property.latitude, longitude: property.longitude })
      setRoute(nextRoute)
      routeRef.current = nextRoute
      lastRouteAtRef.current = Date.now()
      setStatus(distanceBetween(origin, { latitude: property.latitude, longitude: property.longitude }) < 35 ? 'arrived' : 'navigating')
      setMessage('Rota atualizada. Siga as instruções e mantenha o GPS ativo.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Não foi possível calcular a rota agora.')
    } finally {
      routeBusyRef.current = false
    }
  }

  function handlePosition(position: GeolocationPosition) {
    const nextLocation = locationFromPosition(position)
    setCurrentLocation(nextLocation)
    locationRef.current = nextLocation
    const activeRoute = routeRef.current
    if (!activeRoute) return
    const destination = { latitude: property.latitude, longitude: property.longitude }
    if (distanceBetween(nextLocation, destination) < 35) {
      setStatus('arrived')
      setMessage(`Você chegou à ${property.shortName}.`)
      return
    }
    const offRouteMeters = distanceToRoute(nextLocation, activeRoute.geometry)
    if (offRouteMeters > 60 && Date.now() - lastRouteAtRef.current > 10000) {
      void calculateRoute(nextLocation)
    }
  }

  function handleLocationError(error: GeolocationPositionError) {
    const described = describeLocationError(error)
    setStatus('error')
    setMessage(described.message)
  }

  function startGpsWatch() {
    if (!navigator.geolocation) {
      setStatus('error')
      setMessage('Este navegador não oferece localização. Abra o link em um celular com GPS e HTTPS.')
      return false
    }
    if (watchId.current === undefined) {
      watchId.current = navigator.geolocation.watchPosition(handlePosition, handleLocationError, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 })
    }
    return true
  }

  function startNavigation() {
    if (!startGpsWatch()) return
    setStatus('locating')
    setMessage('Obtendo sua localização…')
    navigator.geolocation.getCurrentPosition((position) => {
      handlePosition(position)
      void calculateRoute(locationFromPosition(position))
    }, handleLocationError, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 })
  }

  function centerOnUser() {
    if (currentLocation && map) {
      setFollowLocation(true)
      map.setView([currentLocation.latitude, currentLocation.longitude], Math.max(map.getZoom(), 17), { animate: true })
      return
    }
    startNavigation()
  }

  const isActive = status === 'locating' || status === 'routing' || status === 'navigating'
  const activeStep = route?.steps[0]

  return (
    <main className="navigation-shell">
      <div className="map-stage">
        <MapView property={property} currentLocation={currentLocation} route={route} followLocation={followLocation} onMapReady={setMap} />
        <div className="map-topbar">
          <a className="back-button" href={withBasePath('/')} aria-label="Voltar para seleção de pousada">←</a>
          <div className="map-destination"><span className="mini-pin" /> <span>Destino</span><strong>{property.shortName}</strong></div>
          <button className="icon-button light" onClick={centerOnUser} aria-label="Centralizar no GPS">◎</button>
        </div>
        {isOffline && <div className="offline-banner">Sem internet · o mapa e o recálculo podem ficar limitados.</div>}
      </div>
      <section className="navigation-panel">
        <div className="panel-handle" />
        <div className="panel-heading"><div><p className="eyebrow">Voltar para sua pousada</p><h1>{property.name}</h1></div><span className="arrival-badge">A PÉ</span></div>
        <p className="address-line">{property.address}</p>
        <div className="location-confidence"><span className="confidence-dot" /> Entrada indicada no mapa · <a href={property.mapsUrl} target="_blank" rel="noreferrer">ver referência</a></div>

        {status === 'arrived' ? <div className="arrival-card"><span className="arrival-icon">✓</span><div><strong>Você chegou.</strong><p>{property.shortName} está logo aqui.</p></div></div> :
          <>
            <div className="route-summary">
              <div><span className="summary-label">Distância</span><strong>{route ? formatDistance(route.distance) : '—'}</strong></div>
              <div><span className="summary-label">Caminhada</span><strong>{route ? formatDuration(route.duration) : '—'}</strong></div>
              <div><span className="summary-label">Status</span><strong>{status === 'navigating' ? 'Em rota' : status === 'routing' ? 'Calculando' : 'Aguardando'}</strong></div>
            </div>
            {activeStep && status === 'navigating' && <div className="next-step"><span className="turn-icon">↗</span><div><span>Próxima orientação</span><strong>{activeStep.instruction}</strong><small>{formatDistance(activeStep.distance)}</small></div></div>}
            {message && <div className={`status-message ${status === 'error' ? 'error' : ''}`} role="status"><span>{status === 'error' ? '!' : 'i'}</span>{message}</div>}
            {!hasRoutingConfiguration() && <div className="setup-message"><strong>Roteamento precisa de configuração</strong><p>Defina <code>VITE_ORS_API_KEY</code> no `.env.local` para obter rotas reais de pedestres. O app não usa linha reta nem rota de automóvel como substituto.</p></div>}
            <button className="primary-button" onClick={startNavigation} disabled={isActive}>{status === 'navigating' ? 'Atualizar trajeto' : status === 'routing' || status === 'locating' ? 'Localizando…' : 'Começar minha rota'} <span>→</span></button>
            {route && <button className="secondary-button" onClick={() => { if (locationRef.current) void calculateRoute(locationRef.current); else startNavigation() }} disabled={isActive}>↻ Recalcular rota</button>}
          </>}
        <p className="privacy-note compact"><span className="privacy-dot" /> GPS usado só durante esta navegação. Nenhum histórico é salvo.</p>
        <details className="location-details"><summary>Sobre a entrada desta pousada</summary><p>{property.locationNote}</p></details>
        <QRCodeCard property={property} />
      </section>
    </main>
  )
}

export { App }
