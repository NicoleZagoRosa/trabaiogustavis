# Contexto do Projeto — Mini Sistema de Cartas de Personagens

> Memória viva e persistente da aplicação para acompanhamento de status, arquitetura e decisões de engenharia.

---

## 1. Objetivo do Projeto
Desenvolver um mini sistema completo (Full Stack) de gerenciamento e exibição de personagens de jogos no formato de catálogo/cartas colecionáveis (TCG). As cartas possuem efeito de blur forte inicial (revelando-se suavemente ao hover/toque), overlay com dados detalhados, carrossel de destaques dinâmico, filtros por jogo/raridade, API REST em Node.js com MongoDB, testes automatizados e prontidão para deploy na Vercel.

---

## 2. Arquitetura do Sistema
- **Padrão**: Arquitetura desacoplada em duas camadas (`backend` e `frontend`).
- **Backend**: API REST em Node.js com Express e Mongoose, com camada de conexão resiliente adequada tanto para execução local (Node HTTP) quanto para funções serverless (Vercel Functions via `backend/api/index.js`).
- **Frontend**: Single Page Application (SPA) minimalista sem frameworks (Vanilla HTML5, CSS3 moderno com Flexbox/CSS Grid, JavaScript ES6+ com Fetch API).
- **Deploy**: Preparado para Vercel através de `vercel.json` e handler serverless em `backend/api/index.js`.

---

## 3. Tecnologias Utilizadas
- **Node.js**: v24.11.1
- **Express**: Framework web para rotas e middlewares REST
- **Mongoose**: Modelagem orientada a objetos para MongoDB
- **MongoDB**: Banco de dados NoSQL para persistência dos dados
- **Supertest**: Testes automatizados de integração HTTP
- **mongodb-memory-server**: MongoDB em memória para execução de testes sem dependência de serviço local externo
- **HTML5 & CSS3**: Semântica e estilização moderna com filtros CSS e temas de raridade
- **JavaScript (ES6+)**: Manipulação de DOM, consumo assíncrono de API, controle do carrossel e eventos de toque

---

## 4. Estrutura de Pastas
```
trabaiogustavis/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexão MongoDB com cache para serverless (db.js)
│   │   ├── controllers/     # Controladores REST com regras de negócio (characterController.js)
│   │   ├── models/          # Schemas Mongoose com validações (Character.js)
│   │   ├── routes/          # Definições de rotas Express (characterRoutes.js)
│   │   ├── seed/            # Dados dos 5 personagens iniciais (seedData.js)
│   │   ├── app.js           # Instância e middlewares Express
│   │   └── server.js        # Entrypoint para servidor local Node.js
│   ├── api/
│   │   └── index.js         # Handler serverless para a Vercel
│   ├── tests/
│   │   └── character.test.js # Testes automatizados com 18 cenários de teste
│   ├── .env.example         # Exemplo de configuração de variáveis
│   └── package.json         # Dependências e scripts de start/test
├── frontend/
│   ├── index.html           # Interface principal da coleção
│   ├── style.css            # Estilos, temas de raridades e animações
│   ├── script.js            # Lógica client-side e integração
│   └── images/              # Placeholders SVG dos personagens
│       ├── ConnorDetroitBecomeHuman.svg
│       ├── ArthurMorganRedDeadRedemption2.svg
│       ├── DoomSlayerDoom.svg
│       ├── Bayonetta.svg
│       └── ResidentLeon.svg
├── vercel.json              # Configuração de deploy da Vercel
├── Roadmap.md               # Rastreamento de etapas
├── Contexto.md              # Este arquivo de contexto
├── api.md                   # Documentação da API REST
└── README.md                # Instruções de uso e configuração
```

---

