import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Redirecionamento automático baseado no perfil do usuário
export default function PainelInicial() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (!user || isLoading) return;

    const email = user?.email?.toLowerCase();
    const isDev = email === "wfrazaojr@gmail.com";

    // DESENVOLVEDOR: acesso total
    if (isDev || user?.role === "DESENVOLVEDOR") {
      sessionStorage.setItem("perfil_selecionado_sessao", "DESENVOLVEDOR");
      navigate(createPageUrl("Historico"), { replace: true });
      return;
    }

    // Cadastro incompleto: redirecionar para cadastro
    if (!user?.cadastro_completo) {
      navigate("/CadastroPerfil", { replace: true });
      return;
    }

    // Status de acesso bloqueado ou inativo
    if (user?.status_acesso === "BLOQUEADO" || user?.status_acesso === "INATIVO") {
      navigate("/AcessoPendente", { replace: true });
      return;
    }

    // Pendente de aprovação
    if (!user?.status_acesso || user?.status_acesso === "PENDENTE") {
      navigate("/AcessoPendente", { replace: true });
      return;
    }

    // ATIVO: redirecionar para a página correta do perfil
    if (user?.status_acesso === "ATIVO") {
      sessionStorage.setItem("perfil_selecionado_sessao", user.perfil || user.equipe);

      const perfil = user.perfil || user.equipe;
      if (perfil === "UNIDADE_SAUDE" || perfil === "unidade_saude") {
        navigate(createPageUrl("Historico"), { replace: true });
      } else if (perfil === "ADMINISTRADOR_MANAGER" || user.role === "admin") {
        navigate(createPageUrl("Dashboard"), { replace: true });
      } else {
        navigate(createPageUrl("Dashboard"), { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Redirecionando...</p>
      </div>
    </div>
  );
}