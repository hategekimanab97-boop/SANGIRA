import pg, { type Pool, type PoolClient } from 'pg';

const { Pool: PgPool } = pg;

let poolInstance: Pool | null = null;
let cachedConnectionString: string | undefined = undefined;

export function getDbPool(): Pool | null {
  const connStr = process.env.DATABASE_URL?.trim();
  if (!connStr || connStr.startsWith('MY_')) {
    return null;
  }

  if (poolInstance && cachedConnectionString === connStr) {
    return poolInstance;
  }

  cachedConnectionString = connStr;
  poolInstance = new PgPool({
    connectionString: connStr,
    ssl:
      connStr.includes('supabase.co') ||
      connStr.includes('supabase.com') ||
      connStr.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
  });

  poolInstance.on('error', (err) => {
    console.error('[PostgreSQL Pool Error]', err.message);
  });

  return poolInstance;
}

export interface RlsSessionContext {
  userId?: string;
  businessId?: string;
  role?: string;
}

export async function withRlsTransaction<T>(
  ctx: RlsSessionContext,
  work: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `SELECT
         set_config('app.current_user_id', $1, true),
         set_config('app.current_business_id', $2, true),
         set_config('app.current_role', $3, true)`,
      [
        ctx.userId || 'anonymous',
        ctx.businessId || 'biz-grand-kigali',
        ctx.role || 'PUBLIC_GUEST',
      ]
    );
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function testDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  const pool = getDbPool();
  if (!pool) {
    return { connected: false, error: 'DATABASE_URL is not configured' };
  }
  try {
    await pool.query('SELECT 1 AS ok');
    return { connected: true };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'PostgreSQL connection failed',
    };
  }
}
