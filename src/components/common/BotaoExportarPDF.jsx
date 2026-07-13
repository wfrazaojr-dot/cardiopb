import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

/**
 * Componente reutilizável para exportar o conteúdo de uma página em PDF.
 * Gera o PDF via texto (jsPDF puro), sem depender de html2canvas.
 */
export default function BotaoExportarPDF({ contentRef, nomeArquivo, titulo = "Exportar PDF" }) {
  const [exportando, setExportando] = useState(false);

  const handleExportar = async () => {
    if (!contentRef?.current) return;
    setExportando(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (lineHeight) => {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      const addText = (text, fontSize, fontStyle = "normal", color = [30, 30, 30]) => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", fontStyle);
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = pdf.splitTextToSize(text, maxWidth);
        for (const line of lines) {
          ensureSpace(fontSize * 0.5 + 1);
          pdf.text(line, margin, y);
          y += fontSize * 0.45 + 1;
        }
      };

      const root = contentRef.current;
      const headings = root.querySelectorAll("h1, h2, h3, h4, p, li");

      headings.forEach((el) => {
        const text = el.textContent.trim();
        if (!text) return;
        const tag = el.tagName.toLowerCase();

        if (tag === "h1") {
          addText(text, 18, "bold", [185, 28, 28]);
        } else if (tag === "h2") {
          y += 4;
          addText(text, 14, "bold", [30, 64, 175]);
          y += 1;
        } else if (tag === "h3") {
          addText(text, 12, "bold", [40, 40, 40]);
        } else if (tag === "h4") {
          addText(text, 11, "bold", [60, 60, 60]);
        } else if (tag === "li") {
          addText("• " + text, 10, "normal", [60, 60, 60]);
        } else {
          addText(text, 10, "normal", [50, 50, 50]);
        }
      });

      pdf.save(`${nomeArquivo}.pdf`);
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
      disabled={exportando}
      variant="outline"
      className="border-red-600 text-red-700 hover:bg-red-50"
    >
      {exportando ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      {exportando ? "Gerando PDF..." : titulo}
    </Button>
  );
}