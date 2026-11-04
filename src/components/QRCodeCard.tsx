import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { withBasePath } from '../data/properties'
import type { Property } from '../data/properties'

type QRCodeCardProps = { property: Property }

export function QRCodeCard({ property }: QRCodeCardProps) {
  const [dataUrl, setDataUrl] = useState('')
  const routeUrl = new URL(withBasePath(`/voltar/${property.slug}`), window.location.origin).toString()

  useEffect(() => {
    let active = true
    QRCode.toDataURL(routeUrl, { width: 720, margin: 2, color: { dark: '#103b3b', light: '#ffffff' } })
      .then((url) => { if (active) setDataUrl(url) })
      .catch(() => { if (active) setDataUrl('') })
    return () => { active = false }
  }, [routeUrl])

  return (
    <section className="qr-card" aria-labelledby={`qr-title-${property.slug}`}>
      <div>
        <p className="eyebrow">Acesso direto</p>
        <h2 id={`qr-title-${property.slug}`}>QR Code · {property.shortName}</h2>
        <p className="qr-copy">Aponte a câmera do celular para abrir o GPS já com este destino selecionado.</p>
        <code>{withBasePath(`/voltar/${property.slug}`)}</code>
      </div>
      {dataUrl ? (
        <div className="qr-actions">
          <img src={dataUrl} alt={`QR Code para voltar à ${property.name}`} className="qr-image" />
          <a className="text-button" href={dataUrl} download={`gps-g-hotelaria-${property.slug}.png`}>Baixar PNG</a>
        </div>
      ) : <div className="qr-loading">Gerando QR Code…</div>}
    </section>
  )
}
