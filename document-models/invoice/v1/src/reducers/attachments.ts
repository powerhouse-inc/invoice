import type { InvoiceAttachmentsOperations } from "document-models/invoice/v1";

export const invoiceAttachmentsOperations: InvoiceAttachmentsOperations = {
  setTimeTrackingReportOperation(state, action) {
    state.timeTrackingReport = action.input.timeTrackingReport ?? null;
  },
  setBaseInvoiceOperation(state, action) {
    state.baseInvoice = action.input.baseInvoice ?? null;
  },
  addLineItemReceiptOperation(state, action) {
    const item = state.lineItems.find((x) => x.id === action.input.lineItemId);
    if (!item) {
      throw new Error("Line item matching input.lineItemId not found");
    }
    if (!item.receipts) {
      item.receipts = [];
    }
    if (!item.receipts.includes(action.input.receipt)) {
      item.receipts.push(action.input.receipt);
    }
  },
  removeLineItemReceiptOperation(state, action) {
    const item = state.lineItems.find((x) => x.id === action.input.lineItemId);
    if (!item) {
      throw new Error("Line item matching input.lineItemId not found");
    }
    item.receipts = (item.receipts ?? []).filter(
      (r) => r !== action.input.receipt,
    );
  },
};
