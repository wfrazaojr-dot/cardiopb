import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * StatusGuard — Controla o acesso às rotas protegidas.
 *
 * Fluxo (em ordem de prioridade):
 * 1. Dev / admin legado → acesso irrestrito
 * 2. Cadastro não concluído → /CadastroPerfil
 * 3. status_acesso ATIVO → permite acesso
 * 4. Qualquer outro status (PENDENTE, INATIVO, BLOQUEADO) → /AcessoPendente
 *
 * NOTA: A verificação auth_method foi removida pois o login GOV.BR já é
 * a única porta de entrada configurada na plataforma Base44, tornando
 * a checagem redundante e causando loops de logout em usuários válidos.
 */
export default function StatusGuard({ children }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30_000, // 30s — evita re-fetches desnecessários durante a navegação
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  // Acesso irrestrito para desenvolvedor e admin legado
  const isDev = user.email?.toLowerCase() === "wfrazaojr@gmail.com";
  const isAdmin = user.role === "admin";
  if (isDev || isAdmin) return <>{children}</>;

  // CENÁRIO B: Primeiro acesso — cadastro não concluído
  if (!user.cadastro_completo) {
    return <Navigate to="/CadastroPerfil" replace />;
  }

  // CENÁRIO A: Cadastro completo e acesso ATIVO — libera entrada
  if (user.status_acesso === "ATIVO") {
    return <>{children}</>;
  }

  // CENÁRIO C: Cadastrado mas PENDENTE / INATIVO / BLOQUEADO
  return <Navigate to="/AcessoPendente" replace />;
}