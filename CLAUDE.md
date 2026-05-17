# PRODE — Pronóstico Deportivo Mundial 2026
## Contexto para Claude (leer siempre al iniciar sesión)

---

## ¿Qué es este proyecto?

Web app de pronósticos del Mundial 2026 para uso interno de **Tarifar** (empleados) y sus **clientes**. Dos grupos de participantes en paralelo, con premios separados. Deploy en Vercel, DB en Supabase.

**Contacto**: gcolombo@tarifar.com

---

## Stack técnico (DEFINITIVO)

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14+ con App Router |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| DB + Auth | Supabase (proyecto nuevo, plan free) |
| Deploy | Vercel |

---

## Decisiones de diseño tomadas (NO renegociar)

### Auth
- **Un solo flujo**: Google OAuth para TODOS (empleados y clientes)
- No hay registro con email/password ni magic links
- Al hacer login por primera vez → pantalla `/onboarding` para elegir alias único (no cambiable)
- El nombre real de Google NUNCA se muestra a otros usuarios

### Roles: empleado vs cliente
- Tabla `employee_emails` en DB con el listado de mails de empleados (mix de @tarifar.com y cuentas personales)
- Al hacer login, se chequea si el email está en `employee_emails` → `role = 'employee'`, caso contrario → `role = 'client'`
- Los empleados NO ven el ranking de clientes y viceversa (rankings completamente separados)
- Ambos grupos pronostican los MISMOS partidos con las MISMAS reglas de puntos
- Premios distintos para cada grupo

### Fixture
- **Torneo completo**, no solo fase de grupos
- Fase de grupos: **72 partidos** (12 grupos × 6 partidos), datos en `docs/fixture_grupos.json`
- Fase eliminatoria: el admin asigna equipos a los cruces manualmente cuando se definen
- Etapas eliminatorias: R32 (16 partidos), R16 (8), Cuartos (4), Semis (2), 3er puesto (1), Final (1) = 32 partidos knockout

### Deadline
- Cierre del fixture: inicio del primer partido del Mundial 2026 (**11 de junio de 2026, 16:00 hora Argentina**)
- Después del deadline: fixture en modo solo lectura, se muestran resultados reales + puntos por partido

### Admin
- Campo `is_admin = true` en `profiles`, asignado directamente en DB
- Panel admin: cargar resultados reales + ver fixture de cualquier usuario
- Solo el admin puede ver pronósticos de otro usuario antes del deadline

---

## Sistema de puntos (DEFINITIVO)

Los 12 pts del resultado exacto **reemplazan** los demás (no se suman).

| Acierto | Puntos |
|---|---|
| Resultado exacto (score exacto) | 12 pts |
| Acertar ganador o empate (sin exacto) | 5 pts |
| Acertar goles equipo local (sin exacto) | 2 pts |
| Acertar goles equipo visitante (sin exacto) | 2 pts |

**Ejemplos** (resultado real: Argentina 3-1 Nigeria):
- 3-1 → 12 pts
- 2-1 → 7 pts (ganador + goles visitante)
- 2-0 → 5 pts (ganador, sin goles exactos)
- 0-1 → 2 pts (goles visitante)
- 0-0 → 0 pts

### Desempate ganador principal
1. Más puntos totales
2. Más resultados exactos (12 pts)
3. Más aciertos de goles equipo local
4. Más aciertos de goles equipo visitante
5. Si sigue igual → pueden coexistir múltiples ganadores (a confirmar)

---

## Premios secundarios ("datos de color")

Los nombres con tinte argentino están **PENDIENTES DE DEFINICIÓN** por el usuario. Lógica confirmada:

Solo hay premiación para 1er, 2do y 3er puesto del ranking. Rankings separados para empleados y clientes. **No hay premios secundarios ni stats de color.**

---

## Rutas de la app

| Ruta | Descripción | Auth |
|---|---|---|
| `/` | Landing con countdown al Mundial + botón "Ingresar con Google" | Pública |
| `/onboarding` | Elegir alias (solo usuarios sin alias) | Auth requerida |
| `/fixture` | Fixture completo con formulario de pronósticos | Auth + alias |
| `/ranking` | Tabla de posiciones + premios secundarios (separado por rol) | Auth |
| `/admin` | Panel admin: cargar resultados + ver fixture de usuarios | Admin only |

---

## Estructura de archivos del proyecto (a crear)

```
PRODE/
├── CLAUDE.md                    ← este archivo
├── docs/
│   ├── SPEC.md                  ← spec completa actualizada
│   ├── TASKS.md                 ← tareas pendientes
│   ├── DB_SCHEMA.md             ← esquema SQL completo
│   ├── fixture_grupos.json      ← 72 partidos fase de grupos con fechas/horarios
│   └── fixture_mundial_2026.html ← fuente original (Google)
├── src/
│   ├── app/                     ← Next.js App Router
│   │   ├── (auth)/
│   │   │   └── onboarding/
│   │   ├── fixture/
│   │   ├── ranking/
│   │   ├── admin/
│   │   └── page.tsx             ← landing /
│   ├── components/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── points.ts            ← lógica de cálculo de puntos
│   │   └── types.ts             ← tipos TypeScript globales
│   └── middleware.ts            ← protección de rutas
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.ts                  ← script para cargar los 72 partidos
├── .env.local                   ← (no commitear) SUPABASE_URL, SUPABASE_ANON_KEY
└── package.json
```

---

## Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # solo para seed y operaciones server-side admin
```

---

## Notas importantes para el desarrollo

- **Mobile-first** obligatorio — mayoría de usuarios desde celular
- Horarios del fixture en **UTC-3 (hora Argentina)** — convertir a UTC para guardar en DB
- Los pronósticos son **privados** hasta que cierra el fixture (deadline). Nadie puede ver pronósticos de otro usuario excepto el admin
- Partidos eliminatorios: se crean en DB con `home_team = null` / `away_team = null` y un campo `slot_label` (ej: "Ganador Grupo A"). El admin completa los equipos cuando se definen
- El seed script lee `docs/fixture_grupos.json` para cargar los 72 partidos de grupos

---

## Estado del proyecto al 2026-05-16

- [ ] Proyecto Next.js inicializado
- [ ] Supabase configurado
- [ ] Schema DB creado
- [ ] Seed script corrido
- [ ] Auth Google OAuth
- [ ] Middleware de rutas
- [ ] Página `/` landing
- [ ] Página `/onboarding`
- [ ] Página `/fixture`
- [ ] Página `/ranking`
- [ ] Página `/admin`
- [ ] Deploy en Vercel

**Nada de código escrito aún. Arrancar por: inicializar Next.js → configurar Supabase → schema DB → seed.**
