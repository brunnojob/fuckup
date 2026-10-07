// Keep database credentials on the server. Never return the URL to clients.
export function getDatabaseUrl(env: Record<string, string | undefined> = process.env): string | undefined {
  for (const key of ['DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL']) {
    const value = env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}
