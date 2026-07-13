import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

/**
 * Gera um PDF consolidado de indicadores com tabelas e gráficos de barras.
 * Os dados já calculados são passados como props da página de Indicadores.
 */
export default function ExportarPDFIndicadores({
  pacientesFiltrados = [],
  qualidade = {},
  icpPorTipo = {},
  distribuicaoRisco = [],
  trombolise = {},
  filtros = {},
  user = null,
}) {
  const [exportando, setExportando] = useState(false);

  const handleExportar = async () => {
    setExportando(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 14;
      let y = 20;
      let pageNum = 1;

      const mesLabel = filtros.mesSelecionado === 0
        ? "Todos os meses"
        : ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][filtros.mesSelecionado - 1];
      const macroLabel = filtros.macrorregiao === "todas" ? "Todas" : filtros.macrorregiao;
      const scaLabel = filtros.tipoSca === "todos" ? "Todos" : filtros.tipoSca;

      // ── Header ──
      const drawHeader = () => {
        pdf.setFillColor(220, 38, 38);
        pdf.rect(0, 0, pageW, 12, "F");
        pdf.setFontSize(13);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.text("CARDIOPB — Relatório de Indicadores de Qualidade", pageW / 2, 8, { align: "center" });
      };

      // ── Footer ──
      const drawFooter = () => {
        pdf.setFontSize(7);
        pdf.setTextColor(130);
        pdf.setFont("helvetica", "normal");
        pdf.text("Sistema CARDIOPB — Secretaria de Estado de Saúde da Paraíba", pageW / 2, pageH - 8, { align: "center" });
        pdf.text(`Gerado em ${new Date().toLocaleString("pt-BR")}  —  Página ${pageNum}`, pageW / 2, pageH - 5, { align: "center" });
      };

      const checkPage = (needed = 20) => {
        if (y + needed > pageH - 15) {
          drawFooter();
          pdf.addPage();
          pageNum++;
          drawHeader();
          y = 18;
          return true;
        }
        return false;
      };

      const drawSectionTitle = (title) => {
        checkPage(12);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin - 2, y - 4, pageW - margin * 2 + 4, 7, "F");
        pdf.setFontSize(10);
        pdf.setTextColor(185, 28, 28);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin, y);
        y += 6;
      };

      // ── Gráfico de barras horizontal ──
      const drawBarChart = (data, labelKey, valueKey, color = [37, 99, 235], maxBars = 12) => {
        if (!data || data.length === 0) {
          pdf.setFontSize(8);
          pdf.setTextColor(160);
          pdf.setFont("helvetica", "italic");
          pdf.text("Sem dados disponíveis", margin, y + 3);
          y += 8;
          return;
        }
        const items = data.slice(0, maxBars);
        const maxVal = Math.max(...items.map(d => d[valueKey] || 0), 1);
        const labelW = 55;
        const valueW = 14;
        const barX = margin + labelW;
        const barMaxW = pageW - margin - barX - valueW;

        items.forEach((d) => {
          checkPage(8);
          const val = d[valueKey] || 0;
          const barW = (val / maxVal) * barMaxW;
          pdf.setFontSize(7.5);
          pdf.setTextColor(60);
          pdf.setFont("helvetica", "normal");
          pdf.text(String(d[labelKey] || "").substring(0, 32), margin, y + 3);
          pdf.setFillColor(...color);
          pdf.roundedRect(barX, y, Math.max(barW, 0.5), 4, 0.5, 0.5, "F");
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(40);
          pdf.text(String(val), barX + barW + 1, y + 3);
          y += 6.5;
        });
        y += 3;
      };

      // ── Tabela simples ──
      const drawTable = (headers, rows, colWidths) => {
        const rowH = 6;
        const tableW = colWidths.reduce((a, b) => a + b, 0);
        const startX = margin;

        checkPage(rowH * 2);
        // header
        pdf.setFillColor(220, 38, 38);
        pdf.rect(startX, y, tableW, rowH, "F");
        pdf.setFontSize(7.5);
        pdf.setTextColor(255);
        pdf.setFont("helvetica", "bold");
        let cx = startX;
        headers.forEach((h, i) => {
          pdf.text(h, cx + 1, y + 4);
          cx += colWidths[i];
        });
        y += rowH;

        // rows
        rows.forEach((row, ri) => {
          checkPage(rowH + 2);
          if (ri % 2 === 0) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(startX, y, tableW, rowH, "F");
          }
          pdf.setFontSize(7);
          pdf.setTextColor(50);
          pdf.setFont("helvetica", "normal");
          cx = startX;
          row.forEach((cell, i) => {
            pdf.text(String(cell ?? ""), cx + 1, y + 4);
            cx += colWidths[i];
          });
          y += rowH;
        });
        y += 4;
      };

      // ════════════════ INÍCIO DO CONTEÚDO ════════════════

      drawHeader();

      // Info do período
      pdf.setFontSize(9);
      pdf.setTextColor(60);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Período: ${mesLabel} / ${filtros.anoSelecionado}`, margin, y);
      pdf.text(`Macrorregião: ${macroLabel}`, margin + 80, y);
      pdf.text(`Tipo SCA: ${scaLabel}`, margin + 140, y);
      y += 5;
      pdf.text(`Total de Atendimentos: ${pacientesFiltrados.length}`, margin, y);
      if (user?.full_name) {
        pdf.text(`Solicitado por: ${user.full_name}`, margin + 80, y);
      }
      y += 8;

      // ────────── SEÇÃO 1: INDICADORES DE QUALIDADE ──────────
      drawSectionTitle("1. Indicadores de Qualidade de Atendimento");

      const ql = [
        { nome: "Porta-ECG", meta: 10, ...qualidade.portaEcg },
        { nome: "Porta Decisão", meta: 20, ...qualidade.portaDecisao },
        { nome: "Regulação", meta: 15, ...qualidade.regulacao },
        { nome: "Porta-Telecardio", meta: 15, ...qualidade.portaTelecardio },
        { nome: "Transporte", meta: 90, ...qualidade.transporte },
        { nome: "ICP-Hemodinâmica", meta: 15, ...qualidade.icpHemodinamica },
        { nome: "FMC-to-device", meta: 120, ...qualidade.fmcToDevice },
        { nome: "Porta-Agulha", meta: 30, ...qualidade.tempoFibrinolitica },
      ];

      drawTable(
        ["Indicador", "Média", "Mín", "Máx", "Meta", "Dentro", "Fora", "Status"],
        ql.map(q => [
          q.nome,
          `${q.media || 0} min`,
          `${q.min || 0}`,
          `${q.max || 0}`,
          `≤${q.meta}`,
          String(q.dentroMeta || 0),
          String(q.foraMeta || 0),
          (q.media || 0) <= q.meta ? "✓" : "✗",
        ]),
        [30, 18, 14, 14, 16, 16, 14, 16]
      );

      // Gráfico de barras: média vs meta
      drawBarChart(
        ql.map(q => ({ label: q.nome, value: q.media || 0 })),
        "label", "value", [37, 99, 235]
      );

      // ────────── SEÇÃO 2: DISTRIBUIÇÃO POR CLASSIFICAÇÃO DE RISCO ──────────
      drawSectionTitle("2. Distribuição por Classificação de Risco");
      if (distribuicaoRisco.length > 0) {
        drawTable(
          ["Classificação", "Quantidade", "% do Total"],
          distribuicaoRisco.map(d => [
            d.name,
            String(d.value),
            `${pacientesFiltrados.length > 0 ? ((d.value / pacientesFiltrados.length) * 100).toFixed(1) : 0}%`,
          ]),
          [50, 40, 30]
        );
        drawBarChart(distribuicaoRisco, "name", "value", [220, 38, 38]);
      } else {
        pdf.setFontSize(8); pdf.setTextColor(160); pdf.setFont("helvetica", "italic");
        pdf.text("Nenhum dado de classificação de risco disponível.", margin, y + 3);
        y += 8;
      }

      // ────────── SEÇÃO 3: ICP POR TIPO E MACRORREGIÃO ──────────
      drawSectionTitle("3. ICP — Distribuição por Tipo e Macrorregião");
      const icp = icpPorTipo.totais || {};
      drawTable(
        ["Tipo de ICP", "Quantidade"],
        [
          ["ICP Imediata", String(icp.imediata || 0)],
          ["Estratégia Invasiva Precoce (≤24h)", String(icp.ate_24h || 0)],
          ["Invasiva Durante Internamento (≤72h)", String(icp.ate_72h || 0)],
          ["TOTAL", String(icp.total || 0)],
        ],
        [90, 40]
      );

      if (icpPorTipo.porMacro && icpPorTipo.porMacro.length > 0) {
        drawBarChart(
          icpPorTipo.porMacro.map(m => ({ label: m.name, value: (m.imediata || 0) + (m.ate_24h || 0) + (m.ate_72h || 0) })),
          "label", "value", [214, 51, 132]
        );
      }

      // ────────── SEÇÃO 4: ANÁLISE EPIDEMIOLÓGICA ──────────
      drawSectionTitle("4. Análise Epidemiológica");

      // Por Macrorregião
      const porMacro = ["Macro 1", "Macro 2", "Macro 3"].map(m => ({
        label: m,
        value: pacientesFiltrados.filter(p => p.macrorregiao === m).length,
      }));
      drawBarChart(porMacro, "label", "value", [37, 99, 235]);

      // Por Sexo
      const porSexo = [
        { label: "Masculino", value: pacientesFiltrados.filter(p => p.sexo === "Masculino").length },
        { label: "Feminino", value: pacientesFiltrados.filter(p => p.sexo === "Feminino").length },
      ];
      drawBarChart(porSexo, "label", "value", [124, 58, 237]);

      // Por Faixa Etária
      const faixaEtaria = (idade) => {
        if (!idade) return "Não informado";
        if (idade < 40) return "< 40 anos";
        if (idade < 50) return "40-49 anos";
        if (idade < 60) return "50-59 anos";
        if (idade < 70) return "60-69 anos";
        if (idade < 80) return "70-79 anos";
        return "≥ 80 anos";
      };
      const faixas = ["< 40 anos","40-49 anos","50-59 anos","60-69 anos","70-79 anos","≥ 80 anos","Não informado"];
      const porIdade = faixas.map(f => ({
        label: f,
        value: pacientesFiltrados.filter(p => faixaEtaria(p.idade) === f).length,
      })).filter(x => x.value > 0);
      drawBarChart(porIdade, "label", "value", [124, 58, 237]);

      // Por Tipo de SCA
      const scaLabels = {
        SCACESST: "SCACESST",
        SCASESST_COM_TROPONINA: "SCASESST c/ Troponina",
        SCASESST_SEM_TROPONINA: "SCASESST s/ Troponina",
      };
      const porSCA = Object.keys(scaLabels).map(k => ({
        label: scaLabels[k],
        value: pacientesFiltrados.filter(p => p.triagem_medica?.tipo_sca === k).length,
      })).filter(x => x.value > 0);
      drawBarChart(porSCA, "label", "value", [234, 88, 12]);

      // Top 8 Unidades
      const contagemUnidades = {};
      pacientesFiltrados.forEach(p => {
        const u = p.unidade_saude;
        if (u) contagemUnidades[u] = (contagemUnidades[u] || 0) + 1;
      });
      const topUnidades = Object.entries(contagemUnidades)
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([name, value]) => ({ label: name, value }));
      drawBarChart(topUnidades, "label", "value", [99, 102, 241]);

      // Top 8 Cidades
      const contagemCidades = {};
      pacientesFiltrados.forEach(p => {
        const c = p.cidade;
        if (c) contagemCidades[c] = (contagemCidades[c] || 0) + 1;
      });
      const topCidades = Object.entries(contagemCidades)
        .sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([name, value]) => ({ label: name, value }));
      drawBarChart(topCidades, "label", "value", [22, 163, 74]);

      // ────────── SEÇÃO 5: TROMBÓLISE ──────────
      drawSectionTitle("5. Trombólise — Resumo do Período");

      const trombo = trombolise.tromboliticosPorTipo || {};
      const porIndicacao = trombolise.trombolisPorIndicacao || [];
      const porMes = trombolise.trombolisPorMes || [];

      drawTable(
        ["Medicamento", "Quantidade"],
        [
          ["TENECTEPLASE 40mg", String(trombo.tenecto40 || 0)],
          ["TENECTEPLASE 50mg", String(trombo.tenecto50 || 0)],
          ["ALTEPLASE 100mg", String(trombo.alteplase || 0)],
          ["TOTAL GERAL", String(trombo.totalGeral || 0)],
        ],
        [90, 40]
      );

      // Por Indicação
      checkPage(10);
      pdf.setFontSize(8);
      pdf.setTextColor(60);
      pdf.setFont("helvetica", "bold");
      pdf.text("Distribuição por Indicação Clínica", margin, y + 3);
      y += 6;
      drawBarChart(porIndicacao, "name", "value", [220, 38, 38]);

      // Por Mês
      checkPage(10);
      pdf.setFontSize(8);
      pdf.setTextColor(60);
      pdf.setFont("helvetica", "bold");
      pdf.text("Registros por Mês", margin, y + 3);
      y += 6;
      drawBarChart(porMes, "mes", "total", [220, 38, 38]);

      drawFooter();
      pdf.save(`Indicadores_CARDIOPB_${mesLabel.replace(/\s/g, "_")}_${filtros.anoSelecionado}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExportando(false);
    }
  };

  return (
    <Button
      onClick={handleExportar}
      disabled={exportando || pacientesFiltrados.length === 0}
      className="bg-red-600 hover:bg-red-700"
    >
      {exportando ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      {exportando ? "Gerando PDF..." : "Baixar PDF de Indicadores"}
    </Button>
  );
}