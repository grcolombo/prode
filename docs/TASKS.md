# TASKS — PRODE Mundial 2026
## Estado al 2026-05-16

---

## Pendiente de implementación (confirmado por usuario)

- [ ] **Magic link (email)** como método de login alternativo para usuarios sin cuenta Google. Agregar campo de email + botón "Enviar link" en la landing page junto al botón de Google. Supabase: `supabase.auth.signInWithOtp({ email })`.

---

## Pendiente antes del lanzamiento (NO bloquea desarrollo)

- [ ] **Publicar pantalla de consentimiento OAuth en Google Cloud Console** para que clientes externos puedan hacer login con Google. Actualmente el acceso está restringido solo a usuarios de la organización (@tarifar.com). Pasos: Google Cloud Console → APIs & Services → OAuth consent screen → Publish App → completar verificación si Google la requiere.

---

## Pendiente de decisión del usuario (BLOQUEA desarrollo)

- [ ] **Nombres de premios secundarios** con tinte argentino/gracioso (usuario los está pensando)
  - `best_streak` → TBD
  - `top_scorer` → candidato "El Pichichi"
  - `most_draws` → TBD
  - `most_suffered` → TBD
  - `most_controversial` → TBD
- [ ] **Desempate del ganador**: confirmar si pueden coexistir múltiples ganadores en último nivel de desempate

---

## Fase 1 — Setup inicial

- [ ] Inicializar proyecto Next.js 14 con App Router, TypeScript, Tailwind
  ```
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```
- [ ] Instalar dependencias de Supabase
  ```
  npm install @supabase/supabase-js @supabase/ssr
  ```
- [ ] Crear `.env.local` con credenciales de Supabase (el usuario debe proveerlas)
- [ ] Configurar Supabase client para browser (`src/lib/supabase/client.ts`)
- [ ] Configurar Supabase client para server (`src/lib/supabase/server.ts`)
- [ ] Configurar middleware de Next.js (`src/middleware.ts`) para proteger rutas

---

## Fase 2 — Base de datos

- [ ] Crear proyecto en Supabase (lo hace el usuario)
- [ ] Habilitar Google OAuth en Supabase Auth (lo hace el usuario, necesita Google Cloud credentials)
- [ ] Ejecutar migración SQL inicial (`supabase/migrations/001_initial_schema.sql`)
  - Tablas: `employee_emails`, `profiles`, `matches`, `predictions`
  - RLS policies
  - Trigger: crear perfil al hacer signup
- [ ] Correr script de seed para los 72 partidos de grupos (`supabase/seed.ts`)
- [ ] Cargar lista inicial de emails de empleados en `employee_emails`

---

## Fase 3 — Auth y middleware

- [ ] Página `/` con botón "Ingresar con Google"
- [ ] Callback de auth (`/auth/callback`)
- [ ] Middleware: redirigir `/fixture`, `/ranking` a `/` si no hay sesión
- [ ] Middleware: redirigir a `/onboarding` si no tiene alias
- [ ] Middleware: proteger `/admin` para solo `is_admin = true`
- [ ] Página `/onboarding` — formulario de alias con validación de unicidad

---

## Fase 4 — Fixture y pronósticos

- [ ] Página `/fixture` — layout general
- [ ] Componente: selector de etapa (Grupos / R32 / R16 / Cuartos / Semis / Final)
- [ ] Componente: tarjeta de partido con inputs de pronóstico
- [ ] Lógica de guardado de pronóstico (upsert en `predictions`)
- [ ] Indicador visual: partido con/sin pronóstico
- [ ] Componente: countdown al deadline
- [ ] Vista post-deadline: resultado real + pronóstico + puntos por partido

---

## Fase 5 — Admin

- [ ] Página `/admin` con tabs
- [ ] Tab "Cargar resultados": lista partidos sin resultado → input score → confirmar → calcular puntos
- [ ] Función `calculate_points(prediction, real_result)` en `src/lib/points.ts`
- [ ] Tab "Cruces eliminatorios": asignar equipos a slots de fase eliminatoria
- [ ] Tab "Ver fixture usuario": selector de usuario + vista readonly de sus pronósticos (opcional)

---

## Fase 6 — Ranking y premios

- [ ] Página `/ranking` — tabla de posiciones filtrada por rol del usuario
- [ ] Query: calcular puntajes totales, exactos, etc.
- [ ] Componente: tabla de posiciones con alias + puntos + exactos
- [ ] Calcular premios secundarios (una vez definidos los nombres)
- [ ] Sección de stats de color / premios

---

## Fase 7 — Deploy

- [ ] Configurar proyecto en Vercel
- [ ] Agregar variables de entorno en Vercel
- [ ] Configurar dominio (si aplica)
- [ ] Smoke test en producción

---

## Deuda técnica / mejoras post-MVP

- [ ] Restricción de dominio corporativo en Supabase (opcional, para limitar login de empleados)
- [ ] Realtime updates en ranking (Supabase Realtime)
- [ ] Notificaciones cuando se cargan resultados
- [ ] Vista de todos los pronósticos post-deadline (transparencia)
