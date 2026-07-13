import React from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

/**
 * BoasVindas — página inicial pública exibida para usuários não autenticados.
 * Botão "GOV.BR" aciona o login do sistema (atualmente por e-mail, futuramente via GOV.BR).
 */
export default function BoasVindas() {
  const { navigateToLogin } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-10">
      {/* Coração vermelho */}
      <Heart className="w-20 h-20 mb-6 text-[#C43343]" fill="#C43343" />

      {/* Título CARDIOPB */}
      <h1 className="text-5xl font-bold tracking-tight mb-1">
        <span className="text-black">CARDIO</span>
        <span className="text-[#C43343] text-4xl">PB</span>
      </h1>

      {/* Subtítulo */}
      <p className="text-lg text-black font-light mb-10">
        Triagem e regulação médica
      </p>

      {/* Instrução */}
      <p className="text-base text-black font-medium mb-5">
        Entre com sua conta Gov.br
      </p>

      {/* Botão GOV.BR com faixa preta sobreposta */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => navigateToLogin()}
          className="bg-white border border-gray-200 rounded-lg px-14 py-4 shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <span className="text-2xl font-bold leading-none">
            <span className="text-[#1351B4]">gov</span>
            <span className="text-[#FFCD07]">.</span>
            <span className="text-[#168821]">br</span>
          </span>
        </button>

        {/* Faixa preta sobreposta na base do botão */}
        <div className="bg-black text-white text-sm font-bold uppercase tracking-wider px-8 py-2 -mt-2 rounded-b-md relative z-10">
          Link de acesso ao Gov.br
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-12 max-w-md text-center">
        Ao acessar o sistema, você concorda com os termos de uso e políticas de
        privacidade da Secretaria de Estado da Saúde da Paraíba.
      </p>
    </div>
  );
}