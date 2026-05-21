import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/admin/dashboard",     label: "Dashboard"     },
  { href: "/admin/resultados",    label: "Resultados"    },
  { href: "/admin/eliminatorias", label: "Eliminatorias" },
  { href: "/admin/usuarios",      label: "Usuarios"      },
  { href: "/admin/emails",        label: "Emails"        },
  { href: "/admin/ranking",       label: "Ranking"       },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/fixture");

  return (
    <div className="min-h-screen bg-[#0a0614] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-[#0a0614]/95 backdrop-blur-sm border-b border-[#1e0e42]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-bold text-[#4c2a8a] uppercase tracking-widest">
            Admin Panel
          </span>
          <Link href="/fixture" className="text-[#4c2a8a] text-xs hover:text-[#9b6ee0] transition-colors">
            Volver a la app
          </Link>
        </div>
        {/* Nav tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {NAV.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} />
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

// Client component para active state
import AdminNavLink from "./AdminNavLink";
function NavLink({ href, label }: { href: string; label: string }) {
  return <AdminNavLink href={href} label={label} />;
}
