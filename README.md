# Sgt Vitor — Plataforma de Educação + IA com RAG

Plataforma mobile-first de educação sobre legislação armamentista brasileira, com IA baseada em RAG (Retrieval-Augmented Generation), biblioteca de PDFs, simulados, vídeos e sistema de assinaturas.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **TailwindCSS 4** — dark mode premium, glassmorphism
- **Framer Motion** — animações suaves
- **Firebase** — Auth, Firestore, Storage
- **PWA** — instalável no iOS/Android
- **RAG** — busca vetorial + respostas com fontes citadas

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Chat IA** | Interface estilo ChatGPT, streaming, citações de fonte, anti-alucinação |
| **Biblioteca** | PDFs por categoria (Legislação, Segurança, Normas), busca e visualizador |
| **Simulados** | Quizzes com correção automática, explicações com fonte, ranking |
| **Vídeos** | YouTube embeds, playlists por tema |
| **Perfil** | Progresso, planos, indicações, badges |
| **Dúvidas Guiadas** | Formulário com tipo, contexto e nível de conhecimento |

## Planos

- **Free** — 5 perguntas/dia, biblioteca básica, simulados limitados
- **Premium** — IA ilimitada, RAG completo, simulados avançados
- **Premium Plus** — Conteúdo exclusivo, trilhas personalizadas

## Estrutura

```
src/
├── components/       # UI reutilizável
├── pages/            # Páginas principais
├── features/
│   ├── chat/         # Hook e quick questions
│   ├── rag/          # Knowledge base, vector store, embeddings
│   ├── library/      # Dados da biblioteca
│   ├── simulations/  # Quizzes e ranking
│   └── videos/       # Playlists de vídeo
├── services/
│   ├── firebase/     # Auth, Firestore, config
│   └── ai/           # AI service com RAG
├── hooks/            # useSubscription, useReferral
├── contexts/         # AuthContext
├── types/            # TypeScript types
└── styles/           # Globals CSS + Tailwind
```

## Setup

```bash
cd sgt-vitor-edu
npm install
cp .env.example .env
# Configure Firebase e OpenAI no .env
npm run dev
```

### GitHub e deploy (3 URLs)

O mesmo código publica **app**, **admin sistema** e **admin loja** em domínios separados, com **um único Firebase**. Veja o guia completo em [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

```bash
npm run build:app      # PWA — usuários
npm run build:admin    # Painel administrativo
npm run build:store    # Painel da loja
```

### Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication (Email + Google)
3. Crie Firestore e Storage
4. Copie as credenciais para `.env`

### RAG em Produção

O app inclui uma knowledge base local com trechos de legislação. Para produção:

1. Faça upload dos PDFs no Firebase Storage
2. Processe com pipeline de chunking + embeddings (OpenAI `text-embedding-3-small`)
3. Armazene vetores no Firestore ou Pinecone
4. Configure `VITE_OPENAI_API_KEY` e conecte ao backend em `VITE_AI_API_URL`

## PWA

O app é instalável como PWA. No mobile, use "Adicionar à Tela de Início".

## IA — Comportamento

- Responde **apenas** com base nos documentos indexados
- **Sempre** cita fonte (PDF, artigo, página)
- Se não encontrar → "não encontrado no material"
- **Nunca** inventa informações legais
- Prioriza legislação brasileira

## Licença

Projeto privado — Sgt Vitor.
