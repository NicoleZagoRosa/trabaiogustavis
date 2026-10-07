# Documentação Completa da API REST — Mini Sistema de Cartas de Personagens

Esta documentação descreve todos os endpoints, parâmetros, exemplos de requisição e resposta, configuração do MongoDB e procedimentos para consumo local e após o deploy na **Vercel**.

---

## 1. Visão Geral

- **URL Base Local:** `http://localhost:3000/api`
- **URL Base em Produção (Vercel):** `https://seu-projeto.vercel.app/api`
- **Formato de Dados:** `application/json`
- **Autenticação:** Aberta / Pública (RESTful padrão)

---

## 2. Configuração do Ambiente e MongoDB

### 2.1 Variáveis de Ambiente
Crie um arquivo `.env` dentro da pasta `backend/` baseado no modelo `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<senha>@cluster0.mongodb.net/mini_cards?retryWrites=true&w=majority
```

> **Atenção:** Nunca versione credenciais no Git. As variáveis em produção devem ser configuradas diretamente no painel da Vercel (Project Settings -> Environment Variables).

### 2.2 Configurando o MongoDB Atlas (Nuvem Gratuita)
1. Crie uma conta gratuita em [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Crie um Cluster compartilhado (M0 Free).
3. Em **Database Access**, crie um usuário com permissão de leitura e escrita.
4. Em **Network Access**, adicione o IP `0.0.0.0/0` (permitir conexões de qualquer lugar, necessário para funções serverless da Vercel).
5. Clique em **Connect** -> **Connect your application** e copie a connection string para a variável `MONGODB_URI`.

---

## 3. Estrutura do Objeto `Character`

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `id` / `_id` | String (ObjectId) | Automático | Identificador único do registro no MongoDB | `"65fd1a2b3c4d5e6f7a8b9c0d"` |
| `name` | String | Sim | Nome do personagem (mínimo 2, máx 100 caracteres) | `"Connor"` |
| `game` | String | Sim | Nome do jogo de origem | `"Detroit: Become Human"` |
| `releaseDate` | String | Sim | Data de lançamento no formato `AAAA-MM-DD` ou `AAAA` | `"2018-05-25"` |
| `image` | String | Sim | Identificador do placeholder/arquivo de imagem | `"ConnorDetroitBecomeHuman"` |
| `rarity` | String | Sim | Categoria de raridade (`Common`, `Uncommon`, `Rare`, `Epic`, `Legendary`, `Mythic`) | `"Legendary"` |
| `price` | Number | Sim | Valor monetário em reais (deve ser $\ge 0$) | `150.00` |
| `createdAt` | Date | Automático | Timestamp de criação | `"2026-09-23T10:00:00.000Z"` |
| `updatedAt` | Date | Automático | Timestamp da última atualização | `"2026-09-23T10:00:00.000Z"` |

---

## 4. Endpoints da API

### 4.1 Health Check da API
Verifica a integridade e disponibilidade do serviço.

- **Método:** `GET`
- **Rota:** `/api/health`
- **Códigos de Resposta:** `200 OK`

**Exemplo de Resposta:**
```json
{
  "status": "ok",
  "message": "API do Mini Sistema de Cartas de Personagens está operacional.",
  "timestamp": "2026-09-23T13:50:00.000Z"
}
```

---

### 4.2 Listar Personagens (com Filtros)
Retorna a lista de cartas cadastradas, com suporte a filtros opcionais por query parameters.

- **Método:** `GET`
- **Rota:** `/api/characters`
- **Headers:** `Accept: application/json`
- **Query Parameters Opcionais:**
  - `game`: Filtra por nome do jogo (busca parcial e insensível a maiúsculas). Ex: `?game=DOOM`
  - `rarity`: Filtra por raridade exata. Ex: `?rarity=Legendary`
  - `search`: Busca textual tanto no nome do personagem quanto no jogo. Ex: `?search=Arthur`
  - `sort`: Ordenação dos resultados. Ex: `?sort=price` (ascendente) ou `?sort=-price` (descendente)

**Exemplo de Requisição (curl):**
```bash
curl -X GET "http://localhost:3000/api/characters?rarity=Legendary"
```

**Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "673f4e2b8c9d1234567890ab",
      "name": "Connor",
      "game": "Detroit: Become Human",
      "releaseDate": "2018-05-25",
      "image": "ConnorDetroitBecomeHuman",
      "rarity": "Legendary",
      "price": 150.00,
      "createdAt": "2026-09-23T10:00:00.000Z",
      "updatedAt": "2026-09-23T10:00:00.000Z"
    },
    {
      "id": "673f4e2b8c9d1234567890ac",
      "name": "Leon S. Kennedy",
      "game": "Resident Evil",
      "releaseDate": "1998-01-21",
      "image": "ResidentLeon",
      "rarity": "Legendary",
      "price": 190.00,
      "createdAt": "2026-09-23T10:00:00.000Z",
      "updatedAt": "2026-09-23T10:00:00.000Z"
    }
  ]
}
```

---

### 4.3 Obter Personagem por ID
Recupera os detalhes completos de um personagem específico.

- **Método:** `GET`
- **Rota:** `/api/characters/:id`
- **Parâmetros de URL:**
  - `id`: ObjectId de 24 caracteres hexadecimais do MongoDB.

**Exemplo de Requisição (curl):**
```bash
curl -X GET "http://localhost:3000/api/characters/673f4e2b8c9d1234567890ab"
```

**Respostas Possíveis:**
- **200 OK:**
  ```json
  {
    "success": true,
    "data": {
      "id": "673f4e2b8c9d1234567890ab",
      "name": "Connor",
      "game": "Detroit: Become Human",
      "releaseDate": "2018-05-25",
      "image": "ConnorDetroitBecomeHuman",
      "rarity": "Legendary",
      "price": 150.00
    }
  }
  ```
- **400 Bad Request (Formato de ID inválido):**
  ```json
  {
    "success": false,
    "error": "Formato de ID inválido. Deve ser um ObjectId válido do MongoDB."
  }
  ```
- **404 Not Found (ID válido, mas inexistente):**
  ```json
  {
    "success": false,
    "error": "Personagem com ID 673f4e2b8c9d1234567890ab não foi encontrado."
  }
  ```

---

### 4.4 Cadastrar Novo Personagem
Insere uma nova carta no catálogo.

- **Método:** `POST`
- **Rota:** `/api/characters`
- **Headers:** `Content-Type: application/json`
- **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Geralt of Rivia",
    "game": "The Witcher 3: Wild Hunt",
    "releaseDate": "2015-05-19",
    "image": "GeraltTheWitcher",
    "rarity": "Mythic",
    "price": 280.00
  }
  ```

