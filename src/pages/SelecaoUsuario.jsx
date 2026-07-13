import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { UserPlus, LogIn } from "lucide-react";

export default function SelecaoUsuario() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const handleUsuarioNovo = () => {
    navigate("/CadastroPerfil");
  };

  const handleUsuarioCadastrado = () => {
    if (user?.status_acesso === "ATIVO" && (user?.perfil || user?.equipe)) {
      navigate("/");
    } else {
      navigate("/AcessoPendente");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex flex-col items-center justify-center px-6 py-10">
      <img
        src="https://media.base44.com/images/public/68fa0edee56f5a67f929da76/d2078127c_LOGOCARDIOPB.jpg"
        alt="CARDIOPB"
        className="h-20 w-auto mb-8 object-contain"
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao CARDIOPB</h1>
      <p className="text-gray-600 mb-10 text-center max-w-md">
        Selecione uma das opções abaixo para continuar.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={handleUsuarioNovo}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center gap-3"
        >
          <UserPlus className="w-10 h-10" />
          <span className="font-bold text-lg">USUÁRIO NOVO</span>
          <span className="text-sm text-red-100">Primeiro acesso ao sistema</span>
        </button>
        <button
          onClick={handleUsuarioCadastrado}
          className="flex-1 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center gap-3"
        >
          <LogIn className="w-10 h-10" />
          <span className="font-bold text-lg">USUÁRIO CADASTRADO</span>
          <span className="text-sm text-gray-500">Já possui acesso aprovado</span>
        </button>
      </div>
    </div>
  );
}