## 5. Funcionalidades Implementadas
- [x] Arquitetura e planejamento aprovado pelo usuário.
- [x] Inicialização do backend com `express`, `mongoose`, `cors`, `dotenv`.
- [x] Conexão com MongoDB com cache de conexão para ambiente serverless (`db.js`).
- [x] Model `Character` com validações rigorosas (nome, jogo, data de lançamento, imagem, raridade, preço) e enum de raridades.
- [x] Endpoints CRUD completos da API REST (`GET`, `GET/:id`, `POST`, `PUT`, `DELETE`).
- [x] Filtros na API por jogo (`game`), raridade (`rarity`), busca textual (`search`) e ordenação (`sort`).
- [x] Rota `/api/characters/games` para preenchimento dinâmico do dropdown de jogos.
- [x] Rota `/api/characters/seed` com suporte a `?force=true` e carga dos 5 personagens iniciais.
- [x] Suíte de testes automatizados com `supertest` e `mongodb-memory-server` cobrindo 18 cenários com 100% de aprovação.
- [x] Placeholders de imagem SVG desacoplados para os 5 personagens iniciais (sem geração de imagem por IA).
- [x] Frontend Vanilla puro em HTML5 e CSS3 sem nenhum framework.
- [x] Efeito visual de blur forte inicial (`filter: blur(14px) brightness(0.6)`) com badge "BLOQUEADO".
- [x] Efeito de revelação no hover (desktop) ou toque (mobile) com dissipação suave do blur.
- [x] Overlay emergente com nome em destaque, jogo, `LANÇAMENTO: YYYY`, raridade e preço em BRL (`R$ 1.500,00`).
- [x] Sistema de cores e brilhos para as 6 raridades (Common, Uncommon, Rare, Epic, Legendary, Mythic).
- [x] Slider/carrossel dinâmico com navegação anterior/próximo, indicadores clicáveis (dots), autoplay com pausa ao passar o mouse, teclado e touch swipe.
- [x] Filtros combinados no cliente (busca textual em tempo real, seleção por jogo e por raridade).
- [x] Modal interativo para cadastro de novas cartas via `POST /api/characters`.
- [x] Tratamento de erros e feedback amigável se a API estiver desconectada, com fallback de demonstração.
- [x] Documentação técnica completa em `api.md` e `README.md`.
- [x] Configuração para deploy na Vercel via `vercel.json` e `backend/api/index.js`.

---

## 6. Endpoints Existentes e Testados
- `GET /api/health`: Verificação de status e integridade da API.
- `GET /api/characters`: Listagem de personagens com filtros (`game`, `rarity`, `search`, `sort`).
- `GET /api/characters/games`: Lista ordenada de jogos distintos cadastrados.
- `GET /api/characters/:id`: Obter personagem por ID do MongoDB (retorna 400 para ID malformado e 404 para não encontrado).
- `POST /api/characters`: Cadastrar novo personagem com validações (retorna 201 ou 400).
- `PUT /api/characters/:id`: Atualizar dados do personagem (retorna 200, 400 ou 404).
- `DELETE /api/characters/:id`: Remover personagem por ID (retorna 200 ou 404).
- `POST /api/characters/seed`: Carregar os 5 personagens padrão (opcional `?force=true`).

---

## 7. Modelos Existentes
- **`Character`**:
  - `name`: String (obrigatório, trim, 2-100 caracteres)
  - `game`: String (obrigatório, trim, 2-100 caracteres)
  - `releaseDate`: String (obrigatório, formato YYYY-MM-DD ou YYYY)
  - `image`: String (obrigatório, identificador do placeholder)
  - `rarity`: String (enum: `Common`, `Uncommon`, `Rare`, `Epic`, `Legendary`, `Mythic`)
  - `price`: Number (obrigatório, >= 0)
  - `createdAt`, `updatedAt`: Date (automático via timestamps Mongoose)

---

## 8. Variáveis de Ambiente
- `PORT`: Porta do servidor local (padrão: `3000`).
- `MONGODB_URI`: String de conexão com o MongoDB (Atlas ou local).

---

## 9. Decisões Técnicas Importantes
- **Desacoplamento do app Express**: O arquivo `app.js` exporta a instância do Express sem iniciar a escuta de porta, permitindo testes isolados com `supertest` e importação serverless em `backend/api/index.js`.
- **Testes com MongoDB em memória**: A suíte de testes utiliza `mongodb-memory-server` para garantir execução rápida, idempotente e que funcione em qualquer máquina sem exigir instalação de serviço MongoDB local.
- **Placeholders SVG padronizados**: Em conformidade estrita com a regra 7, não foram geradas imagens por IA nem baixadas imagens externas; foram criados 5 arquivos vetoriais de alta fidelidade prontos para substituição a qualquer momento por JPG/PNG.
- **Formatação Monetária no Frontend**: Uso nativo da API `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` para precisão e conformidade com o padrão brasileiro (ex: `R$ 1.500,00`).

---

## 10. Problemas Encontrados & Resolvidos
- **Problema 1**: A política de execução do PowerShell no ambiente bloqueia a execução direta do script `npm.ps1`.
  - **Solução**: Executar os comandos de pacote através do `cmd /c npm ...`.
- **Problema 2**: Suporte a telas touch em celulares onde não existe o evento `:hover` tradicional.
  - **Solução**: Implementada classe `.revealed` acionada por clique/toque ou teclas Enter/Espaço, além de suporte a gestos swipe no carrossel.

---

## 11. Status Atual
- **Última tarefa concluída**: Implementação do frontend, suíte de 18 testes aprovada, documentação completa (`api.md`, `README.md`, `Roadmap.md`, `Contexto.md`) e configuração da Vercel.
- **Próxima tarefa**: Execução de validação final com inicialização do servidor e apresentação dos resultados para o usuário.
