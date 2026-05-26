'use server';

import { isActiveTarifarUser } from '@/lib/tarifar-db';

export async function checkTarifarUser(email: string): Promise<{ allowed: boolean; error?: string }> {
  try {
    const allowed = await isActiveTarifarUser(email);
    return { allowed };
  } catch {
    return { allowed: false, error: 'connection_error' };
  }
}
