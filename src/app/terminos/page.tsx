import Link from "next/link";

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-[#0a0614] text-white px-4 py-8">
      <div className="max-w-sm mx-auto flex flex-col gap-6">

        <div>
          <Link href="/fixture" className="text-[#4c2a8a] text-xs">← Volver</Link>
          <h1 className="text-2xl font-black mt-2">Términos y Condiciones</h1>
          <p className="text-[#9b6ee0] text-xs mt-1">Prode Tarifar · Mundial 2026</p>
        </div>

        <div className="flex flex-col gap-4 text-sm text-slate-300 leading-relaxed">

          <section className="flex flex-col gap-2">
            <h2 className="text-white font-bold">1. Participación</h2>
            <p>
              El Prode Tarifar Mundial 2026 es una actividad recreativa organizada por Tarifar
              destinada a empleados y clientes. La participación es voluntaria y gratuita.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-white font-bold">2. Registro y alias</h2>
            <p>
              Cada participante debe registrarse con su cuenta de Google y elegir un alias único.
              El alias no puede modificarse una vez elegido y es el nombre que aparece en el ranking.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-white font-bold">3. Pronósticos</h2>
            <p>
              Los pronósticos de la fase de grupos deben cargarse antes del inicio del primer
              partido (11 de junio de 2026). En fases eliminatorias, el cierre es al inicio
              del primer partido de cada fase.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-white font-bold">4. Tabla Rezagados</h2>
            <p>
              Los participantes que se registren después del inicio del torneo competirán en
              una tabla separada denominada "Rezagados". Solo podrán cargar pronósticos desde
              la Ronda de 32 en adelante.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-white font-bold">5. Sistema de puntos</h2>
            <p>
              Ver el detalle del sistema de puntos y criterios de desempate en la sección{" "}
              <Link href="/reglas" className="text-[#9b6ee0] underline underline-offset-2">Reglas</Link>.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-white font-bold">6. Premios</h2>
            <p>
              Los premios son definidos por Tarifar y comunicados oportunamente. Tarifar se
              reserva el derecho de modificar o cancelar los premios en cualquier momento.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-white font-bold">7. Privacidad</h2>
            <p>
              Los datos de registro (email y nombre de Google) son utilizados únicamente para
              autenticación. El alias es el único dato visible para otros participantes.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-white font-bold">8. Modificaciones</h2>
            <p>
              Tarifar se reserva el derecho de modificar estas condiciones en cualquier momento.
              El uso continuado de la aplicación implica la aceptación de los cambios.
            </p>
          </section>

        </div>

        <p className="text-slate-500 text-xs text-center pb-8">
          Tarifar · {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
