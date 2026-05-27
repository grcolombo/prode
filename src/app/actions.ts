'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { isActiveTarifarUser } from '@/lib/tarifar-db';

export async function validateEmail(
  email: string
): Promise<{ valid: boolean; connectionError?: boolean }> {
  const normalized = email.trim().toLowerCase();
  const supabase = createAdminClient();

  // Si ya completó onboarding (tiene alias) → acceso directo sin re-validar
  const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 10000 });
  const authUser = existingUsers?.users?.find(u => u.email === normalized);
  if (authUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('alias')
      .eq('id', authUser.id)
      .maybeSingle();
    if (profile?.alias) return { valid: true };
  }

  // Empleados: verificar en employee_emails
  const { data: emp } = await supabase
    .from('employee_emails')
    .select('email')
    .eq('email', normalized)
    .maybeSingle();

  if (emp) return { valid: true };

  // Clientes nuevos: verificar en Tarifar 4.0 (active = true, free = false)
  try {
    const active = await isActiveTarifarUser(normalized);
    return { valid: active };
  } catch {
    return { valid: false, connectionError: true };
  }
}
