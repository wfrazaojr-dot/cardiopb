import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

/**
 * Exporta os indicadores de Trombólise em PDF e Excel.
 */
export default function ExportarTrombolise({ dados, ano }) {
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const [exportandoXls, setExportandoXls] = useState(false);

  if (!dados || (dados.tromboliticosPorTipo?.totalGeral || 0) === 0) return null;

  const { tromboliticosPorTipo, trombolisPorIndicacao, trombolisPorMes, registros } = dados;
  const nomeArquivo = `Indicadores_Trombolise_${ano}`;

  const exportarExcel = () => {
    setExportandoXls(true);
    try {
      const wb = XLSX.utils.book_new();

      // Aba 1: Resumo Geral
      const resumo = [
        ["CARDIOPB — Indicadores de Trombólise"],
        ["Ano", ano],
        ["Total de Registros", tromboliticosPorTipo.totalGeral],
        [],
        ["Por Indicação"],
        ...trombolisPorIndicacao.map(i => [i.name, i.value]),
        [],
        ["Por Classe de Medicamento"],
        ["TENECTEPLASE", tromboliticosPorTipo.totalTenecto],
        ["ALTEPLASE", tromboliticosPorTipo.alteplase],
        [],
        ["Por Apresentação"],
        ["TENECTEPLASE 40mg", tromboliticosPorTipo.tenecto40],
        ["TENECTEPLASE 50mg", tromboliticosPorTipo.tenecto50],
        ["ALTEPLASE 100mg", tromboliticosPorTipo.alteplase],
      ];
      const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
      XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

      // Aba 2: Uso por Mês
      const wsMes = XLSX.utils.json_to_sheet(
        trombolisPorMes.map(m => ({ Mês: m.mes, Registros: m.total }))
      );
      XLSX.utils.book_append_sheet(wb, wsMes, "Uso por Mês");

      // Aba 3: Registros Detalhados
      if (registros && registros.length > 0) {
        const detalhe = registros
          .filter(r => new Date(r.created_date).getFullYear() === ano)
          .map(r => ({
            "Data Criação": r.created_date ? new Date(r.created_date).toLocaleString("pt-BR") : "",
            "Indicação": r.indicacao || "",
            "Paciente": r.paciente_nome || "",
            "Unidade de Saúde": r.unidade_saude || "",
            "Medicamento": r.medicamento || "",
            "Lote": r.numero_lote || "",
            "Dose": r.dose || "",
            "Via": r.via_administracao || "",
            "Médico Prescritor": r.medico_prescritor_nome || "",
            "CRM": r.medico_prescritor_crm || "",
            "Enfermeiro Responsável": r.enfermeiro_responsavel_nome || "",
            "COREN": r.enfermeiro_responsavel_coren || "",
            "Profissional que Administrou": r.profissional_administrou_nome || "",
            "Intercorrência": r.tem_intercorrencia ? "Sim" : "Não",
            "Tipo Intercorrência": r.tipo_intercorrencia || "",
          }));
        const wsDet = XLSX.utils.json_to_sheet(detalhe);
        XLSX.utils.book_append_sheet(wb, wsDet, "Registros Detalhados");
      }

      XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
    } catch (error) {
      console.error("Erro ao gerar Excel:", error);
      alert("Erro ao gerar Excel. Tente novamente.");
    } finally {
      setExportandoXls(false);
    }
  };

  const exportarPDF = () => {
    setExportandoPdf(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 14;
      let y = 20;
      let pageNum = 1;

      const checkPage = (needed = 15) => {
        if (y + needed > pageH - 15) {
          drawFooter();
          pdf.addPage();
          pageNum++;
          drawHeader();
          y = 18;
        }
      };

      const drawHeader = () => {
        pdf.setFillColor(220, 38, 38);
        pdf.rect(0, 0, pageW, 12, "F");
        pdf.setFontSize(13);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.text("CARDIOPB — Indicadores de Trombólise", pageW / 2, 8, { align: "center" });
      };

      const drawFooter = () => {
        pdf.setFontSize(7);
        pdf.setTextColor(130);
        pdf.setFont("helvetica", "normal");
        pdf.text("Sistema CARDIOPB — Secretaria de Estado de Saúde da Paraíba", pageW / 2, pageH - 8, { align: "center" });
        pdf.text(`Gerado em ${new Date().toLocaleString("pt-BR")} — Página ${pageNum}`, pageW / 2, pageH - 5, { align: "center" });
      };

      const drawSectionTitle = (title) => {
        checkPage(12);
        pdf.setFillColor(254, 226, 226);
        pdf.rect(margin - 2, y - 4, pageW - margin * 2 + 4, 7, "F");
        pdf.setFontSize(10);
        pdf.setTextColor(220, 38, 38);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin, y);
        y += 7;
      };

      const drawBarChart = (data, labelKey, valueKey, color = [220, 38, 38], maxBars = 12) => {
        if (!data || data.length === 0) return;
        const items = data.slice(0, maxBars);
        const maxVal = Math.max(...items.map(d => d[valueKey] || 0), 1);
        const labelW = 40;
        const valueW = 14;
        const barX = margin + labelW;
        const barMaxW = pageW - margin - barX - valueW;

        items.forEach(d => {
          checkPage(8);
          const val = d[valueKey] || 0;
          const barW = (val / maxVal) * barMaxW;
          pdf.setFontSize(7.5);
          pdf.setTextColor(60);
          pdf.setFont("helvetica", "normal");
          pdf.text(String(d[labelKey] || "").substring(0, 22), margin, y + 3);
          pdf.setFillColor(color[0], color[1], color[2]);
          pdf.roundedRect(barX, y, Math.max(barW, 0.5), 4, 0.5, 0.5, "F");
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(40);
          pdf.text(String(val), barX + barW + 1, y + 3);
          y += 6.5;
        });
        y += 3;
      };

      const drawTable = (headers, rows, colWidths) => {
        const rowH = 6;
        const tableW = colWidths.reduce((a, b) => a + b, 0);
        checkPage(rowH * 2);
        pdf.setFillColor(220, 38, 38);
        pdf.rect(margin, y, tableW, rowH, "F");
        pdf.setFontSize(7.5);
        pdf.setTextColor(255);
        pdf.setFont("helvetica", "bold");
        let cx = margin;
        headers.forEach((h, i) => { pdf.text(h, cx + 1, y + 4); cx += colWidths[i]; });
        y += rowH;

        rows.forEach((row, ri) => {
          checkPage(rowH + 2);
          if (ri % 2 === 0) { pdf.setFillColor(254, 242, 242); pdf.rect(margin, y, tableW, rowH, "F"); }
          pdf.setFontSize(7);
          pdf.setTextColor(50);
          pdf.setFont("helvetica", "normal");
          cx = margin;
          row.forEach((cell, i) => { pdf.text(String(cell ?? "").substring(0, 30), cx + 1, y + 4); cx += colWidths[i]; });
          y += rowH;
        });
        y += 4;
      };

      // ═══ Conteúdo ═══
      drawHeader();

      pdf.setFontSize(9);
      pdf.setTextColor(60);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Ano: ${ano}`, margin, y);
      pdf.text(`Total de Registros: ${tromboliticosPorTipo.totalGeral}`, margin + 50, y);
      y += 8;

      // 1. Por Indicação
      drawSectionTitle("1. Registros por Indicação Clínica");
      drawTable(
        ["Indicação", "Casos"],
        trombolisPorIndicacao.map(i => [i.name, String(i.value)]),
        [60, 30]
      );
      drawBarChart(trombolisPorIndicacao, "name", "value", [220, 38, 38]);

      // 2. Por Classe de Medicamento
      drawSectionTitle("2. Uso por Classe de Medicamento");
      drawTable(
        ["Classe", "Casos"],
        [
          ["TENECTEPLASE", String(tromboliticosPorTipo.totalTenecto)],
          ["ALTEPLASE", String(tromboliticosPorTipo.alteplase)],
        ],
        [60, 30]
      );
      drawBarChart(
        [{ name: "TENECTEPLASE", value: tromboliticosPorTipo.totalTenecto }, { name: "ALTEPLASE", value: tromboliticosPorTipo.alteplase }],
        "name", "value", [37, 99, 235]
      );

      // 3. Por Apresentação
      drawSectionTitle("3. Uso por Apresentação");
      drawTable(
        ["Apresentação", "Casos"],
        [
          ["TENECTEPLASE 40mg", String(tromboliticosPorTipo.tenecto40)],
          ["TENECTEPLASE 50mg", String(tromboliticosPorTipo.tenecto50)],
          ["ALTEPLASE 100mg", String(tromboliticosPorTipo.alteplase)],
        ],
        [70, 30]
      );
      drawBarChart(
        tromboliticosPorTipo.graficoPorTipo.filter(d => d.value > 0),
        "name", "value", [234, 88, 12]
      );

      // 4. Uso por Mês
      drawSectionTitle("4. Uso por Mês");
      drawTable(
        ["Mês", "Registros"],
        trombolisPorMes.filter(m => m.total > 0).map(m => [m.mes, String(m.total)]),
        [50, 40]
      );
      drawBarChart(trombolisPorMes.filter(m => m.total > 0), "mes", "total", [220, 38, 38]);

      drawFooter();
      pdf.save(`${nomeArquivo}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExportandoPdf(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={exportarPDF} disabled={exportandoPdf} className="bg-red-600 hover:bg-red-700">
        {exportandoPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
        {exportandoPdf ? "Gerando PDF..." : "Baixar PDF"}
      </Button>
      <Button onClick={exportarExcel} disabled={exportandoXls} className="bg-green-600 hover:bg-green-700">
        {exportandoXls ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
        {exportandoXls ? "Gerando Excel..." : "Baixar Excel"}
      </Button>
    </div>
  );
}