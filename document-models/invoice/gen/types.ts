import type { PHDocument, ExtendedState } from "document-model";
import type { InvoiceState } from "./schema/types.js";
import type { InvoiceAction } from "./actions.js";

export { z } from "./schema/index.js";
export type * from "./schema/types.js";
type InvoiceLocalState = Record<PropertyKey, never>;
export type ExtendedInvoiceState = ExtendedState<
  InvoiceState,
  InvoiceLocalState
>;
export type InvoiceDocument = PHDocument<
  InvoiceState,
  InvoiceLocalState,
  InvoiceAction
>;
export type { InvoiceState, InvoiceLocalState, InvoiceAction };
