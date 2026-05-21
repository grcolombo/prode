-- Habilitar Realtime para las tablas que necesitan actualizaciones en vivo
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.predictions;
