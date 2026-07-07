import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "../InvoicePDF.js";
import { applyExtractedInvoice } from "../ingestPDF.js";
import type { PDFReviewData } from "../components/PDFReviewModal.js";
import type { InvoiceState } from "document-models/invoice";

/**
 * Custom hook for PDF review, upload handling, and export logic.
 * 
 * Extracted following vercel-react-best-practices:
 * - Extract complex/side-effect logic into dedicated hooks (rerender-memo / extraction guidance)
 * - Isolate transient UI state (pdfReviewData etc.)
 * - Keep main Editor focused on document + high-level orchestration
 * 
 * The createRoot hacks for PDFDownloadLink are isolated here.
 */
export function usePdfReview(
  fiatMode: boolean,
  state: InvoiceState | undefined,
  toast: any,
  dispatch: (action: any) => void
) {
  const [pdfReviewData, setPdfReviewData] = useState<PDFReviewData | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [isApplyingPdf, setIsApplyingPdf] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handlePdfUploadComplete = useCallback(
    (data: PDFReviewData, base64: string, fileName: string) => {
      setPdfBase64(base64);
      setPdfFileName(fileName);
      setPdfReviewData(data);
    },
    []
  );

  const handlePdfAccept = useCallback(
    (edited: Record<string, any>) => {
      setIsApplyingPdf(true);
      try {
        applyExtractedInvoice(dispatch, edited);
        toast?.("Invoice applied successfully", { type: "success" });
        setPdfReviewData(null);
        setPdfBase64(null);
        setPdfFileName("");
      } catch (err) {
        console.error("Failed to apply extracted invoice:", err);
        toast?.(
          err instanceof Error ? err.message : "Failed to apply extracted invoice",
          { type: "error" }
        );
      } finally {
        setIsApplyingPdf(false);
      }
    },
    [dispatch, toast]
  );

  const handlePdfReject = useCallback(() => {
    setPdfReviewData(null);
    setPdfBase64(null);
    setPdfFileName("");
  }, []);

  // Isolated PDF generation hack (from original code)
  const generatePDFBlob = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const container = window.document.createElement("div");
      container.style.display = "none";
      window.document.body.appendChild(container);

      const root = createRoot(container);

      const cleanup = () => {
        root.unmount();
        window.document.body.removeChild(container);
      };

      try {
        root.render(
          <PDFDownloadLink
            document={<InvoicePDF invoice={state!} fiatMode={fiatMode} />}
            fileName={`invoice-${state!.invoiceNo || "export"}.pdf`}
            className="hidden"
          >
            {({ blob, loading, error }) => {
              if (loading) return null;
              if (error) {
                cleanup();
                reject(error);
                return null;
              }
              if (blob) {
                resolve(blob);
                setTimeout(cleanup, 100);
              }
              return null;
            }}
          </PDFDownloadLink>
        );
      } catch (error) {
        console.error("Error generating PDF blob:", error);
        cleanup();
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }, [state, fiatMode]);

  const handleExportPDF = useCallback(() => {
    const container = window.document.createElement("div");
    container.style.display = "none";
    window.document.body.appendChild(container);

    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      window.document.body.removeChild(container);
    };

    try {
      root.render(
        <PDFDownloadLink
          document={<InvoicePDF invoice={state!} fiatMode={fiatMode} />}
          fileName={`invoice-${state!.invoiceNo || "export"}.pdf`}
          className="hidden"
        >
          {({ blob, url, loading, error }) => {
            if (loading) return null;
            if (error) {
              cleanup();
              toast?.("Failed to export PDF", { type: "error" });
              console.error("PDF generation error:", error);
              return null;
            }
            if (url && blob) {
              const downloadLink = window.document.createElement("a");
              downloadLink.href = url;
              downloadLink.download = `invoice-${state!.invoiceNo || "export"}.pdf`;
              window.document.body.appendChild(downloadLink);
              downloadLink.click();
              window.document.body.removeChild(downloadLink);
              setTimeout(cleanup, 100);
            }
            return null;
          }}
        </PDFDownloadLink>
      );
    } catch (error) {
      console.error("Error exporting PDF:", error);
      cleanup();
      toast?.("Failed to export PDF", { type: "error" });
    }
  }, [state, fiatMode, toast]);

  return {
    pdfReviewData,
    pdfBase64,
    pdfFileName,
    isApplyingPdf,
    isPdfLoading,
    setIsPdfLoading,
    handlePdfUploadComplete,
    handlePdfAccept,
    handlePdfReject,
    handleExportPDF,
    generatePDFBlob,
    setPdfReviewData,
    setPdfBase64,
    setPdfFileName,
  };
}
