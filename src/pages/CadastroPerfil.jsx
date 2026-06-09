import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, ClipboardList, CheckCircle2 } from "lucide-react";

const PERFIS_OPCOES = [
  { value: "UNIDADE_SAUDE", label: "Unidade de Saúde" },
  { value: "CERH", label: "CERH - Central Estadual de Regulação em Hemodinâmica" },
  { value: "ASSCARDIO", label: "ASSCARDIO - Assessoria Cardiológica" },
  { value: "TRANSPORTE", label: "Transporte" },
  { value: "HEMODINAMICA", label: "Hemodinâmica" },
  { value: "ADMINISTRADOR_MANAGER", label: "Administrador Manager" },
  { value: "ADMINISTRADOR_CERH", label: "Administrador CERH" },
  { value: "ADMINISTRADOR_CARDIOLOGIA", label: "Administrador Cardiologia" },
  { value: "ADMINISTRADOR_TRANSPORTE", label: "Administrador Transporte" },
];

const FUNCOES_POR_PERFIL = {
  UNIDADE_SAUDE: ["medico", "enfermeiro", "assistente_social", "administrativo"],
  CERH: ["medico", "enfermeiro"],
  ASSCARDIO: ["medico", "enfermeiro"],
  TRANSPORTE: ["operador_frota", "enfermeiro", "medico"],
  HEMODINAMICA: ["medico", "enfermeiro"],
  ADMINISTRADOR_MANAGER: ["administrativo"],
  ADMINISTRADOR_CERH: ["medico", "enfermeiro"],
  ADMINISTRADOR_CARDIOLOGIA: ["medico"],
  ADMINISTRADOR_TRANSPORTE: ["operador_frota", "administrativo"],
};

const FUNCAO_LABELS = {
  medico: "Médico",
  enfermeiro: "Enfermeiro",
  assistente_social: "Assistente Social",
  operador_frota: "Operador de Frota",
  administrativo: "Administrativo",
};

const REGISTRO_TIPO_MAP = {
  medico: "CRM",
  enfermeiro: "COREN",
  assistente_social: "CRESS",
};

const EQUIPE_MAP = {
  UNIDADE_SAUDE: "unidade_saude",
  CERH: "cerh",
  ASSCARDIO: "asscardio",
  TRANSPORTE: "transporte",
  HEMODINAMICA: "hemodinamica",
  ADMINISTRADOR_MANAGER: "admin",
  ADMINISTRADOR_CERH: "cerh",
  ADMINISTRADOR_CARDIOLOGIA: "asscardio",
  ADMINISTRADOR_TRANSPORTE: "transporte",
};

