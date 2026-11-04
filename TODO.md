# GPS G-Hotelaria — Entregas

- [ ] **Fluxo mobile-first do hóspede** — A interface deve estar em português brasileiro, funcionar no navegador sem instalação ou conta, usar poucos elementos, boa legibilidade, botões grandes e mapa ocupando a maior parte da tela.
- [ ] **Três destinos e QR Codes** — Cadastrar somente Pousada Centro Class, Centro Up e Casa Centro, sem Solar João Fernandes; disponibilizar as rotas `/voltar/centro-class`, `/voltar/centro-up` e `/voltar/casa-centro`, cada uma com destino pré-selecionado e QR Code exclusivo.
- [ ] **Coordenadas e entradas físicas** — Verificar cada referência do Google Maps e usar o ponto da entrada física quando confirmado; qualquer localização não confirmável deve permanecer explicitamente pendente e nunca ser inventada.
- [ ] **Mapa e privacidade** — Usar Leaflet com OpenStreetMap, mostrar créditos, localização atual e marcador personalizado; solicitar localização somente quando necessário, não armazenar histórico nem compartilhar posição.
- [ ] **Navegação a pé real** — Calcular rotas reais para pedestres com serviço configurável por variável de ambiente, exibir trajeto, distância, duração e instruções, acompanhar o GPS e recalcular automaticamente após desvio significativo.
- [ ] **Estados de GPS e chegada** — Explicar permissão negada, ausência de sinal ou internet, oferecer centralização e atualização, e indicar aproximação ou chegada ao destino.
- [ ] **Exportação independente** — Manter código React + Vite modular, dependências e variáveis em arquivos documentados, sem backend proprietário da Manus e preparado para Git/GitHub.
- [ ] **Validação das três rotas** — Testar individualmente a abertura de cada rota, destino correto, localização, chamada de roteamento, atualização, recálculo e chegada antes da publicação.
- [ ] **Área administrativa futura** — Deixar pontos de extensão para cadastro, edição, coordenadas, ativação e geração de QR Codes protegidos por autenticação, sem bloquear o protótipo inicial.
