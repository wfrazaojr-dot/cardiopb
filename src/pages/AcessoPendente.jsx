import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Clock, LogOut, CheckCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AcessoPendente() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const statusMsg = {
    PENDENTE: {
      icon: <Clock className="w-16 h-16 text-yellow-500" />,
      title: "Cadastro em Análise",
      desc: "Seu cadastro foi enviado com sucesso e está aguardando aprovação do Administrador Manager. Você receberá acesso assim que for aprovado.",
      color: "border-yellow-400 bg-yellow-50",
    },
    INATIVO: {
      icon: <Clock className="w-16 h-16 text-gray-400" />,
      title: "Acesso Desativado",
      desc: "Seu acesso está temporariamente desativado. Entre em contato com o Administrador Manager para mais informações.",
      color: "border-gray-400 bg-gray-50",
    },
    BLOQUEADO: {
      icon: <Clock className="w-16 h-16 text-red-500" />,
      title: "Acesso Bloqueado",
      desc: "Seu acesso foi bloqueado. Entre em contato com o Administrador Manager para esclarecimentos.",
      color: "border-red-400 bg-red-50",
    },
  };

  const status = user?.status_acesso || "PENDENTE";
  const info = statusMsg[status] || statusMsg["PENDENTE"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logos */}
        <div className="flex justify-center gap-6 mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fa0edee56f5a67f929da76/fa5f3a17e_LOGOCORAAOPARAIBANO.png"
            alt="Coração Paraibano"
            className="h-14 w-auto object-contain"
          />
        </div>

        <Card className={`border-2 ${info.color} shadow-xl`}>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-4">{info.icon}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{info.title}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{info.desc}</p>

            {user && (
              <div className="bg-white rounded-lg p-4 mb-6 text-left border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Dados do seu cadastro:</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Nome:</span> {user.full_name}</p>
                  <p><span className="font-medium">E-mail:</span> {user.email}</p>
                  {user.cpf && <p><span className="font-medium">CPF:</span> {user.cpf}</p>}
                  {user.perfil && <p><span className="font-medium">Perfil:</span> {user.perfil?.replace(/_/g, " ")}</p>}
                  {user.funcao && <p><span className="font-medium">Função:</span> {user.funcao?.replace(/_/g, " ")}</p>}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">Contato do Administrador</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Em caso de dúvidas, entre em contato com o Administrador Manager do sistema.
              </p>
            </div>

            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => base44.auth.logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair do Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}