function formatCPF(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * CadastroPerfil — funciona em dois modos:
 *
 * 1. Modo normal (modoSolicitacao=false, padrão):
 *    Usuário já está registrado no app mas não completou o cadastro.
 *    Usa base44.auth.updateMe() para salvar dados.
 *
 * 2. modoSolicitacao=true:
 *    Usuário autenticou via GOV.BR mas NÃO está registrado no app ainda.
 *    Chama a função backend `registrarSolicitacaoAcesso` que cria o registro
 *    na entidade SolicitacaoAcesso e notifica os admins.
 *    Após envio, exibe tela de aguardo (sem redirect que causa loop).
 */
export default function CadastroPerfil({ modoSolicitacao = false }) {
  const navigate = useNavigate();

  // Só busca usuário se estiver no modo normal
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const [form, setForm] = useState({
    perfil: "",
    nome_completo: "",
    email: "",
    cpf: "",
    funcao: "",
    registro_numero: "",
    matricula: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  // Pré-preencher com dados do GOV.BR
  useEffect(() => {
    if (user?.email) {
      setForm(prev => ({
        ...prev,
        email: prev.email || user.email,
        nome_completo: prev.nome_completo || user.full_name || "",
      }));
    }
  }, [user]);

  // Modo normal: redirecionar se não autenticado ou se já tem cadastro
  useEffect(() => {
    if (modoSolicitacao) return;
    if (!isLoading && !user) {
      base44.auth.redirectToLogin(window.location.href);
    }
    if (!isLoading && user?.cadastro_completo) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, navigate, modoSolicitacao]);

  if (!modoSolicitacao && (isLoading || !user)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const funcoesDoPerfil = form.perfil ? FUNCOES_POR_PERFIL[form.perfil] || [] : [];
  const precisaRegistro = ["medico", "enfermeiro", "assistente_social"].includes(form.funcao);
  const precisaMatricula = ["operador_frota", "administrativo"].includes(form.funcao);
  const emailExibido = form.email || user?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.perfil || !form.nome_completo || !form.cpf || !form.funcao) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    if (!emailExibido) {
      setErro("Não foi possível identificar seu e-mail. Faça login pelo GOV.BR novamente.");
      return;
    }
    if (precisaRegistro && !form.registro_numero) {
      setErro("Informe o número do registro profissional.");
      return;
    }
    if (precisaMatricula && !form.matricula) {
      setErro("Informe a matrícula.");
      return;
    }

    setLoading(true);

    if (modoSolicitacao) {
      // Usuário não está no app → chamar backend para criar SolicitacaoAcesso e notificar admins
      const response = await base44.functions.invoke("registrarSolicitacaoAcesso", {
        email: emailExibido,
        nome_completo: form.nome_completo,
        cpf: form.cpf,
        telefone: form.telefone || null,
        perfil: form.perfil,
        funcao: form.funcao,
        registro_profissional_tipo: precisaRegistro ? REGISTRO_TIPO_MAP[form.funcao] : null,
        registro_profissional_numero: precisaRegistro ? form.registro_numero : null,
        matricula: precisaMatricula ? form.matricula : null,
      });
      setLoading(false);
      if (response?.data?.success) {
        setSucesso(true);
      } else {
        setErro(response?.data?.error || "Erro ao registrar solicitação. Tente novamente.");
      }
    } else {
      // Usuário já está no app → salvar perfil via updateMe
      await base44.auth.updateMe({
        nome_completo: form.nome_completo,
        email_cadastro: form.email || emailExibido,
        cpf: form.cpf,
        telefone: form.telefone || null,
        perfil: form.perfil,
        funcao: form.funcao,
        equipe: EQUIPE_MAP[form.perfil] || "unidade_saude",
        registro_profissional_tipo: precisaRegistro ? REGISTRO_TIPO_MAP[form.funcao] : null,
        registro_profissional_numero: precisaRegistro ? form.registro_numero : null,
        matricula: precisaMatricula ? form.matricula : null,
        status_acesso: "PENDENTE",
        auth_method: "GOVBR",
        cadastro_completo: true,
      });
      sessionStorage.setItem("perfil_selecionado_sessao", form.perfil);
      setLoading(false);
      navigate("/AcessoPendente");
    }
  };

  // Tela de sucesso para modoSolicitacao
  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <CardContent className="pt-10 pb-10 space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Solicitação Enviada!</h2>
            <p className="text-gray-600">
              Sua solicitação de acesso foi registrada com sucesso.<br />
              O Administrador Manager receberá uma notificação e analisará seu pedido.<br />
              <strong>Você receberá um e-mail quando seu acesso for aprovado.</strong>
            </p>
            <p className="text-sm text-blue-700 font-medium bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
              {emailExibido}
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Você pode fechar esta página. Quando aprovado, acesse novamente pelo link do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="text-center border-b pb-6">
          <div className="flex justify-center gap-4 mb-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fa0edee56f5a67f929da76/fa5f3a17e_LOGOCORAAOPARAIBANO.png"
              alt="Coração Paraibano"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="flex justify-center mb-2">
            <div className="bg-red-600 p-3 rounded-full">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">
            {modoSolicitacao ? "Solicitar Acesso" : "Cadastro Complementar"}
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Preencha seus dados para solicitar acesso ao Sistema Coração Paraibano.<br />
            Após o envio, o Administrador Manager analisará seu pedido.<br />
            <span className="text-blue-700 font-medium">Você receberá um e-mail quando seu acesso for liberado.</span>
          </CardDescription>
          {emailExibido && (
            <div className="mt-3 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
              <User className="inline w-4 h-4 mr-1" />
              ✅ Autenticado via GOV.BR: <strong>{emailExibido}</strong>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input
                className="mt-1"
                placeholder="Digite seu nome completo"
                value={form.nome_completo}
                onChange={e => setForm({ ...form, nome_completo: e.target.value })}
              />
            </div>

            <div>
              <Label>CPF *</Label>
              <Input
                className="mt-1"
                placeholder="123.456.789-00"
                maxLength={14}
                value={form.cpf}
                onChange={e => setForm({ ...form, cpf: formatCPF(e.target.value) })}
              />
            </div>

            <div>
              <Label>Telefone / WhatsApp</Label>
              <Input
                className="mt-1"
                placeholder="(83) 9 9999-9999"
                value={form.telefone}
                onChange={e => setForm({ ...form, telefone: e.target.value })}
              />
            </div>

            <div>
              <Label>Perfil de Acesso *</Label>
              <Select value={form.perfil} onValueChange={v => setForm({ ...form, perfil: v, funcao: "" })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione seu perfil" />
                </SelectTrigger>
                <SelectContent>
                  {PERFIS_OPCOES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.perfil && (
              <div>
                <Label>Função *</Label>
                <Select value={form.funcao} onValueChange={v => setForm({ ...form, funcao: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione sua função" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcoesDoPerfil.map(f => (
                      <SelectItem key={f} value={f}>{FUNCAO_LABELS[f]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {precisaRegistro && (
              <div>
                <Label>{REGISTRO_TIPO_MAP[form.funcao]} *</Label>
                <Input
                  className="mt-1"
                  placeholder={`Número do ${REGISTRO_TIPO_MAP[form.funcao]}`}
                  value={form.registro_numero}
                  onChange={e => setForm({ ...form, registro_numero: e.target.value })}
                />
              </div>
            )}

            {precisaMatricula && (
              <div>
                <Label>Matrícula *</Label>
                <Input
                  className="mt-1"
                  placeholder="Número da matrícula"
                  value={form.matricula}
                  onChange={e => setForm({ ...form, matricula: e.target.value })}
                />
              </div>
            )}

            {erro && (
              <p className="text-sm text-red-600 bg-red-50 rounded p-3">{erro}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Solicitação de Acesso"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}