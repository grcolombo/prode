import { Pool } from 'pg';

let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.TARIFAR_DB_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 30000,
    });
  }
  return _pool;
}

export async function isActiveTarifarUser(email: string): Promise<boolean> {
  const result = await getPool().query(
    'SELECT 1 FROM users WHERE username = $1 AND active = true AND free_user = false LIMIT 1',
    [email.toLowerCase()]
  );
  return (result.rowCount ?? 0) > 0;
}
