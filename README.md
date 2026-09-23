# Game Cards Archive — Mini Sistema de Cartas de Personagens

> Aplicação web completa no estilo Trading Card Game (TCG) para catálogo, gerenciamento e exibição de personagens marcantes de videogames.

---

## ✦ Demonstração e Destaques Visuais

- **Efeito de Carta Misteriosa/Desbloqueável:** As cartas iniciam com um desfoque forte (`blur`) e imagem escurecida. Ao passar o mouse (ou tocar no celular), o blur se dissipa suavemente revelando a arte nítida, acompanhada por um overlay dinâmico com Nome, Jogo, `LANÇAMENTO: YYYY`, badge de Raridade e Preço formatado em Reais (`R$ 1.500,00`).
- **Slider/Carrossel de Destaques:** Carrossel responsivo com suporte a botões anterior/próximo, indicadores de posição (dots), autoplay com pausa ao passar o mouse, navegação por teclado (setas) e gestos de toque (swipe mobile).
- **Identidade Visual por Raridade:** 6 níveis de raridade com bordas e iluminação néon temática:
  - `Common` (Cinza)
  - `Uncommon` (Verde)
  - `Rare` (Azul)
  - `Epic` (Roxo)
  - `Legendary` (Dourado)
  - `Mythic` (Vermelho/Laranja)
- **Placeholders Desacoplados:** Sem dependência de geração de imagens por IA ou downloads externos; placeholders SVG padronizados prontos para substituição futura por arquivos JPG/PNG reais.

---

## ✦ Arquitetura e Tecnologias

```
trabaiogustavis/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexão MongoDB com cache para serverless
│   │   ├── controllers/     # Controladores REST com regras de negócio
│   │   ├── models/          # Schemas Mongoose (validações completas)
│   │   ├── routes/          # Rotas Express
│   │   ├── seed/            # Dados dos 5 personagens iniciais
│   │   ├── app.js           # Setup Express e middlewares
│   │   └── server.js        # Entrypoint do servidor HTTP local
│   ├── api/
│   │   └── index.js         # Handler Serverless para Vercel
│   ├── tests/               # Testes automatizados (Supertest + In-Memory Mongo)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html           # Interface semântica
│   ├── style.css            # Estilização TCG, raridades e animações
│   ├── script.js            # JavaScript Vanilla puro (Fetch, Carrossel, Filtros)
│   └── images/              # Placeholders SVG dos personagens
├── vercel.json              # Configuração para deploy na Vercel
├── api.md                   # Documentação detalhada da API REST
├── Roadmap.md               # Rastreamento de progresso por etapas
├── Contexto.md              # Memória viva do projeto
└── README.md                # Este documento
```

---

## ✦ Personagens Iniciais Cadastrados

1. **Connor** — *Detroit: Become Human* | Legendary | R$ 150,00 (`ConnorDetroitBecomeHuman`)
2. **Arthur Morgan** — *Red Dead Redemption 2* | Mythic | R$ 250,00 (`ArthurMorganRedDeadRedemption2`)
3. **Doom Slayer** — *DOOM* | Epic | R$ 120,00 (`DoomSlayerDoom`)
4. **Bayonetta** — *Bayonetta* | Rare | R$ 85,00 (`Bayonetta`)
5. **Leon S. Kennedy** — *Resident Evil* | Legendary | R$ 190,00 (`ResidentLeon`)

---

## ✦ Como Instalar e Rodar Localmente

### Pré-requisitos
- Node.js (v18+)
- npm

### 1. Clonar ou Acessar o Repositório
Abra o terminal na pasta do projeto:
```bash
cd backend
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie o arquivo `.env` dentro da pasta `backend/`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mini_cards_characters
```
*(Se estiver utilizando MongoDB Atlas na nuvem, cole a connection string fornecida no painel do Atlas).*

### 4. Executar os Testes Automatizados
A aplicação conta com uma suíte de testes com banco MongoDB em memória (`mongodb-memory-server`):
```bash
npm test
```
*Todos os 18 testes cobrem rotas GET, filtros, POST, PUT, DELETE, IDs inválidos, validações de erro e 404.*

### 5. Iniciar o Servidor
```bash
npm start
```
Acesse a aplicação no navegador em:
**`http://localhost:3000`**

A interface consome a API REST em tempo real. Se o banco de dados ainda não tiver sido inicializado, a aplicação conta com modo de demonstração resiliente e auto-seed.

---

## ✦ Deploy na Vercel

O projeto está 100% estruturado para deploy na Vercel com função serverless em `backend/api/index.js` e arquivos estáticos em `frontend/`:

1. Instale a CLI da Vercel (`npm i -g vercel`) ou conecte o repositório no dashboard da Vercel.
2. Defina a variável de ambiente `MONGODB_URI` nas configurações do projeto na Vercel (**Settings** -> **Environment Variables**).
3. Execute o comando de deploy:
   ```bash
   vercel --prod
   ```
4. A API e a interface estarão ativas sob o mesmo domínio:
   - Interface: `https://seu-projeto.vercel.app`
   - API: `https://seu-projeto.vercel.app/api/characters`

Consulte o arquivo [`api.md`](./api.md) para todos os detalhes de integração e chamadas HTTP.
