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
      const canvas = await html2canvas(contentRef.current, {
        scale: 1.8,
        logging: false,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        imageTimeout: 15000,
        removeContainer: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
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