import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

/**
 * Exporta os indicadores de análise epidemiológica em PDF e Excel.
 */
export default function ExportarEpidemiologia({ dados, periodoInfo }) {
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const [exportandoXls, setExportandoXls] = useState(false);

  if (!dados || dados.total === 0) return null;

  const nomeArquivo = `Analise_Epidemiologica_${periodoInfo?.label || "periodo"}`;

  const exportarExcel = () => {
    setExportandoXls(true);
    try {
      const wb = XLSX.utils.book_new();

      // Aba 1: Resumo Geral
      const resumo = [
        ["CARDIOPB — Análise Epidemiológica"],
        ["Período", periodoInfo?.label || ""],
        ["Total de Atendimentos", dados.total],
        [],
      ];
      const wsResumo = XLSX.utils.aoa_to_sheet(resumo);
      XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo");

      // Aba 2: Por Macrorregião
      const wsMacro = XLSX.utils.json_to_sheet(
        dados.porMacro.map(m => ({ Macrorregião: m.name, Casos: m.value, Percentual: `${m.pct}%` }))
      );
      XLSX.utils.book_append_sheet(wb, wsMacro, "Por Macrorregião");

      // Aba 3: Por Tipo de SCA
      const wsSCA = XLSX.utils.json_to_sheet(
        dados.porSCA.map(s => ({ "Tipo SCA": s.name, Casos: s.value }))
      );
      XLSX.utils.book_append_sheet(wb, wsSCA, "Por Tipo SCA");

      // Aba 4: Top Cidades
      const wsCidades = XLSX.utils.json_to_sheet(
        dados.topCidades.map((c, i) => ({ "#": i + 1, Cidade: c.name, Casos: c.value }))
      );
      XLSX.utils.book_append_sheet(wb, wsCidades, "Top Cidades");

      // Aba 5: Top Unidades
      const wsUnidades = XLSX.utils.json_to_sheet(
        dados.topUnidades.map((u, i) => ({
          "#": i + 1,
          "Unidade de Saúde": u.name,
          Casos: u.value,
          "% do Total": `${dados.total > 0 ? ((u.value / dados.total) * 100).toFixed(1) : 0}%`,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsUnidades, "Top Unidades");

      // Aba 6: Unidades por SCA
      const wsUnidSCA = XLSX.utils.json_to_sheet(
        dados.unidadesPorSCA.map(u => ({
          "Unidade de Saúde": u.name,
          SCACESST: u.SCACESST || 0,
          "SCASESST c/ Troponina": u.SCASESST_COM_TROPONINA || 0,
          "SCASESST s/ Troponina": u.SCASESST_SEM_TROPONINA || 0,
          Total: u.total || 0,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsUnidSCA, "Unidades por SCA");

      // Aba 7: Perfil dos Pacientes
      const perfil = [];
      perfil.push(["Por Sexo"]);
      dados.porSexo.forEach(s => perfil.push([s.name, s.value]));
      perfil.push([]);
      perfil.push(["Por Faixa Etária"]);
      dados.porIdade.forEach(f => perfil.push([f.name, f.value]));
      perfil.push([]);
      perfil.push(["Fatores de Risco mais Prevalentes"]);
      dados.fatoresRisco.forEach((f, i) =>
        perfil.push([`${i + 1}º`, f.name, f.value, `${dados.total > 0 ? ((f.value / dados.total) * 100).toFixed(1) : 0}%`])
      );
      const wsPerfil = XLSX.utils.aoa_to_sheet(perfil);
      XLSX.utils.book_append_sheet(wb, wsPerfil, "Perfil dos Pacientes");

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
      const maxW = pageW - margin * 2;
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
        pdf.setFillColor(13, 148, 136);
        pdf.rect(0, 0, pageW, 12, "F");
        pdf.setFontSize(13);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.text("CARDIOPB — Análise Epidemiológica", pageW / 2, 8, { align: "center" });
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
        pdf.setFillColor(240, 253, 250);
        pdf.rect(margin - 2, y - 4, pageW - margin * 2 + 4, 7, "F");
        pdf.setFontSize(10);
        pdf.setTextColor(13, 148, 136);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin, y);
        y += 7;
      };

      const drawBarChart = (data, labelKey, valueKey, color = [37, 99, 235], maxBars = 12) => {
        if (!data || data.length === 0) return;
        const items = data.slice(0, maxBars);
        const maxVal = Math.max(...items.map(d => d[valueKey] || 0), 1);
        const labelW = 55;
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
          pdf.text(String(d[labelKey] || "").substring(0, 32), margin, y + 3);
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
        pdf.setFillColor(13, 148, 136);
        pdf.rect(margin, y, tableW, rowH, "F");
        pdf.setFontSize(7.5);
        pdf.setTextColor(255);
        pdf.setFont("helvetica", "bold");
        let cx = margin;
        headers.forEach((h, i) => { pdf.text(h, cx + 1, y + 4); cx += colWidths[i]; });
        y += rowH;

        rows.forEach((row, ri) => {
          checkPage(rowH + 2);
          if (ri % 2 === 0) { pdf.setFillColor(240, 253, 250); pdf.rect(margin, y, tableW, rowH, "F"); }
          pdf.setFontSize(7);
          pdf.setTextColor(50);
          pdf.setFont("helvetica", "normal");
          cx = margin;
          row.forEach((cell, i) => { pdf.text(String(cell ?? ""), cx + 1, y + 4); cx += colWidths[i]; });
          y += rowH;
        });
        y += 4;
      };

      // ═══ Conteúdo ═══
      drawHeader();

      pdf.setFontSize(9);
      pdf.setTextColor(60);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Período: ${periodoInfo?.label || "—"}`, margin, y);
      pdf.text(`Total de Atendimentos: ${dados.total}`, margin + 90, y);
      y += 8;

      // 1. Macrorregião
      drawSectionTitle("1. Solicitações por Macrorregião de Saúde");
      drawTable(
        ["Macrorregião", "Casos", "% do Total"],
        dados.porMacro.map(m => [m.name, String(m.value), `${m.pct}%`]),
        [50, 40, 30]
      );
      drawBarChart(dados.porMacro, "name", "value", [37, 99, 235]);

      // 2. Tipo de SCA
      drawSectionTitle("2. Prevalência por Tipo de Ocorrência (SCA)");
      drawTable(
        ["Tipo de SCA", "Casos"],
        dados.porSCA.map(s => [s.name, String(s.value)]),
        [80, 40]
      );
      drawBarChart(dados.porSCA, "name", "value", [220, 38, 38]);

      // 3. Top Cidades
      if (dados.topCidades.length > 0) {
        drawSectionTitle("3. Cidades com Maior Número de Solicitações");
        drawTable(
          ["#", "Cidade", "Casos"],
          dados.topCidades.map((c, i) => [`${i + 1}º`, c.name, String(c.value)]),
          [15, 80, 25]
        );
        drawBarChart(dados.topCidades, "name", "value", [22, 163, 74]);
      }

      // 4. Top Unidades
      if (dados.topUnidades.length > 0) {
        drawSectionTitle("4. Unidades de Saúde com Maior Número de Solicitações");
        drawTable(
          ["#", "Unidade de Saúde", "Casos", "% Total"],
          dados.topUnidades.map((u, i) => [
            `${i + 1}º`, u.name, String(u.value),
            `${dados.total > 0 ? ((u.value / dados.total) * 100).toFixed(1) : 0}%`,
          ]),
          [15, 75, 20, 20]
        );
      }

      // 5. Unidades por SCA
      if (dados.unidadesPorSCA.length > 0) {
        drawSectionTitle("5. Solicitações por Unidade de Saúde e Tipo de SCA");
        drawTable(
          ["Unidade de Saúde", "SCACESST", "c/ Troponina", "s/ Troponina", "Total"],
          dados.unidadesPorSCA.map(u => [
            u.name, String(u.SCACESST || 0), String(u.SCASESST_COM_TROPONINA || 0),
            String(u.SCASESST_SEM_TROPONINA || 0), String(u.total || 0),
          ]),
          [55, 22, 22, 22, 20]
        );
      }

      // 6. Perfil dos Pacientes
      drawSectionTitle("6. Perfil Epidemiológico dos Pacientes");
      checkPage(8);
      pdf.setFontSize(8);
      pdf.setTextColor(60);
      pdf.setFont("helvetica", "bold");
      pdf.text("Por Sexo:", margin, y + 3);
      y += 6;
      drawBarChart(dados.porSexo, "name", "value", [124, 58, 237]);

      checkPage(8);
      pdf.setFontSize(8);
      pdf.setTextColor(60);
      pdf.setFont("helvetica", "bold");
      pdf.text("Por Faixa Etária:", margin, y + 3);
      y += 6;
      drawBarChart(dados.porIdade, "name", "value", [124, 58, 237]);

      // 7. Fatores de Risco
      if (dados.fatoresRisco.length > 0) {
        drawSectionTitle("7. Fatores de Risco mais Prevalentes");
        drawTable(
          ["#", "Fator de Risco", "Casos", "% do Total"],
          dados.fatoresRisco.map((f, i) => [
            `${i + 1}º`, f.name, String(f.value),
            `${dados.total > 0 ? ((f.value / dados.total) * 100).toFixed(1) : 0}%`,
          ]),
          [15, 75, 20, 20]
        );
      }

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
      <Button onClick={exportarPDF} disabled={exportandoPdf} className="bg-teal-600 hover:bg-teal-700">
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