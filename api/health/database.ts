import prisma from '../../lib/db.js';
import { getDatabaseUrl } from '../../lib/database-config.js';
import type { ApiRequest, ApiResponse } from '../../lib/api-types.js';

// Read-only probe: verifies the connection and the User table without returning user data.
export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!getDatabaseUrl()) return res.status(503).json({ status: 'not_configured' });
  try {
    await prisma.user.findFirst({ select: { id: true } });
    return res.status(200).json({ status: 'ready' });
  } catch (error) {
    console.error('Database readiness check failed:', error);
    return res.status(503).json({ status: 'unavailable' });
  }
}
