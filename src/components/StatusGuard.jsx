import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * StatusGuard — Verifica o status de cadastro do usuário autenticado.
 *
 * Fluxo:
 * 1. Dev (wfrazaojr@gmail.com) → acesso liberado
 * 2. status_acesso BLOQUEADO/INATIVO → redireciona para AcessoPendente
 * 3. cadastro_completo=true e status_acesso PENDENTE → redireciona para AcessoPendente
 * 4. Sem perfil e role='user' (primeira vez) → redireciona para CadastroPerfil
 * 5. Demais usuários (com perfil/role definido) → acesso liberado
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

  // Bypass para desenvolvedor
  const isDev = user.email?.toLowerCase() === "wfrazaojr@gmail.com";
  if (isDev) return <>{children}</>;

  // Usuário bloqueado ou inativo → tela de acesso pendente
  if (user.status_acesso === "BLOQUEADO" || user.status_acesso === "INATIVO") {
    return <Navigate to="/AcessoPendente" replace />;
  }

  // Cadastro enviado, aguardando aprovação → tela de acesso pendente
  if (user.cadastro_completo === true && user.status_acesso === "PENDENTE") {
    return <Navigate to="/AcessoPendente" replace />;
  }

  // Primeira vez: sem perfil definido e role ainda é 'user' → formulário de cadastro
  const temPerfil = user.perfil || user.equipe;
  const temRoleReal = user.role && user.role !== "user";
  if (!temPerfil && !temRoleReal) {
    return <Navigate to="/CadastroPerfil" replace />;
  }

  // Usuário com perfil/role definido → acesso liberado
  return <>{children}</>;
}