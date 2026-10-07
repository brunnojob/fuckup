# fuckup - É UMA APLICAÇÃO PARA AUXILIAR E AUTOMATIZAR O USÚARIO A CONSEGUIR Achievements rápidos como:  Quickdraw, Pull Shark, YOLO, Pair Extraordinaire

Aplicação React com Vite e APIs na Vercel, usando Prisma e PostgreSQL.

## Desenvolvimento

```bash
npm ci
npx prisma generate
npm run dev
```

O servidor do Vite atende o frontend. As rotas de `api/` precisam do ambiente da Vercel para funcionar.

## Build

```bash
npm run build
```

O build gera o cliente Prisma e o frontend em `dist/`.

## Deploy na Vercel

- Framework: Vite.
- Diretório raiz: raiz do repositório.
- Comando de build: `npm run build`.
- Diretório de saída: `dist`.
- Backend: funções TypeScript em `api/`.

Configure `DATABASE_URL` (ou `POSTGRES_PRISMA_URL` / `POSTGRES_URL` para o backend), `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` na Vercel. Se definir `GITHUB_REDIRECT_URI`, use a URL de produção seguida de `/api/auth/github/callback` e configure o mesmo callback no aplicativo OAuth do GitHub.

Nunca inclua credenciais no repositório. Publicar o frontend não confirma que o banco e o OAuth estão configurados; valide o login e as operações do banco após o deploy.

Veja [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) e [DATABASE_SETUP.md](./DATABASE_SETUP.md) para a configuração do banco. Execute alterações de schema separadamente do build, após revisar o banco de destino.
