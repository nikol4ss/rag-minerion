# RAG Minerion

Sistema RAG para indexar documentos sobre a Minerion e responder perguntas com base no conteúdo cadastrado.

## Stack

- Backend: Node.js, Fastify, TypeScript, Kysely, Zod
- Banco: PostgreSQL 16 com `pgvector`
- IA: OpenAI para embeddings e chat
- Frontend: Vue 3, TypeScript, Pinia, TailwindCSS, Vite
- Deploy local: Docker Compose

## Instalação

1. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Edite `.env` e informe sua chave:

```bash
OPENAI_API_KEY=sk-...
```

3. Suba tudo:

```bash
docker compose up --build
```

4. Acesse:

- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/api/health
- PostgreSQL: `localhost:5433`

## Documentos de Teste

Os arquivos em `docs/minerion/` foram preparados a partir de informações públicas do site oficial da Minerion. Eles podem ser usados para popular a base pela tela de Upload ou pela API.

## Endpoints

### Documentos

- `POST /api/documents/upload`: multipart com `file`, `title`, `module`, `description`
- `POST /api/documents/text`: JSON com `title`, `module`, `content`, `description`
- `GET /api/documents?module=&search=`
- `DELETE /api/documents/:id`
- `DELETE /api/database`: apaga documentos, chunks, conversas e mensagens

### Chat

- `POST /api/chat`
- `GET /api/chat/conversations`
- `GET /api/chat/conversations/:id/messages`

### Saúde

- `GET /api/health`

## Desenvolvimento Local sem Docker

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Para esse modo, mantenha um PostgreSQL com `pgvector` rodando e aplique `backend/src/db/schema.sql`.
