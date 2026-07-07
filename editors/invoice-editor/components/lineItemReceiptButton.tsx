import { type ChangeEvent, useEffect, useRef } from "react";
import { Paperclip, Eye } from "lucide-react";
import { usePHToast } from "@powerhousedao/reactor-browser";
import { actions, useSelectedInvoiceDocument } from "document-models/invoice";
import { useFileUpload, type AttachmentRef } from "../hooks/useFileUpload.js";
import { useAttachmentViewer } from "../hooks/useAttachmentViewer.js";
import { validateReceiptUpload } from "../utils/pdfUpload.js";
import { formatNumber } from "../utils/utils.js";
import { AttachmentViewerModal } from "./attachmentViewerModal.js";

/**
 * Per-line-item expense receipt control.
 *
 * - No receipt yet → a paperclip icon that uploads a PDF/JPEG/PNG/GIF and stores
 *   it on the line item via `addLineItemReceipt`.
 * - Receipt attached → an eye icon that opens a read-only preview (image or PDF).
 *
 * Self-contained: reads its own receipts from the selected invoice by
 * `lineItemId`, so it needs no props beyond the id. Hash-first upload (dispatch
 * the ref, stream bytes in the background, roll back on failure).
 */
export function LineItemReceiptButton({ lineItemId }: { lineItemId: string }) {
  const [document, dispatch] = useSelectedInvoiceDocument();
  const lineItem = document.state.global.lineItems.find(
    (li) => li.id === lineItemId,
  );
  const receipts = lineItem?.receipts ?? [];
  const receipt = receipts[0] ?? null;

  // Shown in the viewer header so the receipt can be checked against the doc.
  const receiptTitle = lineItem
    ? lineItem.description.trim() || "Receipt"
    : "Receipt";
  const receiptSubtitle = lineItem
    ? `Total (incl. tax): ${lineItem.currency} ${formatNumber(lineItem.totalPriceTaxIncl)}`
    : undefined;

  const toast = usePHToast();
  const { uploadFile, isUploading } = useFileUpload();
  const viewer = useAttachmentViewer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (viewer.error) {
      toast?.("Couldn't load the receipt.", { type: "error" });
    }
  }, [viewer.error, toast]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateReceiptUpload(file);
    if (validationError) {
      toast?.(validationError, { type: "error" });
      event.target.value = "";
      return;
    }
    event.target.value = ""; // allow re-selecting the same file later

    let uploadedRef: AttachmentRef | null = null;
    void uploadFile(file, (ref) => {
      uploadedRef = ref;
      dispatch(actions.addLineItemReceipt({ lineItemId, receipt: ref }));
    }).catch((err: unknown) => {
      console.error("Receipt upload failed:", err);
      if (uploadedRef) {
        dispatch(
          actions.removeLineItemReceipt({ lineItemId, receipt: uploadedRef }),
        );
      }
      toast?.("Couldn't attach the receipt. Please try again.", {
        type: "error",
      });
    });
  }

  const buttonClass =
    "text-foreground hover:text-primary transition-colors disabled:opacity-40";

  return (
    <>
      {receipt ? (
        <button
          onClick={() => void viewer.view(receipt)}
          disabled={viewer.isLoading}
          className={buttonClass}
          title="View receipt"
          aria-label="View receipt"
        >
          <Eye className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={buttonClass}
          title="Attach receipt (PDF or image)"
          aria-label="Attach receipt"
        >
          <Paperclip className="w-5 h-5" />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/gif,image/avif"
        className="hidden"
        onChange={handleFile}
      />

      <AttachmentViewerModal
        open={viewer.url !== null}
        url={viewer.url}
        mimeType={viewer.mimeType}
        fileName={receiptTitle}
        subtitle={receiptSubtitle}
        onClose={viewer.close}
      />
    </>
  );
}
