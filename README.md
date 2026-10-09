# Repository Insights

Análise de repositórios públicos do GitHub com linguagens, contribuidores, commits, duração de issues e critérios observáveis de estrutura.

## Executar

Requisitos: React, TypeScript, Vercel Functions e Supabase.

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

## Funcionamento

Configure `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. O relatório é salvo em `bd_runs` sob a conta autenticada. Consultas observam até cem registros por coleção e dependem do limite público do GitHub. Critérios de raiz não comprovam qualidade de todo o código; não há promessa de aumentar seguidores ou estrelas.

## Persistência de resultados

O arquivo de operações está em [vercel-home-telemetry-api.vercel.app](https://vercel-home-telemetry-api.vercel.app/laboratory.html?project=fuckup). As migrações Supabase estão no [repositório da API](https://github.com/brunnojob/vercel-home-telemetry-api/tree/main/supabase/migrations).

```sh
python cloud/sync.py enqueue resultado.json --project fuckup
python cloud/sync.py sync
```

Defina `BRUNNODEV_ACCESS_TOKEN` com sua sessão. A fila SQLite conserva os relatórios até confirmação do servidor; o mesmo conteúdo não gera registros duplicados. Tokens não são gravados no código.
