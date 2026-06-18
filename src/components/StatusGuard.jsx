import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * StatusGuard — Acesso temporário simplificado.
 *
 * Enquanto a nova forma de acesso (via equipe técnica do Estado) não é definida,
 * qualquer usuário autenticado por e-mail tem acesso liberado — sem cadastro
 * e sem aprovação administrativa.
 */
export default function StatusGuard({ children }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  // Acesso liberado para todo usuário autenticado
  return <>{children}</>;
}