import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Send, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MOTIVOS = [
  { value: "Sem garantia de transporte", label: "Sem garantia de transporte" },
  { value: "Melhora do quadro de Instabilidade para transporte", label: "Melhora do quadro de Instabilidade para transporte (quando o Transporte foi contraindicado pelo sistema)" },
  { value: "Outro", label: "Outro" },
];

export default function SolicitarReavaliacao({ paciente, user }) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [detalhesOutros, setDetalhesOutros] = useState("");
  const [salvando, setSalvando] = useState(false);
  const queryClient = useQueryClient();

  const solicitacaoPendente = paciente.solicitacao_reavaliacao?.status === "pendente";

  const handleSolicitar = async () => {
    if (!motivo) {
      alert("Selecione um motivo para a reavaliação.");
      return;
    }
    if (motivo === "Outro" && !detalhesOutros.trim()) {
      alert("Descreva o motivo da reavaliação.");
      return;
    }

    setSalvando(true);
    try {
      const solicitacao = {
        data_hora: new Date().toISOString(),
        medico_nome: user?.full_name || user?.email,
        medico_email: user?.email,
        unidade_saude: paciente.unidade_saude,
        motivo: motivo,
        detalhes_outros: motivo === "Outro" ? detalhesOutros : "",
        status: "pendente",
        status_anterior: paciente.status || "Aguardando Transporte",
      };

      await base44.entities.Paciente.update(paciente.id, {
        solicitacao_reavaliacao: solicitacao,
        status: "Reavaliação de Conduta",
      });

      queryClient.invalidateQueries(["paciente", paciente.id]);
      queryClient.invalidateQueries(["pacientes"]);
      queryClient.invalidateQueries(["pacientes-regulacao"]);

      alert("Solicitação de reavaliação enviada com sucesso. A CERH e a ASSCARDIO foram notificadas.");
      setOpen(false);
      setMotivo("");
      setDetalhesOutros("");
    } catch (e) {
      alert("Erro ao enviar solicitação: " + e.message);
    } finally {
      setSalvando(false);
    }
  };

  // Se já existe solicitação pendente, mostrar o status
  if (solicitacaoPendente) {
    const sol = paciente.solicitacao_reavaliacao;
    return (
      <Card className="border-2 border-orange-400 bg-orange-50">
        <CardHeader className="bg-orange-100 pb-2">
          <CardTitle className="text-orange-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Reavaliação de Conduta Solicitada
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-2 text-sm">
          <div>
            <span className="font-semibold text-orange-900">Solicitado em:</span>{" "}
            {sol.data_hora ? format(new Date(sol.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—"}
          </div>
          <div>
            <span className="font-semibold text-orange-900">Por:</span> {sol.medico_nome}
          </div>
          <div>
            <span className="font-semibold text-orange-900">Motivo:</span> {sol.motivo}
          </div>
          {sol.detalhes_outros && (
            <div>
              <span className="font-semibold text-orange-900">Detalhes:</span> {sol.detalhes_outros}
            </div>
          )}
          <div className="bg-orange-100 border border-orange-300 rounded p-2 mt-2">
            <p className="text-xs text-orange-800 font-medium">
              ⏳ Aguardando parecer retificado da CERH ou ASSCARDIO.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Não mostrar botão se o paciente ainda está em triagem (antes da regulação)
  const statusPermiteReavaliacao = [
    "Aguardando Transporte",
    "Em Transporte",
    "Aguardando Hemodinâmica",
    "Aguardando Regulação",
    "Aguardando Assessoria",
  ].includes(paciente.status);

  if (!statusPermiteReavaliacao) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-50">
          <RotateCcw className="w-4 h-4 mr-2" />
          Solicitar Reavaliação de Conduta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-5 h-5" />
            Solicitar Reavaliação de Conduta
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-800">
            <p className="font-semibold">Paciente:</p>
            <p>{paciente.nome_completo}</p>
            <p className="text-xs mt-1">Status atual: {paciente.status}</p>
          </div>

          <div>
            <Label className="font-semibold text-base">Motivo da Reavaliação *</Label>
            <p className="text-xs text-gray-500 mb-3">
              Selecione o motivo que justifica a necessidade de um novo parecer da CERH ou ASSCARDIO.
            </p>
            <RadioGroup value={motivo} onValueChange={setMotivo} className="space-y-2">
              {MOTIVOS.map((m) => (
                <div key={m.value} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                  <RadioGroupItem value={m.value} id={`motivo-${m.value}`} className="mt-1" />
                  <Label htmlFor={`motivo-${m.value}`} className="text-sm cursor-pointer font-normal">
                    {m.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {motivo === "Outro" && (
            <div>
              <Label className="font-semibold">Descreva o motivo *</Label>
              <Textarea
                value={detalhesOutros}
                onChange={(e) => setDetalhesOutros(e.target.value)}
                placeholder="Descreva detalhadamente o motivo da reavaliação..."
                rows={3}
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
            <p className="font-semibold">ℹ️ Como funciona:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Sua solicitação será enviada formalmente à CERH e à ASSCARDIO</li>
              <li>O paciente entrará em status "Reavaliação de Conduta"</li>
              <li>O médico regulador ou cardiologista emitirá um Parecer Retificado</li>
              <li>Você será notificado quando o novo parecer estiver disponível</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSolicitar}
            disabled={salvando || !motivo}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {salvando ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}