**Exemplo de Requisição (curl):**
```bash
curl -X POST "http://localhost:3000/api/characters" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Geralt of Rivia",
    "game": "The Witcher 3: Wild Hunt",
    "releaseDate": "2015-05-19",
    "image": "GeraltTheWitcher",
    "rarity": "Mythic",
    "price": 280.00
  }'
```

**Respostas Possíveis:**
- **201 Created:**
  ```json
  {
    "success": true,
    "message": "Personagem criado com sucesso.",
    "data": {
      "id": "673f55001122334455667788",
      "name": "Geralt of Rivia",
      "game": "The Witcher 3: Wild Hunt",
      "releaseDate": "2015-05-19",
      "image": "GeraltTheWitcher",
      "rarity": "Mythic",
      "price": 280.00,
      "createdAt": "2026-09-23T10:15:00.000Z",
      "updatedAt": "2026-09-23T10:15:00.000Z"
    }
  }
  ```
- **400 Bad Request (Dados Inválidos ou Incompletos):**
  ```json
  {
    "success": false,
    "error": "Campos obrigatórios ausentes: name, game, releaseDate, image, rarity, price."
  }
  ```

---

### 4.5 Atualizar Personagem Existente
Modifica campos de um personagem previamente cadastrado.

- **Método:** `PUT`
- **Rota:** `/api/characters/:id`
- **Headers:** `Content-Type: application/json`
- **Corpo da Requisição (campos parciais ou completos):**
  ```json
  {
    "price": 220.00,
    "rarity": "Legendary"
  }
  ```

