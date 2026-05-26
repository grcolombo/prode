'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { isActiveTarifarUser } from '@/lib/tarifar-db';

export async function validateEmail(
  email: string
): Promise<{ valid: boolean; connectionError?: boolean }> {
  const normalized = email.trim().toLowerCase();
  const supabase = createAdminClient();

  // Empleados: verificar en employee_emails (bypasean la verificación de Tarifar DB)
  const { data: emp } = await supabase
    .from('employee_emails')
    .select('email')
    .eq('email', normalized)
    .maybeSingle();

  if (emp) return { valid: true };

  // Clientes: verificar en Tarifar 4.0 (active = true, free = false)
  try {
    const active = await isActiveTarifarUser(normalized);
    return { valid: active };
  } catch {
    return { valid: false, connectionError: true };
  }
}
