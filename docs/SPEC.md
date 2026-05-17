# SPEC — PRODE Mundial 2026
## Versión actualizada al 2026-05-16

---

## Contexto

App de pronósticos del Mundial 2026 para **Tarifar**. Dos audiencias en paralelo:
- **Empleados**: staff de Tarifar (emails corporativos @tarifar.com + algunos personales)
- **Clientes**: clientes de Tarifar, acceso con cualquier cuenta Google

Ambos grupos juegan en paralelo, ven rankings separados, tienen premios distintos.

---

## Stack

- Next.js 14+ App Router + TypeScript
- Tailwind CSS (mobile-first)
- Supabase: DB (PostgreSQL) + Auth (Google OAuth)
- Deploy: Vercel

---

## Autenticación

- **Un solo método**: Google OAuth (Supabase Auth)
- Todos ingresan con Google — no hay email/password ni magic links
- Al primer login → redirect a `/onboarding` para elegir alias
- Alias: único, no cambiable, nunca se muestra el nombre real de Google

### Detección de rol
- Tabla `employee_emails(email text primary key)` cargada por admin
- Al crear perfil: si email ∈ employee_emails → role = 'employee', si no → role = 'client'
- El rol queda guardado en `profiles.role` y no cambia

---

## Fixture

### Fase de grupos — 72 partidos
- 12 grupos (A–L), 4 equipos por grupo, 6 partidos por grupo
- Datos completos en `docs/fixture_grupos.json` (fuente de verdad)
- Primer partido: **11 de junio de 2026, 16:00 hora Argentina (19:00 UTC)**
- Último partido de grupos: 27 de junio de 2026

### Fase eliminatoria — 32 partidos
| Ronda | Partidos | Cuándo se definen |
|---|---|---|
| Round of 32 (R32) | 16 | ~28-30 junio 2026 |
| Round of 16 (R16) | 8 | ~2-4 julio 2026 |
| Cuartos de final | 4 | ~5-6 julio 2026 |
| Semifinales | 2 | ~9-10 julio 2026 |
| 3er puesto | 1 | ~12 julio 2026 |
| Final | 1 | ~13 julio 2026 |

Los partidos eliminatorios se crean en DB con equipos vacíos (`home_team = null`) y un `slot_label` descriptivo (ej: "Ganador Grupo A"). El admin completa los equipos reales mediante el panel de administración cuando se conocen.

### Deadline
- **11 de junio de 2026, 16:00 hora Argentina** (inicio primer partido)
- Antes del deadline: pronósticos editables libremente
- Después: fixture solo lectura + resultados reales + puntos por partido visibles

---

## Sistema de puntos

Los 12 pts del resultado exacto **reemplazan** los demás (no se acumulan).

| Acierto | Puntos |
|---|---|
| Resultado exacto | 12 |
| Ganador o empate correcto (sin exacto) | 5 |
| Goles local correctos (sin exacto) | 2 |
| Goles visitante correctos (sin exacto) | 2 |

**Casos edge**:
- Exacto: 12 (no suma 5+2+2)
- Ganador + un gol: 5+2 = 7
- Solo un gol correcto (ganador incorrecto): 2
- Todo mal: 0

### Desempate (ganador principal)
1. Mayor puntaje total
2. Mayor cantidad de resultados exactos
3. Mayor cantidad de aciertos en goles local
4. Mayor cantidad de aciertos en goles visitante
5. Si persiste empate: pueden coexistir múltiples ganadores *(a confirmar con el usuario)*

---

## Premios

Solo hay premiación para los 3 primeros puestos del ranking (por separado para empleados y clientes).

| Puesto | Premio |
|---|---|
| 🥇 1er puesto | A definir por la empresa |
| 🥈 2do puesto | A definir por la empresa |
| 🥉 3er puesto | A definir por la empresa |

No hay premios secundarios ni "datos de color".

---

## Páginas

### `/` — Landing
- Countdown al inicio del Mundial (11/6/2026 16:00 ART)
- Botón "Ingresar con Google"
- Si ya está logueado → redirect a `/fixture`

### `/onboarding` — Alias
- Solo para usuarios sin alias en `profiles`
- Input de alias + validación de unicidad en tiempo real
- Una vez guardado → redirect a `/fixture`
- Protegida: requiere auth

### `/fixture` — Pronósticos
- Lista de todos los partidos organizados por etapa y grupo
- Antes del deadline: inputs de goles (home/away) editables, guardado automático o con botón
- Después del deadline: vista solo lectura con resultado real al lado + puntos ganados por partido
- Indica claramente qué partidos tienen pronóstico cargado vs faltantes
- Countdown al cierre visible y prominente
- Protegida: requiere auth + alias

### `/ranking` — Tabla de posiciones
- Muestra SOLO el grupo del usuario logueado (empleados ven empleados, clientes ven clientes)
- Tabla: alias, puntos totales, partidos pronosticados, resultados exactos
- Sección de premios secundarios (stats de color)
- Se actualiza a medida que el admin carga resultados
- Protegida: requiere auth

### `/admin` — Panel administrador
- Solo accessible si `is_admin = true`
- **Tab 1**: Cargar resultados reales — lista de partidos jugados sin resultado, input home/away score + confirmar
- **Tab 2**: Asignar equipos a cruces eliminatorios — selector de equipos para cada slot
- **Tab 3** (opcional): Ver fixture de cualquier usuario — selector de usuario + vista readonly
- Protegida: requiere auth + is_admin

---

## UX

- Mobile-first (mayoría desde celular)
- Temática futbolera/mundialista, moderna
- Paleta de colores: a definir (usuario abierto a sugerencias)
- Countdown prominente al deadline
- Indicadores visuales claros: partido con pronóstico ✓ / sin pronóstico ✗
- Post-deadline: resultado real vs pronóstico del usuario, puntos ganados por partido

---

## Consideraciones de privacidad

- Pronósticos privados hasta el deadline (nadie puede ver los de otro usuario, excepto admin)
- Nombre real de Google jamás visible para otros usuarios
- Alias no cambiable (evita trampas de identidad)
- Rankings completamente separados por rol (empleados no ven clientes y viceversa)
