import React from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";

// Função auxiliar para texto justificado no jsPDF
function textJustified(doc, text, x, y, maxWidth, lineHeight = 5) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line, i) => {
    const isLast = i === lines.length - 1;
    if (isLast || line.trim() === "") {
      doc.text(line, x, y + i * lineHeight);
    } else {
      const words = line.trim().split(" ").filter(w => w !== "");
      if (words.length <= 1) {
        doc.text(line, x, y + i * lineHeight);
      } else {
        const totalWordsWidth = words.reduce((sum, w) => sum + doc.getTextWidth(w), 0);
        const totalSpace = maxWidth - totalWordsWidth;
        const spacePerGap = totalSpace / (words.length - 1);
        let curX = x;
        words.forEach((word, wi) => {
          doc.text(word, curX, y + i * lineHeight);
          curX += doc.getTextWidth(word) + spacePerGap;
        });
      }
    }
  });
  return y + lines.length * lineHeight;
}

export default function ApresentacaoCARDIOPB() {
  const gerarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const textWidth = pageWidth - margin * 2;
    const lh = 5.5; // line height
    let y = 0;

    const addPage = () => {
      doc.addPage();
      y = 20;
      rodapeAtual();
    };

    const checkPage = (needed = 20) => {
      if (y + needed > pageHeight - 18) addPage();
    };

    const titulo = (texto) => {
      checkPage(14);
      doc.setFillColor(220, 38, 38);
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(255, 255, 255);
      doc.rect(margin, y - 5, textWidth, 8, "F");
      doc.text(texto, margin + 2, y);
      doc.setTextColor(0, 0, 0);
      y += 8;
    };

    const subtitulo = (texto) => {
      checkPage(10);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.setTextColor(50, 50, 50);
      doc.text(texto, margin, y);
      y += 6;
    };

    const paragrafo = (texto) => {
      checkPage(10);
      doc.setFontSize(9.5);
      doc.setFont(undefined, "normal");
      doc.setTextColor(40, 40, 40);
      const lines = doc.splitTextToSize(texto, textWidth);
      lines.forEach((line, i) => {
        checkPage(lh + 1);
        const isLast = i === lines.length - 1;
        if (isLast || line.trim() === "") {
          doc.text(line, margin, y);
        } else {
          const words = line.trim().split(" ").filter(w => w !== "");
          if (words.length <= 1) {
            doc.text(line, margin, y);
          } else {
            const totalWordsWidth = words.reduce((s, w) => s + doc.getTextWidth(w), 0);
            const gap = (textWidth - totalWordsWidth) / (words.length - 1);
            let cx = margin;
            words.forEach(w => { doc.text(w, cx, y); cx += doc.getTextWidth(w) + gap; });
          }
        }
        y += lh;
      });
      y += 2;
    };

    const bullet = (texto) => {
      checkPage(8);
      doc.setFontSize(9.5);
      doc.setFont(undefined, "normal");
      doc.setTextColor(40, 40, 40);
      const linhas = doc.splitTextToSize(texto, textWidth - 6);
      doc.text("•", margin, y);
      linhas.forEach((l, i) => { doc.text(l, margin + 4, y + i * lh); });
      y += linhas.length * lh + 1;
    };

    const espaco = (n = 4) => { y += n; };

    let paginaAtual = 1;
    const rodapeAtual = () => {
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text(`CARDIOPB — Apresentação Institucional  |  Página ${paginaAtual} de 5`, margin, pageHeight - 8);
      doc.text("Walber A. Frazão Jr. — COREN 110.238", pageWidth - margin, pageHeight - 8, { align: "right" });
      paginaAtual++;
    };

    // ═══════════════════════════════════════════
    // CAPA
    // ═══════════════════════════════════════════
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, pageWidth, 55, "F");

    doc.setFontSize(32);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("CARDIOPB", margin, 28);

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Programa Coração Paraibano", margin, 38);

    doc.setFontSize(10);
    doc.text("Triagem e Regulação Médica do IAM da Paraíba", margin, 47);

    doc.setFillColor(180, 20, 20);
    doc.rect(0, 55, pageWidth, 2, "F");

    y = 72;

    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Apresentação Institucional Completa", margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, margin, y);
    doc.text("Sistema: CARDIOPB — Programa Coração Paraibano", margin, y + 6);
    doc.text("Plataforma: Base44 (BaaS — Backend as a Service)", margin, y + 12);
    y += 22;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // ═══════════════════════════════════════════
    // SEÇÃO 1 — O QUE É
    // ═══════════════════════════════════════════
    titulo("1. O que é o CARDIOPB?");
    espaco(2);
    paragrafo(
      "O CARDIOPB é uma plataforma digital estratégica voltada para a gestão e regulação médica de pacientes com Infarto Agudo do Miocárdio (IAM) no estado da Paraíba. O aplicativo atua como uma ferramenta centralizada de comunicação, triagem e tomada de decisão para profissionais de saúde, visando otimizar o fluxo de atendimento desde a Unidade de Saúde de origem até os centros de hemodinâmica."
    );
    paragrafo(
      "O sistema foi desenvolvido sobre a plataforma Base44, que oferece backend gerenciado (BaaS). Este documento descreve como os dados são armazenados, as opções de residência de dados, a conformidade com a LGPD, e os caminhos possíveis para hospedagem em infraestrutura governamental própria."
    );
    espaco(2);

    // ═══════════════════════════════════════════
    // SEÇÃO 2 — OBJETIVOS
    // ═══════════════════════════════════════════
    titulo("2. Objetivos Principais");
    espaco(2);
    bullet("Redução do Tempo de Atendimento: Agilizar o diagnóstico e a conduta terapêutica (como a trombólise) para salvar vidas.");
    bullet("Regulação Eficiente: Centralizar a fila de regulação, permitindo que o complexo regulador coordene vagas e transporte em tempo real.");
    bullet("Padronização de Condutas: Disseminar protocolos clínicos atualizados para toda a rede de saúde do estado.");
    bullet("Monitoramento e Auditoria: Fornecer dados precisos sobre a performance da rede (indicadores de qualidade) para a gestão pública.");
    espaco(2);

    // ═══════════════════════════════════════════
    // SEÇÃO 3 — ARQUITETURA TECNOLÓGICA
    // ═══════════════════════════════════════════
    titulo("3. Arquitetura Tecnológica");
    espaco(2);

    subtitulo("3.1 Linguagem e Framework");
    paragrafo(
      "O front-end é desenvolvido em React com a biblioteca Tailwind CSS para um design responsivo, moderno e adaptado para uso clínico intensivo em dispositivos web e mobile."
    );

    subtitulo("3.2 Banco de Dados e Backend");
    paragrafo(
      "Os dados são armazenados em um banco de dados NoSQL gerenciado (MongoDB) hospedado na infraestrutura da plataforma Base44. Cada entidade — como Paciente, SolicitacaoAcesso, RegistroTrombolise e LogAuditoria — corresponde a uma coleção nesse banco."
    );

    subtitulo("3.3 Segurança e Controle de Acesso (RLS)");
    paragrafo(
      "O sistema implementa Row-Level Security (RLS) em todas as entidades, restringindo o acesso aos dados com base no perfil do usuário (ex: UNIDADE_SAUDE, CERH, ASSCARDIO, ADMINISTRADOR_MASTER). Isso garante que cada profissional acessa apenas os registros pertinentes ao seu papel dentro da rede."
    );

    subtitulo("3.4 Auditoria");
    paragrafo(
      "Toda ação crítica é registrada na entidade LogAuditoria, contendo: usuário, data/hora, IP de origem, dados anteriores e novos, e campos alterados."
    );

    subtitulo("3.5 Criptografia");
    paragrafo(
      "Os dados são criptografados em trânsito (TLS/HTTPS) e em repouso, conforme os padrões da infraestrutura de nuvem utilizada pela Base44 (AWS/GCP)."
    );
    espaco(2);

    // ═══════════════════════════════════════════
    // SEÇÃO 4 — LGPD
    // ═══════════════════════════════════════════
    checkPage(50);
    titulo("4. Conformidade com a LGPD");
    espaco(2);
    paragrafo("O sistema já possui mecanismos alinhados à Lei Geral de Proteção de Dados (Lei nº 13.709/2018):");
    bullet("Controle de acesso baseado em perfis (RLS) — minimização de acesso");
    bullet("Trilha de auditoria completa (LogAuditoria) com IP, usuário e timestamp");
    bullet("Assinatura digital e códigos de confirmação para documentos clínicos");
    bullet("Página pública de verificação de autenticidade de documentos");
    bullet("Status EXCLUÍDO para retenção de registros para fins de auditoria");
    espaco(2);
    paragrafo(
      "Recomenda-se a formalização de um DPA (Data Processing Agreement) entre o órgão público e a Base44, garantindo responsabilidades claras sobre tratamento e proteção de dados pessoais, inclusive de saúde (dados sensíveis — Art. 11 da LGPD)."
    );
    espaco(2);

    // ═══════════════════════════════════════════
    // SEÇÃO 5 — RESIDÊNCIA DE DADOS
    // ═══════════════════════════════════════════
    checkPage(50);
    titulo("5. Residência de Dados (Data Residency)");
    espaco(2);
    paragrafo("A plataforma Base44 oferece, nos planos Elite e Enterprise, a possibilidade de escolher a região geográfica onde os dados são armazenados:");
    bullet("Estados Unidos (EUA) — região padrão");
    bullet("União Europeia (UE)");
    bullet("Reino Unido (UK)");
    espaco(2);
    paragrafo("Importante: Atualmente NÃO há opção de data center governamental brasileiro próprio.");
    espaco(2);

    // ═══════════════════════════════════════════
    // SEÇÃO 6 — OPÇÕES DE HOSPEDAGEM
    // ═══════════════════════════════════════════
    checkPage(30);
    titulo("6. Opções para Hospedagem em Infraestrutura Governamental");
    espaco(2);

    subtitulo("Opção A — Permanecer na Base44 com DPA (Recomendada)");
    paragrafo("Mantém-se o app na plataforma Base44, com a assinatura de um Acordo de Tratamento de Dados (DPA). Os dados permanecem em infraestrutura de nuvem certificada.");
    paragrafo("Vantagens: Zero reescrita de código; Segurança, backups e atualizações gerenciados; Conformidade LGPD já parcialmente implementada; Disponibilidade imediata.");
    paragrafo("Desvantagens: Dados não ficam em data center governamental; Dependência de terceiro.");
    espaco(2);

    subtitulo("Opção B — Replicação para Banco Governamental (Híbrida)");
    paragrafo("Mantém-se o app na Base44 como fonte primária, mas cria-se funções de backend que replicam os dados para um banco no data center do governo.");
    paragrafo("Vantagens: Cópia dos dados sob controle do governo; Baixo esforço de implementação; Sistema principal sem mudanças.");
    paragrafo("Desvantagens: Dados primários ainda na Base44; Necessidade de sincronização contínua.");
    espaco(2);

    subtitulo("Opção C — Migração Completa para Infraestrutura Governamental");
    paragrafo("Exporta-se todo o código e reescreve-se a camada de dados e autenticação para rodar em servidores próprios do governo. Envolve reescrita completa da camada de acesso a dados, do sistema de autenticação (GOV.BR/LDAP) e provisionamento de servidores, CI/CD, SSL e monitoramento.");
    paragrafo("Estimativa: semanas a meses de desenvolvimento dedicado.");
    espaco(2);

    // ═══════════════════════════════════════════
    // SEÇÃO 7 — EXPORTABILIDADE
    // ═══════════════════════════════════════════
    checkPage(50);
    titulo("7. O que Pode e NÃO Pode Ser Exportado");
    espaco(2);
    subtitulo("Exportável:");
    bullet("Código frontend (React/Vite) — pasta src/");
    bullet("Funções de backend (Deno) — pasta base44/functions/");
    bullet("Schemas das entidades (JSON) — pasta base44/entities/");
    espaco(2);
    subtitulo("NÃO exportável:");
    bullet("Banco de dados gerenciado (MongoDB)");
    bullet("SDK de entidades (base44.entities)");
    bullet("Sistema de autenticação");
    bullet("Runtime Deno e infraestrutura de deploy");
    espaco(2);

    // ═══════════════════════════════════════════
    // SEÇÃO 8 — IMPORTÂNCIA
    // ═══════════════════════════════════════════
    checkPage(50);
    titulo("8. O Fator de Grande Importância — A Linha do Tempo Crítica");
    espaco(2);
    paragrafo(
      "O que torna o CARDIOPB fundamental para a saúde pública na Paraíba é o conceito de Transparência de Gestão em Tempo Real para o Tempo-Coração."
    );
    paragrafo(
      "O sistema transforma cada minuto de espera em um dado mensurável. Ao integrar o tempo de chegada, tempo de ECG, tempo de prescrição da trombólise e o transporte, o app não apenas organiza o fluxo — ele gera inteligência epidemiológica."
    );
    paragrafo(
      "Isso permite que a Secretaria de Estado da Saúde da Paraíba (SES-PB) não trabalhe apenas por percepção, mas com evidências científicas e operacionais para identificar gargalos em tempo real, garantindo que o recurso público seja alocado onde a vida está em maior risco no exato momento da emergência. É a transição definitiva da regulação analógica para a regulação digital de precisão."
    );
    espaco(2);

    // ═══════════════════════════════════════════
    // SEÇÃO 9 — RECOMENDAÇÃO TÉCNICA
    // ═══════════════════════════════════════════
    checkPage(30);
    titulo("9. Recomendação Técnica");
    espaco(2);
    paragrafo(
      "Para um órgão público estadual de saúde, recomenda-se inicialmente a Opção A (permanecer na Base44 com DPA assinado). Caso a exigência de hospedagem em data center próprio seja inegociável, a Opção B (híbrida) oferece um meio-termo viável. A Opção C (migração completa) deve ser considerada apenas como projeto de longo prazo."
    );
    espaco(2);

    // ═══════════════════════════════════════════
    // SEÇÃO 10 — DESENVOLVEDOR
    // ═══════════════════════════════════════════
    checkPage(30);
    titulo("10. Desenvolvedor Responsável");
    espaco(4);

    doc.setFillColor(250, 245, 245);
    doc.rect(margin, y - 2, textWidth, 22, "F");
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.rect(margin, y - 2, textWidth, 22);

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.setTextColor(220, 38, 38);
    doc.text("Walber A. Frazão Jr.", margin + 4, y + 5);

    doc.setFontSize(9.5);
    doc.setFont(undefined, "normal");
    doc.setTextColor(50, 50, 50);
    doc.text("Enfermeiro Cardio-Emergencista e Auditor", margin + 4, y + 11);
    doc.text("COREN 110.238", margin + 4, y + 16);

    y += 26;

    // Rodapés em todas as páginas
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      doc.text(`CARDIOPB — Apresentação Institucional  |  Página ${i} de ${totalPaginas}`, margin, pageHeight - 8);
      doc.text("Walber A. Frazão Jr. — COREN 110.238", pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    doc.save("Apresentacao_Institucional_CARDIOPB.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-red-600 p-3 rounded-full">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Apresentação Institucional</CardTitle>
          <CardDescription className="text-gray-600">
            Documento completo sobre o CARDIOPB — texto justificado, dados técnicos da Base44 e assinatura do desenvolvedor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700 mb-6">
            <p>✓ O que é o CARDIOPB</p>
            <p>✓ Objetivos principais</p>
            <p>✓ Arquitetura tecnológica (React, MongoDB / Base44)</p>
            <p>✓ Conformidade com a LGPD</p>
            <p>✓ Residência de dados e opções de hospedagem governamental</p>
            <p>✓ O que pode e não pode ser exportado</p>
            <p>✓ Fator de grande importância para a saúde pública</p>
            <p>✓ Recomendação técnica</p>
            <p>✓ Desenvolvedor: Walber A. Frazão Jr. — COREN 110.238</p>
          </div>
          <Button onClick={gerarPDF} className="w-full bg-red-600 hover:bg-red-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF da Apresentação
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}