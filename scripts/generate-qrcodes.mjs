import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import QRCode from 'qrcode'

const baseUrl = (process.env.QR_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const slugs = ['centro-class', 'centro-up', 'casa-centro']
const outputDir = join(process.cwd(), 'public', 'qr')
await mkdir(outputDir, { recursive: true })

for (const slug of slugs) {
  await QRCode.toFile(join(outputDir, `${slug}.png`), `${baseUrl}/voltar/${slug}`, {
    width: 1200,
    margin: 2,
    color: { dark: '#103b3b', light: '#ffffff' },
  })
  console.log(`Gerado: ${baseUrl}/voltar/${slug}`)
}
