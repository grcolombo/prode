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
    `SELECT 1
     FROM users u
     JOIN iara.fizz_activations fa ON fa.id = u.fizz_activation_id
     WHERE u.username = $1
       AND u.active = true
       AND u.free_user = false
       AND fa.sub_fecha_exp IS NOT NULL
       AND fa.sub_fecha_exp >= CURRENT_DATE
     LIMIT 1`,
    [email.toLowerCase()]
  );
  return (result.rowCount ?? 0) > 0;
}
