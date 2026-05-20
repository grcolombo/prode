"use client";

import { useState } from "react";
import { addEmployeeEmail, deleteEmployeeEmail } from "../actions";

export default function EmailsClient({ emails }: { emails: string[] }) {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!newEmail.trim()) return;
    setLoading(true);
    setError("");
    try {
      await addEmployeeEmail(newEmail.trim());
      setNewEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(email: string) {
    setDeletingEmail(email);
    try {
      await deleteEmployeeEmail(email);
    } finally {
      setDeletingEmail(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-black">Emails de empleados</h1>
        <p className="text-[#4c2a8a] text-xs mt-1">
          Los usuarios que ingresen con estos emails serán clasificados como empleados.
        </p>
      </div>

      {/* Agregar */}
      <div className="flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="nuevo@ejemplo.com"
          disabled={loading}
          className="flex-1 bg-[#110828] border border-[#2d1a5e] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#6b3db8] disabled:opacity-50"
        />
        <button
          onClick={handleAdd}
          disabled={loading || !newEmail.trim()}
          className="px-4 py-2 bg-[#6b3db8] text-white rounded-xl text-sm font-bold hover:bg-[#7d4ed4] transition-colors disabled:opacity-40"
        >
          {loading ? "..." : "Agregar"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs -mt-4">{error}</p>}

      {/* Lista */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] text-[#4c2a8a] font-bold uppercase tracking-wider mb-1">
          {emails.length} emails registrados
        </p>
        {emails.length === 0 ? (
          <p className="text-[#2d1a5e] text-sm text-center py-8">Sin emails cargados</p>
        ) : (
          emails.map(email => (
            <div
              key={email}
              className="flex items-center justify-between bg-[#110828] border border-[#1e0e42] rounded-xl px-4 py-2.5"
            >
              <span className="text-sm text-[#d4c0f0]">{email}</span>
              <button
                onClick={() => handleDelete(email)}
                disabled={deletingEmail === email}
                className="text-[#4c2a8a] hover:text-red-400 text-xs font-bold transition-colors disabled:opacity-40 ml-4"
              >
                {deletingEmail === email ? "..." : "Eliminar"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
