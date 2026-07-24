# Conselho de Agentes Especialistas

Protótipo funcional (backend + frontend) de um "conselho executivo" de agentes
de IA — Conselho, CEO, CIO, CFO e Processos de Negócio — pensado para
empreendedores de startups e gestores de empresas conversarem com
especialistas cujo conhecimento (frameworks, modelos mentais, métodos e
experiência prática) é composto e mantido por você, em um painel
administrativo, sem precisar mexer em código.

Cada agente pode ser assinado individualmente ou em pacotes com desconto,
com cobrança recorrente via Stripe. O usuário cria conta por e-mail/senha,
Google ou Apple, e só conversa com os agentes que assinou.

## Como o produto se organiza

- **Landing (`/`)** — apresentação do conselho, com diagrama do modelo e
  preços dos agentes.
- **Planos (`/pricing`)** — cada agente individual e cada pacote, com botão
  "Assinar" que leva ao checkout do Stripe.
- **Login / Cadastro (`/login`, `/signup`)** — e-mail e senha, ou "Continuar
  com Google" / "Continuar com Apple".
- **App de conversa (`/app`)** — protegido por login. Agentes não assinados
  aparecem bloqueados, com preço e um link para assinar.
- **Painel Admin (`/admin`)** — onde você compõe cada agente (frameworks,
  modelos mentais, métodos, sua experiência de 26 anos, tom de resposta) e
  gerencia preços e pacotes. Protegido por uma senha simples (`ADMIN_PASSWORD`).

Cada mensagem enviada no app de chat é combinada com o conhecimento composto
no Admin e enviada para a API da Anthropic (Claude), que responde já
incorporando os frameworks, modelos mentais e experiência daquele agente —
mas só se o usuário logado tiver assinatura ativa para aquele agente.

## Arquitetura

```
empresarial-ai-board/
├── start.sh                   Sobe backend + frontend juntos com 1 comando
├── preview.html                Prévia visual estática (sem backend), abre com duplo clique
├── render.yaml                 Blueprint de deploy do backend no Render
├── .github/workflows/deploy-pages.yml   Publica o frontend no GitHub Pages a cada push
├── backend/     Node.js + Express + banco em arquivo JSON (lowdb)
│   ├── data/agentsSeed.js      Conteúdo e preço inicial dos 5 agentes
│   ├── data/bundlesSeed.js     Pacotes iniciais (Conselho Completo, Essencial)
│   ├── routes/auth.js          Signup/login por e-mail, Google e Apple
│   ├── routes/billing.js       Checkout, portal de cobrança e webhook do Stripe
│   ├── routes/agents.js        CRUD de agentes (leitura pública, escrita admin)
│   ├── routes/bundles.js       CRUD de pacotes (leitura pública, escrita admin)
│   ├── routes/conversations.js Conversas do usuário logado (gated por assinatura)
│   ├── routes/chat.js          Envia mensagem e chama a Claude API (gated)
│   ├── services/access.js      Resolve quais agentes o usuário pode usar
│   ├── services/anthropic.js   Monta o "system prompt" de cada agente
│   ├── services/stripeClient.js, socialAuth.js, auth.js
│   └── server.js
└── frontend/    React + Vite + Tailwind
    ├── src/pages/Landing.jsx, Pricing.jsx, Login.jsx, Signup.jsx
    ├── src/pages/ChatApp.jsx        App de conversa (mostra bloqueado/liberado)
    ├── src/pages/AdminPanel.jsx     Composição de agentes e pacotes
    ├── src/lib/auth.jsx             Contexto de autenticação (token no localStorage)
    └── src/components/              Ícones de linha, diagrama do conselho, chat, etc.
```

Não há dependências nativas (não usa compiladores/toolchain) — tudo roda com
`npm install` puro em qualquer sistema operacional com Node 18+.

## Como rodar localmente

### Opção rápida: um comando só

```bash
bash start.sh
```

Isso instala as dependências (na primeira vez), cria o `backend/.env` a partir
do exemplo, e sobe backend (porta 4000) e frontend (porta 5173) juntos. Depois
é só abrir `http://localhost:5173`.

### Opção manual (dois terminais)

**Backend:**

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

O backend cria automaticamente os 5 agentes e 2 pacotes iniciais na primeira
execução, salvos em `backend/board.json`. O Vite já redireciona `/api` para o
backend na porta 4000.

## Configurando o `.env` do backend

