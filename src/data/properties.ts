export type Property = {
  slug: string
  name: string
  shortName: string
  address: string
  latitude: number
  longitude: number
  mapsUrl: string
  locationNote: string
  locationStatus: 'confirmada-com-pendente-presencial' | 'pendente'
}

export const PROPERTIES: Property[] = [
  {
    slug: 'centro-class',
    name: 'Pousada Centro Class',
    shortName: 'Centro Class',
    address: 'Rua Rui Barbosa, 08 · Centro, Búzios — RJ',
    latitude: -22.7577383,
    longitude: -41.88916,
    mapsUrl: 'https://maps.app.goo.gl/JTkc7izN457KAnL39',
    locationNote: 'Ponto do estabelecimento e fachada de entrada conferidos na referência do Google Maps. Confirme a porta de chegada presencialmente antes da operação.',
    locationStatus: 'confirmada-com-pendente-presencial',
  },
  {
    slug: 'centro-up',
    name: 'Centro Up',
    shortName: 'Centro Up',
    address: 'Rua Rui Barbosa, 229 A · Loteamento Triângulo de Búzios — RJ',
    latitude: -22.7569891,
    longitude: -41.8867092,
    mapsUrl: 'https://maps.app.goo.gl/hQ5ZgGLvATdvMTDQA',
    locationNote: 'Ponto do estabelecimento e fachada de entrada conferidos na referência do Google Maps. Confirme a porta de chegada presencialmente antes da operação.',
    locationStatus: 'confirmada-com-pendente-presencial',
  },
  {
    slug: 'casa-centro',
    name: 'Casa Centro',
    shortName: 'Casa Centro',
    address: 'Rua Rui Barbosa, 390 A · Loteamento Triângulo de Búzios — RJ',
    latitude: -22.7576442,
    longitude: -41.8890363,
    mapsUrl: 'https://maps.app.goo.gl/2zZRpfBoWQdo4NVp8',
    locationNote: 'Ponto do estabelecimento e acesso da pousada conferidos na referência do Google Maps. Confirme a porta de chegada presencialmente antes da operação.',
    locationStatus: 'confirmada-com-pendente-presencial',
  },
]

export function withBasePath(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\/+/, '')}`
}

export function propertyFromPath(pathname: string): Property | undefined {
  const base = import.meta.env.BASE_URL || '/'
  const appPath = base === '/' ? pathname : pathname.startsWith(base) ? `/${pathname.slice(base.length)}` : pathname
  const slug = appPath.match(/^\/voltar\/([^/]+)/)?.[1]
  return PROPERTIES.find((property) => property.slug === slug)
}
