# Roadmap de Desenvolvimento — Mini Sistema de Cartas de Personagens

Este documento é o plano oficial e rastreador de progresso do projeto. Cada etapa é marcada como concluída somente após seu desenvolvimento e teste efetivo.

---

- [x] **Etapa 1 — Planejamento e Estrutura Básica**
  - [x] Definição de arquitetura e requisitos
  - [x] Criação de `Roadmap.md` e `Contexto.md`
  - [x] Criação da estrutura de pastas do projeto (`/backend`, `/frontend`, etc.)

- [x] **Etapa 2 — Configuração do Backend (Node.js)**
  - [x] Inicialização do `package.json` com dependências (`express`, `mongoose`, `cors`, `dotenv`)
  - [x] Configuração de scripts de execução e testes
  - [x] Criação de `.env.example`

- [x] **Etapa 3 — Conexão com MongoDB e Model**
  - [x] Módulo de conexão com MongoDB com cache de conexão para Serverless/Vercel (`db.js`)
  - [x] Criação do Schema Mongoose `Character` (nome, jogo, data de lançamento, imagem, raridade, preço) com validações

- [x] **Etapa 4 — Desenvolvimento da API REST**
  - [x] Implementação de rotas e controllers CRUD:
    - `GET /api/characters` (com suporte a filtros por `game`, `rarity` e busca)
    - `GET /api/characters/:id`
    - `POST /api/characters` (com validações completas)
    - `PUT /api/characters/:id`
    - `DELETE /api/characters/:id`
    - `POST /api/characters/seed` (para carga inicial dos 5 personagens)
  - [x] Middlewares de CORS, JSON e tratamento centralizado de erros

- [x] **Etapa 5 — Testes Automatizados do Backend**
  - [x] Criação de suíte de testes com Supertest e banco em memória (`mongodb-memory-server`)
  - [x] 18 testes executados com 100% de sucesso (CRUD completo, filtros, validações de erro e 404)

- [x] **Etapa 6 — Criação dos Placeholders de Imagens**
  - [x] Criação dos arquivos de placeholder vetoriais padronizados para:
    - Connor (`ConnorDetroitBecomeHuman.svg`)
    - Arthur Morgan (`ArthurMorganRedDeadRedemption2.svg`)
    - Doom Slayer (`DoomSlayerDoom.svg`)
    - Bayonetta (`Bayonetta.svg`)
    - Leon S. Kennedy (`ResidentLeon.svg`)

- [x] **Etapa 7 — Desenvolvimento do Frontend (HTML + CSS)**
  - [x] Estrutura semântica (`index.html`) com Navbar, Carrossel, Filtros, Grade de Cartas e Modal
  - [x] Estilização visual temática TCG gamer em `style.css`
  - [x] Sistema de cores e brilhos para as 6 raridades (Common, Uncommon, Rare, Epic, Legendary, Mythic)
  - [x] Implementação do efeito de blur forte inicial e revelação suave no hover/touch
  - [x] Overlay com Nome em destaque, Jogo e `LANÇAMENTO: YYYY`
  - [x] Formatação de preço em padrão brasileiro (`R$ 1.500,00`)

- [x] **Etapa 8 — Desenvolvimento do Slider/Carrossel**
  - [x] Navegação anterior/próximo e indicadores de posição (dots)
  - [x] Autoplay com pausa automática ao passar o mouse ou focar
  - [x] Suporte a navegação por teclado (setas esquerda/direita)
  - [x] Suporte a gestos de toque (touch swipe) em dispositivos móveis

- [x] **Etapa 9 — Integração Frontend com a API REST**
  - [x] Consumo dinâmico via `fetch` dos personagens da API
  - [x] Filtro por jogo e raridade dinâmicos
  - [x] Tratamento gracioso de erros de conexão e estado de carregamento com dados de demonstração

- [x] **Etapa 10 — Documentação Completa**
  - [x] Criação de `api.md` com guia completo de endpoints, exemplos de requisição/resposta, curl e configuração do banco
  - [x] Criação de `README.md` com instruções de instalação, execução e testes
  - [x] Atualização de `Contexto.md`

- [x] **Etapa 11 — Preparação para Vercel**
  - [x] Configuração do arquivo `vercel.json` para roteamento de API e arquivos estáticos
  - [x] Criação do entrypoint serverless `backend/api/index.js`

- [x] **Etapa 12 — Validação e Testes Finais**
  - [x] Execução da suíte de testes do backend (18/18 testes passando)
  - [x] Verificação da interface no navegador e responsividade
