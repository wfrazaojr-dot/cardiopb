import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileEdit, History, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ParecerRetificado({ paciente, user, equipe }) {
  const [novoParecer, setNovoParecer] = useState("");
  const [novaConduta, setNovaConduta] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const queryClient = useQueryClient();

  const solicitacaoPendente = paciente.solicitacao_reavaliacao?.status === "pendente";
  const historicoPareceres = paciente.historico_pareceres || [];

  // Conduta/parecer atual (última versão)
  const parecerAtualASSCARDIO = paciente.assessoria_cardiologia?.parecer_cardiologista || "";
  const condutaAtualCERH = paciente.regulacao_central?.conduta_final || "";
  const estrategiaAtual = paciente.assessoria_cardiologia?.diagnostico_estrategia || "";

  // Equipe responsável por esta view: 'asscardio' ou 'cerh'
  const isASSCARDIO = equipe === "asscardio";
  const isCERH = equipe === "cerh";

  const handleEmitirParecer = async () => {
    if (!novoParecer.trim()) {
      alert("Descreva o novo parecer.");
      return;
    }
    if (!novaConduta.trim()) {
      alert("Descreva a nova conduta.");
      return;
    }

    setSalvando(true);
    try {
      // Capturar parecer anterior (da equipe correspondente)
      const parecerAnterior = isASSCARDIO
        ? parecerAtualASSCARDIO
        : condutaAtualCERH;

      const condutaAnterior = isASSCARDIO
        ? estrategiaAtual
        : condutaAtualCERH;

      const novaEntrada = {
        data_hora: new Date().toISOString(),
        usuario_nome: user?.full_name || user?.email,
        usuario_email: user?.email,
        usuario_equipe: equipe,
        motivo_retificacao: paciente.solicitacao_reavaliacao?.motivo || "Reavaliação solicitada",
        detalhes_outros: paciente.solicitacao_reavaliacao?.detalhes_outros || "",
        parecer_anterior: parecerAnterior,
        parecer_novo: novoParecer,
        conduta_anterior: condutaAnterior,
        conduta_nova: novaConduta,
      };

      const historicoAtualizado = [...historicoPareceres, novaEntrada];

      // Preparar update do paciente
      const updateData = {
        historico_pareceres: historicoAtualizado,
        solicitacao_reavaliacao: {
          ...paciente.solicitacao_reavaliacao,
          status: "atendida",
          atendido_por: user?.full_name || user?.email,
          atendido_em: new Date().toISOString(),
        },
      };

      // Atualizar o campo correspondente da equipe
      if (isASSCARDIO) {
        updateData.assessoria_cardiologia = {
          ...paciente.assessoria_cardiologia,
          parecer_cardiologista: novoParecer,
          data_hora: new Date().toISOString(),
        };
      } else if (isCERH) {
        updateData.regulacao_central = {
          ...paciente.regulacao_central,
          conduta_final: novaConduta,
          data_hora: new Date().toISOString(),
        };
      }

      // Restaurar status anterior (ou manter aguardando transporte se era o caso)
      const statusAnterior = paciente.solicitacao_reavaliacao?.status_anterior || "Aguardando Transporte";
      updateData.status = statusAnterior;

      await base44.entities.Paciente.update(paciente.id, updateData);

      // Invalidar queries para atualizar a UI
      queryClient.invalidateQueries(["paciente", paciente.id]);
      queryClient.invalidateQueries(["pacientes"]);
      queryClient.invalidateQueries(["pacientes-regulacao"]);

      alert("Parecer Retificado emitido com sucesso! A unidade de saúde foi notificada.");
      setNovoParecer("");
      setNovaConduta("");
      setMostrarForm(false);
    } catch (e) {
      alert("Erro ao emitir parecer: " + e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alerta de Solicitação Pendente */}
      {solicitacaoPendente && (
        <Card className="border-2 border-orange-500 bg-orange-50 shadow-lg">
          <CardHeader className="bg-orange-100 pb-2">
            <CardTitle className="text-orange-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              ⚠️ Solicitação de Reavaliação de Conduta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            <div className="bg-white rounded-lg border border-orange-200 p-3 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold text-orange-900">Solicitado em:</span>
                  <p>{paciente.solicitacao_reavaliacao.data_hora ? format(new Date(paciente.solicitacao_reavaliacao.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—"}</p>
                </div>
                <div>
                  <span className="font-semibold text-orange-900">Solicitante:</span>
                  <p>{paciente.solicitacao_reavaliacao.medico_nome}</p>
                </div>
              </div>
              <div>
                <span className="font-semibold text-orange-900">Motivo:</span>
                <p className="bg-orange-50 p-2 rounded mt-1">{paciente.solicitacao_reavaliacao.motivo}</p>
              </div>
              {paciente.solicitacao_reavaliacao.detalhes_outros && (
                <div>
                  <span className="font-semibold text-orange-900">Detalhes:</span>
                  <p className="bg-orange-50 p-2 rounded mt-1">{paciente.solicitacao_reavaliacao.detalhes_outros}</p>
                </div>
              )}
            </div>

            {/* Parecer/Conduta atual (que será retificado) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-semibold text-blue-900 mb-1">
                {isASSCARDIO ? "Parecer atual da ASSCARDIO:" : "Conduta atual da CERH:"}
              </p>
              <p className="text-blue-800 whitespace-pre-wrap">
                {isASSCARDIO ? (parecerAtualASSCARDIO || "Não há parecer anterior.") : (condutaAtualCERH || "Não há conduta anterior.")}
              </p>
              {isASSCARDIO && estrategiaAtual && (
                <p className="text-blue-700 text-xs mt-1">Estratégia: {estrategiaAtual}</p>
              )}
            </div>

            {!mostrarForm ? (
              <Button
                onClick={() => setMostrarForm(true)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <FileEdit className="w-4 h-4 mr-2" />
                Emitir Parecer Retificado
              </Button>
            ) : (
              <div className="space-y-4 bg-white p-4 rounded-lg border-2 border-orange-200">
                <div>
                  <Label className="font-semibold text-base">
                    {isASSCARDIO ? "Novo Parecer Cardiológico *" : "Nova Conduta de Regulação *"}
                  </Label>
                  <Textarea
                    value={isASSCARDIO ? novoParecer : novaConduta}
                    onChange={(e) => isASSCARDIO ? setNovoParecer(e.target.value) : setNovaConduta(e.target.value)}
                    placeholder={isASSCARDIO ? "Descreva o novo parecer cardiológico retificado..." : "Descreva a nova conduta de regulação retificada..."}
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-semibold text-base">
                    {isASSCARDIO ? "Nova Conduta/Estratégia *" : "Justificativa Técnica *"}
                  </Label>
                  <Textarea
                    value={isASSCARDIO ? novaConduta : novoParecer}
                    onChange={(e) => isASSCARDIO ? setNovaConduta(e.target.value) : setNovoParecer(e.target.value)}
                    placeholder={isASSCARDIO ? "Descreva a nova estratégia/conduta..." : "Justifique tecnicamente a alteração de conduta..."}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setMostrarForm(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleEmitirParecer}
                    disabled={salvando}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {salvando ? "Emitindo..." : "Confirmar Parecer Retificado"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Histórico de Pareceres Retificados */}
      {historicoPareceres.length > 0 && (
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="bg-teal-50 pb-2">
            <CardTitle className="text-teal-900 flex items-center gap-2 text-base">
              <History className="w-5 h-5" />
              Histórico de Pareceres e Retificações ({historicoPareceres.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3">
              {[...historicoPareceres].reverse().map((p, idx) => (
                <div key={idx} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={
                        p.usuario_equipe === "asscardio" ? "bg-red-100 text-red-800" : "bg-indigo-100 text-indigo-800"
                      }>
                        {p.usuario_equipe === "asscardio" ? "ASSCARDIO" : "CERH"}
                      </Badge>
                      <span className="text-sm font-semibold">{p.usuario_nome}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {p.data_hora ? format(new Date(p.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—"}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-500 font-medium">Motivo:</span>{" "}
                      <span className="text-orange-700">{p.motivo_retificacao}</span>
                      {p.detalhes_outros && <span className="text-gray-600"> — {p.detalhes_outros}</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs font-semibold text-gray-500">Parecer anterior:</p>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{p.parecer_anterior || "—"}</p>
                      </div>
                      <div className="bg-teal-50 rounded p-2 border border-teal-200">
                        <p className="text-xs font-semibold text-teal-700">Novo parecer:</p>
                        <p className="text-xs text-teal-900 whitespace-pre-wrap font-medium">{p.parecer_novo || "—"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs font-semibold text-gray-500">Conduta anterior:</p>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{p.conduta_anterior || "—"}</p>
                      </div>
                      <div className="bg-teal-50 rounded p-2 border border-teal-200">
                        <p className="text-xs font-semibold text-teal-700">Nova conduta:</p>
                        <p className="text-xs text-teal-900 whitespace-pre-wrap font-medium">{p.conduta_nova || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}