# GPS G-Hotelaria

Protótipo mobile-first para orientar hóspedes a pé até três pousadas da rede G-Hotelaria em Armação dos Búzios.

## Stack

React + Vite + TypeScript, Leaflet/OpenStreetMap, Geolocation API, QR Code e OpenRouteService configurável. O projeto não depende de backend proprietário da Manus e pode ser executado localmente ou publicado em qualquer hospedagem compatível com Vite.

## Executar

1. Instale Node.js 20+ e pnpm 10+.
2. Copie `.env.example` para `.env.local`.
3. Preencha `VITE_ORS_API_KEY` com uma chave do OpenRouteService habilitada para `foot-walking`, respeitando o plano, limites e política do provedor.
4. Execute `pnpm install` e depois `pnpm dev`.
5. Abra `/voltar/centro-class`, `/voltar/centro-up` ou `/voltar/casa-centro`.

Para gerar arquivos PNG prontos para impressão depois de conhecer o domínio final, execute `QR_BASE_URL=https://seu-dominio.example pnpm qrcodes`. Os arquivos serão criados em `public/qr/` e apontarão para as três rotas correspondentes.

## Publicação independente

Use `pnpm build`; o diretório `dist/` é estático. Configure fallback de SPA para `index.html` para que as rotas `/voltar/*` funcionem diretamente. Variáveis `VITE_*` são incorporadas ao bundle no build; não coloque segredos de alto privilégio no navegador. Para produção, prefira uma chave restrita por domínio ou um proxy próprio para o serviço de rotas. HTTPS é obrigatório para a Geolocation API.

## Publicar no GitHub Pages

Este repositório usa o workflow `.github/workflows/deploy.yml`. No GitHub, abra `Settings > Pages` e selecione `GitHub Actions` como fonte. Depois abra `Settings > Secrets and variables > Actions`, crie o secret `VITE_ORS_API_KEY` e cole uma chave de roteamento restrita ao domínio. Cada push na branch `main` executa o build e publica automaticamente.

Como o repositório se chama `GPSGhotelaria`, o endereço padrão será `https://agoraeusaquei.github.io/GPSGhotelaria/`. O Vite já usa `/GPSGhotelaria/` no build de produção e o workflow cria um fallback `404.html` para as rotas dos QR Codes.

## Localizações verificadas

As três referências fornecidas pelo Google Maps foram abertas durante a implementação. Os pontos usados são os pontos exibidos pelo estabelecimento e as fotos/entradas visíveis nas referências; ainda assim, a equipe local deve confirmar presencialmente a porta de chegada antes de uso operacional, pois o Google Maps não fornece garantia de acesso interno.

- Centro Class: `-22.7577383, -41.8891600` — entrada frontal visível na Rua Rui Barbosa, 08.
- Centro Up: `-22.7569891, -41.8867092` — fachada/entrada visível na Rua Rui Barbosa, 229 A.
- Casa Centro: `-22.7576442, -41.8890363` — acesso da pousada visível na Rua Rui Barbosa, 390 A.

## Privacidade

A posição é mantida somente em memória no navegador. Não há login de hóspede, histórico, banco de dados ou envio da localização para a pousada. O provedor de roteamento recebe apenas origem e destino quando o usuário solicita uma rota.

## Observação sobre roteamento

A aplicação exige uma resposta GeoJSON de rota para pedestres, com instruções. Sem uma chave válida, a interface informa como configurar o serviço e não desenha uma linha fictícia. Isso evita apresentar uma rota automotiva ou uma linha reta como navegação real.

## Políticas dos serviços externos

O padrão de desenvolvimento usa o tile HTTPS oficial do OpenStreetMap e exibe a atribuição visível no mapa. A política oficial informa que os tiles têm disponibilidade best-effort, exigem atribuição, cache respeitando os cabeçalhos, referer válido e não devem ser usados para pré-carregar grandes áreas. Antes de operar em produção, configure `VITE_MAP_TILE_URL` para um provedor OSM-derived contratado, tiles próprios ou outro serviço cuja política suporte o volume esperado; a aplicação não faz download antecipado nem uso offline. Consulte https://operations.osmfoundation.org/policies/tiles/.

O OpenRouteService aceita a chave no cabeçalho `Authorization` e oferece o endpoint GeoJSON `directions/foot-walking`, que é o perfil usado aqui. A chave e as cotas dependem do plano do provedor. Em uma publicação pública, não trate uma chave irrestrita no bundle como segredo: use restrição por domínio quando disponível ou mova a chamada para um proxy próprio independente. Consulte https://openrouteservice.org/dev/#/api-docs/.