| Variável | Para que serve | Obrigatória? |
|---|---|---|
| `ANTHROPIC_API_KEY` | Faz os agentes responderem de verdade | Sim, para o chat funcionar |
| `ADMIN_PASSWORD` | Senha do Painel Admin | Sim |
| `JWT_SECRET` | Assina os tokens de login dos usuários | Sim |
| `APP_URL` | URL do frontend, usada nos redirects do Stripe | Sim (padrão já funciona local) |
| `STRIPE_SECRET_KEY` | Chave de teste do Stripe (`sk_test_...`) | Só para vender assinaturas de verdade |
| `STRIPE_WEBHOOK_SECRET` | Valida os eventos do Stripe | Idem |
| `GOOGLE_CLIENT_ID` | Habilita "Continuar com Google" | Opcional |
| `APPLE_CLIENT_ID` | Habilita "Continuar com Apple" | Opcional |

Sem `ANTHROPIC_API_KEY` ou `STRIPE_SECRET_KEY`, o resto do app continua
funcionando normalmente — só as respostas de IA e o botão "Assinar"
mostram um erro amigável explicando o que falta configurar.

## Configurando o Stripe (assinaturas pagas)

1. Crie uma conta em [stripe.com](https://stripe.com) (o modo de teste já vem ativo).
2. Em **Produtos**, crie um Produto + Preço recorrente mensal para cada
   agente e cada pacote (pode usar os valores sugeridos em `agentsSeed.js` e
   `bundlesSeed.js`, ou os seus). Copie o **Price ID** (`price_...`) de cada um.
3. Cole cada Price ID no campo "Stripe Price ID" do agente/pacote correspondente,
   no Painel Admin.
4. Copie sua chave secreta de teste (`sk_test_...`) para `STRIPE_SECRET_KEY`.
5. Para o webhook funcionar em desenvolvimento local, instale a
   [Stripe CLI](https://docs.stripe.com/stripe-cli) e rode:
   ```bash
   stripe listen --forward-to localhost:4000/api/billing/webhook
   ```
   Isso imprime um `whsec_...` — coloque em `STRIPE_WEBHOOK_SECRET`.
6. Teste uma assinatura com o [cartão de teste do Stripe](https://docs.stripe.com/testing) `4242 4242 4242 4242`, qualquer data futura e CVC.

Em produção, troque as chaves de teste pelas chaves reais (`sk_live_...`) e
configure o webhook direto no Dashboard do Stripe apontando para a URL
pública do seu backend.

## Configurando login com Google e Apple (opcional)

**Google** — funciona em `localhost` durante o desenvolvimento:
1. Crie um OAuth Client ID em [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) (tipo "Web application"), com `http://localhost:5173` como origem autorizada.
2. Coloque o Client ID em `backend/.env` (`GOOGLE_CLIENT_ID`) e em `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`), copiando `frontend/.env.example`.

**Apple** — **não funciona em `localhost`**, só depois de publicado em um
domínio HTTPS real:
1. Crie um "Services ID" no [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId), habilite "Sign in with Apple" e cadastre seu domínio HTTPS de produção nos "Return URLs".
2. Coloque o identifier em `backend/.env` (`APPLE_CLIENT_ID`) e em
   `frontend/.env` (`VITE_APPLE_CLIENT_ID`).

Se essas variáveis ficarem vazias, o botão correspondente simplesmente não
aparece na tela de login — o login por e-mail/senha continua funcionando
normalmente.

## Publicando no GitHub e rodando de qualquer navegador (deploy)

O código já está versionado em Git. Para o app funcionar num link acessível de
qualquer navegador — não só no seu computador — frontend e backend precisam
ficar hospedados em dois lugares diferentes, porque o GitHub sozinho só serve
arquivos estáticos:

- **Frontend (React)** → GitHub Pages, direto deste repositório, via GitHub Actions.
- **Backend (Node/Express)** → um serviço que roda Node de verdade. O projeto já
  vem pronto para o [Render](https://render.com) (plano gratuito), com um
  `render.yaml` na raiz.

### 1. Enviar o código para o GitHub

```bash
cd empresarial-ai-board
gh repo create empresarial-ai-board --private --source=. --remote=origin --push
```

(troque `--private` por `--public` se quiser o repositório aberto.)

### 2. Publicar o backend no Render

1. Crie uma conta em [render.com](https://render.com) e conecte sua conta do GitHub.
2. No dashboard, clique em **New +** → **Blueprint** e selecione o repositório
   `empresarial-ai-board`. O Render lê o `render.yaml` da raiz e já configura o
   serviço `empresarial-ai-board-api` (pasta `backend`, `npm install`, `npm start`).
3. Depois que o serviço for criado, abra **Environment** e preencha as
   variáveis obrigatórias: `ANTHROPIC_API_KEY`, `ADMIN_PASSWORD`, `APP_URL` (a
   URL do seu GitHub Pages — ver passo 3) e, se for usar, `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `GOOGLE_CLIENT_ID`, `APPLE_CLIENT_ID`. O
   `JWT_SECRET` já é gerado automaticamente pelo Render.
4. Copie a URL pública gerada pelo Render (algo como
   `https://empresarial-ai-board-api.onrender.com`).

**Nota sobre dados:** no plano gratuito do Render o disco não é persistente
entre reinicializações — o `board.json` (usuários, conversas, assinaturas)
pode ser resetado quando o serviço reinicia após ficar inativo. Ótimo para
demonstrar o produto; para uso real, migre para um banco gerenciado (Postgres,
por exemplo) ou ative um disco persistente pago no Render.

### 3. Publicar o frontend no GitHub Pages

1. No GitHub, vá em **Settings → Pages** e em "Build and deployment" escolha
   **Source: GitHub Actions** (o workflow já está em
   `.github/workflows/deploy-pages.yml`).
2. Ainda no GitHub, vá em **Settings → Secrets and variables → Actions** e
   crie o secret `VITE_API_URL` com a URL do backend copiada no passo
   anterior. Se for usar login social, crie também `VITE_GOOGLE_CLIENT_ID`
   e/ou `VITE_APPLE_CLIENT_ID`.
3. Faça um novo commit/push em `main` (ou rode o workflow manualmente em
   **Actions → Deploy frontend no GitHub Pages → Run workflow**). Em alguns
   minutos o app fica disponível em:
   `https://SEU-USUARIO-GITHUB.github.io/empresarial-ai-board/`
4. Volte no Render e atualize a variável `APP_URL` do backend com essa mesma
   URL (usada pelos redirects do Stripe).

Pronto: esse link funciona em qualquer navegador, em qualquer computador, sem
precisar rodar nada localmente. As rotas usam `#` na URL (ex.: `/#/pricing`)
porque o GitHub Pages não suporta redirecionamento de rotas no servidor — é
uma limitação cosmética, não afeta o funcionamento.

Bônus: como o GitHub Pages já é HTTPS de verdade, o login com Apple (que não
funciona em `localhost`) passa a funcionar nessa URL publicada, desde que o
domínio esteja cadastrado no Apple Developer.

## Compondo o conhecimento de cada agente (o que você faz no Admin)

Cada agente tem 5 campos de conhecimento, usados para montar automaticamente
as instruções enviadas à IA a cada conversa:

1. **Frameworks e metodologias** — o que já vem de mercado (ex.: OKRs, Lean
   Six Sigma, Playing to Win, NIST CSF).
2. **Modelos mentais** — heurísticas de raciocínio que o agente aplica.
3. **Métodos de trabalho** — rotinas práticas que ele recomenda.
4. **Sua experiência profissional** — o campo mais importante: cases reais,
   decisões, erros/aprendizados e heurísticas próprias dos seus 26 anos. É o
   que diferencia o agente de um "ChatGPT genérico".
5. **Tom e estilo de resposta** — como ele deve se comunicar.

Os 5 agentes já vêm com um conteúdo inicial genérico de boas práticas de
mercado — trate-o como ponto de partida e vá substituindo/enriquecendo pelo
Admin com o que é seu. No mesmo painel você também define o **preço mensal**
e o **Stripe Price ID** de cada agente, e cria/edita **pacotes** que combinam
vários agentes em uma assinatura única.

## Próximos passos sugeridos (fora do escopo deste protótipo)

- Recuperação de senha (esqueci minha senha) e verificação de e-mail.
- Deploy em produção (ex.: backend em um serviço Node gerenciado, frontend
  como build estático, domínio HTTPS para habilitar o login com Apple).
- Streaming da resposta da IA (hoje a resposta chega inteira, não token a
  token).
- Multi-tenant, se for atender mais de uma empresa com bases separadas.
- Notas fiscais e faturamento automático (o Stripe já gera recibos básicos,
  mas emissão de NF-e no Brasil normalmente exige um serviço à parte).
