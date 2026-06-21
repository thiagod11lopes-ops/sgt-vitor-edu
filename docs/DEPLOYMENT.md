# Deploy — três URLs, um banco de dados

O Sgt Vitor é um único repositório React/Vite publicado em **três endereços**, compartilhando o **mesmo projeto Firebase** (Auth, Firestore, Storage).

| Superfície | URL exemplo | Build | Rotas expostas |
|------------|-------------|-------|----------------|
| **App (PWA)** | `https://app.seudominio.com.br` | `npm run build:app` | Biblioteca, simulados, loja cliente, perfil… |
| **Admin sistema** | `https://admin.seudominio.com.br` | `npm run build:admin` | `/admin/*` |
| **Admin loja** | `https://loja-admin.seudominio.com.br` | `npm run build:store` | `/loja-admin/*` |

Em **desenvolvimento local** (`npm run dev`), todas as rotas ficam disponíveis em `http://localhost:5173` — não é necessário definir `VITE_DEPLOYMENT_SURFACE`.

## 1. GitHub

Na pasta `sgt-vitor-edu`:

```bash
git init
git add .
git commit -m "Initial commit — Sgt Vitor"
git remote add origin https://github.com/SEU_USUARIO/sgt-vitor.git
git push -u origin main
```

O workflow `.github/workflows/ci.yml` valida o build padrão e os três builds por superfície a cada push/PR.

## 2. Variáveis de ambiente

Copie o exemplo e preencha Firebase + URLs de produção:

```bash
cp .env.example .env
```

| Variável | Uso |
|----------|-----|
| `VITE_FIREBASE_*` | **Mesmas credenciais** nos três deploys |
| `VITE_APP_URL` | URL pública do app |
| `VITE_SYSTEM_ADMIN_URL` | URL do painel administrativo |
| `VITE_STORE_ADMIN_URL` | URL do painel da loja |
| `VITE_ADMIN_PASSWORD` | Senha do admin sistema |
| `VITE_STORE_ADMIN_PASSWORD` | Senha do admin loja |

Os arquivos `.env.app`, `.env.system-admin` e `.env.store-admin` definem apenas `VITE_DEPLOYMENT_SURFACE` para cada build. O `.env` local continua sendo a fonte das credenciais Firebase.

Configure os mesmos secrets no GitHub (**Settings → Secrets → Actions**) quando for fazer deploy automatizado.

## 3. Firebase Hosting (multi-site)

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com).
2. Ative Auth, Firestore e Storage.
3. Crie **três sites** de Hosting no mesmo projeto (ex.: `sgt-vitor-app`, `sgt-vitor-system-admin`, `sgt-vitor-store-admin`).
4. Copie `.firebaserc.example` para `.firebaserc` e ajuste IDs e targets.
5. Publique regras do Firestore:

```bash
firebase deploy --only firestore:rules
```

### Build e deploy por superfície

```bash
# App
npm run build:app
firebase deploy --only hosting:app

# Admin sistema
npm run build:admin
firebase deploy --only hosting:system-admin

# Admin loja
npm run build:store
firebase deploy --only hosting:store-admin
```

Cada build gera a pasta `dist/` com apenas as rotas da superfície correspondente.

## 4. Banco de dados compartilhado

Esquema Firestore centralizado em `src/services/firebase/collections.ts`:

- `videos`, `documents` — conteúdo gerenciado pelo admin sistema
- `storeProducts`, `storeOrders` — loja (cliente + admin loja)
- `users` (+ subcoleções) — perfil, histórico, simulados
- `consultingRequests`, `analyticsEvents` — consultoria e métricas

Hoje, sem Firebase configurado, o app usa **localStorage/IndexedDB** (modo demo). Com `VITE_FIREBASE_*` válidos, `getDataBackend()` retorna `firebase` e as três URLs passam a ler/escrever no mesmo projeto.

Regras iniciais em `firestore.rules` — **revise antes de produção** (admins precisarão de custom claims ou Cloud Functions para escrita em conteúdo/loja).

## 5. Links entre superfícies

Com as URLs configuradas no `.env`, links discretos (ex.: “Painel administrativo” no perfil, “Área da loja” na loja) apontam automaticamente para o domínio correto via `SurfaceLink` e `src/config/deployment.ts`.

## 6. Detecção automática por hostname

Se `VITE_DEPLOYMENT_SURFACE` não estiver definido, o app compara `window.location.hostname` com os hostnames de `VITE_APP_URL`, `VITE_SYSTEM_ADMIN_URL` e `VITE_STORE_ADMIN_URL` para escolher a superfície — útil se o mesmo build for servido em domínios distintos sem rebuild.
