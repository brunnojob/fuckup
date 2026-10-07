# Database Setup Guide for Vercel

After your Vercel deployment completes, you need to create the database tables. Follow these steps:

## Option 1: Use Vercel CLI (Recommended)

```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# Login to Vercel
vercel login

# Run Prisma from your project directory
vercel env pull  # Download environment variables
npx prisma db push --skip-generate
```

## Option 2: Use Node.js directly

```bash
# Make sure you have NODE_ENV set
$env:NODE_ENV="production"
$env:DATABASE_URL="your_neon_connection_string"

npx prisma db push --skip-generate
```

## Option 3: Use Prisma Studio

```bash
# This opens an interactive UI to manage your database
npx prisma studio
```

## What gets created?

The migration creates the original follow tables plus the discovery tables:
- **User** - Stores GitHub user info and requirement tracking
- **Follows** - Stores follow relationships between users
- **DailyFollowLimit** - Tracks daily follow limits per user
- **DiscoveryRepositorySubmission** - Stores active repository submissions and discovery-star totals
- **DiscoveryRepositoryInteraction** - Stores one STAR or SKIP interaction per user and repository
- **DiscoveryProfileInteraction** - Stores one FOLLOW or SKIP interaction per user and profile
- **DailyDiscoveryUsage** - Stores server-enforced daily star and follow counters

## Verify it worked

After running the command, you should see:
```
✓ Database connected and tables created
✓ 0 tables created
✓ 0 indexes created
```

## Test the app

1. Go to your Vercel deployment URL
2. Click "Get Started"
3. Sign in with GitHub
4. You should see either:
   - "Support Project" page (new users)
   - "Features" page (returning users with requirements complete)

If you still see "Failed to verify GitHub status", the database setup may have failed. Check the Vercel function logs at: https://vercel.com/dashboard → Your Project → Functions
# Conectar o banco ao projeto `fuckup` na Vercel

O login OAuth usa `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`. Essas variáveis não configuram o PostgreSQL.

1. Abra o projeto `fuckup` na Vercel e selecione **Storage**.
2. Conecte o banco PostgreSQL existente ao projeto. Se usar Supabase, selecione a integração existente e vincule o recurso correto ao projeto.
3. Confirme em **Environment Variables** que há uma URL PostgreSQL para **Production**. O backend aceita `DATABASE_URL`, `POSTGRES_PRISMA_URL` ou `POSTGRES_URL`, nessa ordem. Para os comandos Prisma, configure `DATABASE_URL`.
4. Se a integração não adicionar a conexão, obtenha a URI PostgreSQL no painel do provedor e salve-a como `DATABASE_URL` na Vercel. A URL HTTPS da API Supabase e a chave pública Supabase não substituem a URI PostgreSQL.
5. Faça um novo deploy depois de vincular o banco ou alterar as variáveis.
6. Acesse `/api/health/database`: `ready` confirma a conexão e a tabela `User`; `not_configured` indica ausência da URL; `unavailable` indica falha de conexão ou schema.

Se faltarem tabelas, aplique o schema revisado com `npx prisma db push --skip-generate` em um ambiente autorizado com `DATABASE_URL` configurada. Não use `--accept-data-loss`. O build não modifica o banco automaticamente.

Nunca envie a URI ou a senha do banco em mensagens, prints ou commits.
