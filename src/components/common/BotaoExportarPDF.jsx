import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Componente reutilizável para exportar o conteúdo de uma página em PDF.
 * Uso: envolva o conteúdo a ser exportado com o `contentRef` e coloque o botão onde desejar.
 *
 * @param {React.RefObject} contentRef - ref do elemento a ser capturado
 * @param {string} nomeArquivo - nome do arquivo PDF (sem extensão)
 * @param {string} titulo - título exibido no botão
 */
export default function BotaoExportarPDF({ contentRef, nomeArquivo, titulo = "Exportar PDF" }) {
  const [exportando, setExportando] = useState(false);

  const handleExportar = async () => {
    if (!contentRef?.current) return;
    setExportando(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 5;
      const usableWidth = pdfWidth - margin * 2;
      let cursorY = margin;

      // Captura cada card separadamente para evitar limite de canvas em páginas longas
      const cards = contentRef.current.querySelectorAll(":scope > *");
      const elements = cards.length > 0 ? Array.from(cards) : [contentRef.current];

      for (let i = 0; i < elements.length; i++) {
        const canvas = await html2canvas(elements[i], {
          scale: 1.5,
          logging: false,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          imageTimeout: 15000,
          removeContainer: true,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const imgHeight = (canvas.height * usableWidth) / canvas.width;

        if (cursorY + imgHeight > pdfHeight - margin && cursorY > margin) {
          pdf.addPage();
          cursorY = margin;
        }

        // Se o card for maior que uma página inteira, divide
        if (imgHeight > pdfHeight - margin * 2) {
          let heightLeft = imgHeight;
          let position = cursorY;
          pdf.addImage(imgData, "JPEG", margin, position, usableWidth, imgHeight);
          heightLeft -= pdfHeight - margin - cursorY;

          while (heightLeft > 0) {
            pdf.addPage();
            position = margin - (imgHeight - heightLeft);
            pdf.addImage(imgData, "JPEG", margin, position, usableWidth, imgHeight);
            heightLeft -= pdfHeight - margin * 2;
          }
          cursorY = pdfHeight - margin;
        } else {
          pdf.addImage(imgData, "JPEG", margin, cursorY, usableWidth, imgHeight);
          cursorY += imgHeight + 2;
        }
      }

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