**Exemplo de Requisição (curl):**
```bash
curl -X PUT "http://localhost:3000/api/characters/673f4e2b8c9d1234567890ab" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 220.00,
    "rarity": "Legendary"
  }'
```

**Respostas Possíveis:**
- **200 OK:**
  ```json
  {
    "success": true,
    "message": "Personagem atualizado com sucesso.",
    "data": {
      "id": "673f4e2b8c9d1234567890ab",
      "name": "Connor",
      "game": "Detroit: Become Human",
      "releaseDate": "2018-05-25",
      "image": "ConnorDetroitBecomeHuman",
      "rarity": "Legendary",
      "price": 220.00
    }
  }
  ```
- **404 Not Found:**
  ```json
  {
    "success": false,
    "error": "Personagem com ID 673f4e2b8c9d1234567890ab não foi encontrado."
  }
  ```

---

### 4.6 Excluir Personagem
Remove permanentemente um personagem do catálogo.

- **Método:** `DELETE`
- **Rota:** `/api/characters/:id`

**Exemplo de Requisição (curl):**
```bash
curl -X DELETE "http://localhost:3000/api/characters/673f4e2b8c9d1234567890ab"
```

**Respostas Possíveis:**
- **200 OK:**
  ```json
  {
    "success": true,
    "message": "Personagem excluído com sucesso.",
    "data": {
      "id": "673f4e2b8c9d1234567890ab",
      "name": "Connor"
    }
  }
  ```
- **404 Not Found:**
  ```json
  {
    "success": false,
    "error": "Personagem com ID 673f4e2b8c9d1234567890ab não foi encontrado."
  }
  ```

---

### 4.7 Obter Lista de Jogos Cadastrados
Auxilia o preenchimento dinâmico de filtros no cliente.

- **Método:** `GET`
- **Rota:** `/api/characters/games`
- **Resposta (200 OK):**
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      "Bayonetta",
      "Detroit: Become Human",
      "Legends Of Runeterra",
      "Red Dead Redemption 2",
      "Resident Evil"
    ]
  }
  ```

---

### 4.8 Carga Inicial de Dados (Seed)
Popula o banco com os 5 personagens iniciais caso a base esteja vazia.

- **Método:** `POST`
- **Rota:** `/api/characters/seed`
- **Query Parameter Opcional:**
  - `force=true`: Limpa a coleção existente antes de inserir novamente.

**Exemplo de Requisição (curl):**
```bash
curl -X POST "http://localhost:3000/api/characters/seed?force=true"
```

---

## 5. Como Testar Utilizando Postman ou Insomnia

1. **Importação:**
   - Crie uma nova coleção chamada **Game Cards API**.
   - Defina uma variável de ambiente chamada `baseUrl` com o valor `http://localhost:3000/api` (ou a URL da Vercel).
2. **Criando as Requisições:**
   - Adicione uma pasta `Characters` com as requisições `GET {{baseUrl}}/characters`, `POST {{baseUrl}}/characters`, etc.
   - Nas requisições POST e PUT, selecione a aba **Body** -> **raw** -> **JSON** e insira os payloads documentados acima.

---

## 6. Consumo da API após o Deploy na Vercel

Após realizar o deploy na plataforma da Vercel, todos os endpoints ficam disponíveis sob a mesma rota relativa `/api/*`:

```bash
# Listar todos os personagens em produção
curl https://seu-projeto.vercel.app/api/characters

# Filtrar por raridade na Vercel
curl "https://seu-projeto.vercel.app/api/characters?rarity=Mythic"

# Cadastrar novo personagem na Vercel
curl -X POST "https://seu-projeto.vercel.app/api/characters" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kratos",
    "game": "God of War",
    "releaseDate": "2018-04-20",
    "image": "KratosGodOfWar",
    "rarity": "Mythic",
    "price": 260.00
  }'
```
