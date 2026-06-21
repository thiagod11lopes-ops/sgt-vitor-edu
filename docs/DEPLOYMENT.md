# Deploy — GitHub Pages + Firebase (somente banco)

| Camada | Serviço | Função |
|--------|---------|--------|
| **Código e publicação** | GitHub + GitHub Pages | Repositório, CI e site público |
| **Banco de dados** | Firebase (Firestore, Auth, Storage) | Dados compartilhados entre dispositivos |

O Firebase **não hospeda** o frontend. Apenas armazena e serve dados.

## URL pública

Após o deploy automático:

**https://thiagod11lopes-ops.github.io/sgt-vitor-edu/**

| Área | URL |
|------|-----|
| App / Perfil | `/perfil` |
| Loja | `/loja` |
| Admin sistema | `/admin/login` |
| Admin loja | `/loja-admin/login` |

Todas as rotas ficam no **mesmo endereço** (como no dev local).

---

## 1. Ativar GitHub Pages

> **Repositório privado:** no plano gratuito do GitHub, **Pages não funciona em repos privados**.  
> Opções: tornar o repositório **público** (`Settings → General → Danger zone → Change visibility`) ou usar plano pago (Pro/Team).

No repositório GitHub → **Settings → Pages**:

- **Source:** GitHub Actions

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente a cada `push` na branch `master`.

---

## 2. Secrets do GitHub (Settings → Secrets → Actions)

Configure para o build de produção conectar ao Firebase:

| Secret | Descrição |
|--------|-----------|
| `VITE_FIREBASE_API_KEY` | Credencial web do Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | `seu-projeto.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket do Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_ADMIN_PASSWORD` | Senha admin sistema (opcional) |
| `VITE_STORE_ADMIN_PASSWORD` | Senha admin loja (opcional) |
| `VITE_OPENAI_API_KEY` | IA (opcional) |
| `VITE_AI_API_URL` | Backend IA (opcional) |

Para atualizar **regras do Firestore** via GitHub:

| Secret | Descrição |
|--------|-----------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON da service account (Firebase Console → Project settings → Service accounts) |

Workflow: `.github/workflows/firebase-rules.yml` (dispara ao alterar `firestore.rules`).

---

## 3. Firebase (somente banco)

1. Crie um projeto em [Firebase Console](https://console.firebase.google.com)
2. Ative **Authentication**, **Firestore** e **Storage**
3. Copie as credenciais web para os secrets do GitHub acima
4. Publique as regras localmente (primeira vez) ou via workflow:

```bash
firebase login
firebase deploy --only firestore --project SEU_PROJECT_ID
```

Esquema das coleções: `src/services/firebase/collections.ts`  
Regras: `firestore.rules`

---

## 4. Atualizar o sistema

Qualquer alteração publicada com:

```bash
git add .
git commit -m "Sua mensagem"
git push origin master
```

O GitHub Actions faz build e publica em ~1–2 minutos.

---

## 5. Desenvolvimento local

```bash
npm install
cp .env.example .env
# Preencha Firebase no .env (opcional — demo usa localStorage)
npm run dev
```

Local: **http://localhost:5173** (sem prefixo `/sgt-vitor-edu/`).

---

## 6. Domínio próprio (opcional)

Em **Settings → Pages → Custom domain**, aponte seu domínio e ajuste `VITE_BASE_PATH` no workflow para `/` se o site ficar na raiz do domínio.
