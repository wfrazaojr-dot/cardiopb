import React from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";

export default function ApresentacaoCARDIOPB() {
  const gerarPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 25;

    // ── Capa ──
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.text("CARDIOPB", margin, 25);

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text("Triagem e Regulação Médica do IAM da Paraíba", margin, 33);

    doc.setTextColor(0, 0, 0);
    y = 55;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Apresentação Institucional", margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, margin, y);
    y += 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    // ── 1. O que é ──
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("1. O que é o CARDIOPB?", margin, y);
    y += 8;

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    const textoOQueE = doc.splitTextToSize(
      "O CARDIOPB é uma plataforma digital estratégica voltada para a gestão e regulação médica de pacientes com Infarto Agudo do Miocárdio (IAM) no estado da Paraíba. O aplicativo atua como uma ferramenta centralizada de comunicação, triagem e tomada de decisão para profissionais de saúde, visando otimizar o fluxo de atendimento desde a Unidade de Saúde de origem até os centros de hemodinâmica.",
      pageWidth - margin * 2
    );
    doc.text(textoOQueE, margin, y);
    y += textoOQueE.length * 5 + 6;

    // ── 2. Objetivos ──
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("2. Objetivos Principais", margin, y);
    y += 8;

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const objetivos = [
      "Redução do Tempo de Atendimento: Agilizar o diagnóstico e a conduta terapêutica (como a trombólise) para salvar vidas.",
      "Regulação Eficiente: Centralizar a fila de regulação, permitindo que o complexo regulador coordene vagas e transporte em tempo real.",
      "Padronização de Condutas: Disseminar protocolos clínicos atualizados para toda a rede de saúde do estado.",
      "Monitoramento e Auditoria: Fornecer dados precisos sobre a performance da rede (indicadores de qualidade) para a gestão pública.",
    ];

    objetivos.forEach((obj) => {
      const linhas = doc.splitTextToSize(`• ${obj}`, pageWidth - margin * 2);
      if (y + linhas.length * 5 > pageHeight - 20) {
        doc.addPage();
        y = 25;
      }
      doc.text(linhas, margin, y);
      y += linhas.length * 5 + 3;
    });

    y += 6;

    // ── 3. Tecnologia ──
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 25;
    }

    doc.setTextColor(220, 38, 38);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("3. Arquitetura Tecnológica", margin, y);
    y += 8;

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const techItems = [
      {
        titulo: "Linguagem e Framework:",
        desc: "O front-end é desenvolvido em React, utilizando a biblioteca Tailwind CSS para um design responsivo, moderno e adaptado para uso clínico intensivo (web e mobile).",
      },
      {
        titulo: "Banco de Dados e Backend:",
        desc: "Utiliza a plataforma Base44 (Backend-as-a-Service), garantindo segurança de dados, autenticação robusta, Row-Level Security (RLS) para controle de acesso granular por equipe/perfil e escalabilidade para grandes volumes de acessos simultâneos.",
      },
    ];

    techItems.forEach((item) => {
      const linhasTitulo = doc.splitTextToSize(item.titulo, pageWidth - margin * 2);
      const linhasDesc = doc.splitTextToSize(item.desc, pageWidth - margin * 2);
      const totalLinhas = linhasTitulo.length + linhasDesc.length;

      if (y + totalLinhas * 5 > pageHeight - 20) {
        doc.addPage();
        y = 25;
      }

      doc.setFont(undefined, "bold");
      doc.text(linhasTitulo, margin, y);
      y += linhasTitulo.length * 5;

      doc.setFont(undefined, "normal");
      doc.text(linhasDesc, margin, y);
      y += linhasDesc.length * 5 + 4;
    });

    y += 4;

    // ── 4. Importância ──
    if (y > pageHeight - 70) {
      doc.addPage();
      y = 25;
    }

    doc.setTextColor(220, 38, 38);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text("4. O Fator de Grande Importância", margin, y);
    y += 8;

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("A Linha do Tempo Crítica", margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const importanciaParagrafos = [
      "O que torna o CARDIOPB fundamental para a saúde pública na Paraíba é o conceito de Transparência de Gestão em Tempo Real para o Tempo-Coração.",
      "O sistema transforma cada minuto de espera em um dado mensurável. Ao integrar o tempo de chegada, tempo de ECG, tempo de prescrição da trombólise e o transporte, o app não apenas organiza o fluxo; ele gera inteligência epidemiológica.",
      "Impacto: Isso permite que a Secretaria de Estado da Saúde da Paraíba (SES-PB) não trabalhe apenas por percepção, mas com evidências científicas e operacionais para identificar gargalos em tempo real, garantindo que o recurso público seja alocado onde a vida está em maior risco no exato momento da emergência. É a transição definitiva da regulação analógica para a regulação digital de precisão.",
    ];

    importanciaParagrafos.forEach((par) => {
      const linhas = doc.splitTextToSize(par, pageWidth - margin * 2);
      if (y + linhas.length * 5 > pageHeight - 20) {
        doc.addPage();
        y = 25;
      }
      doc.text(linhas, margin, y);
      y += linhas.length * 5 + 4;
    });

    // ── Rodapé ──
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `CARDIOPB — Apresentação Institucional  |  Página ${i} de ${totalPaginas}`,
        margin,
        pageHeight - 10
      );
    }

    doc.save("Apresentacao_CARDIOPB.pdf");
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
          <CardTitle className="text-2xl text-gray-900">
            Apresentação Institucional
          </CardTitle>
          <CardDescription className="text-gray-600">
            Gere e baixe o PDF com a visão completa do aplicativo CARDIOPB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700 mb-6">
            <p>• O que é o CARDIOPB</p>
            <p>• Objetivos principais</p>
            <p>• Arquitetura tecnológica (linguagem e banco de dados)</p>
            <p>• Fator de grande importância para a saúde pública</p>
          </div>
          <Button
            onClick={gerarPDF}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF da Apresentação
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}