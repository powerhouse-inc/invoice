import type { InvoiceGeneralAction } from "./general/actions.js";
import type { InvoicePartiesAction } from "./parties/actions.js";
import type { InvoiceItemsAction } from "./items/actions.js";

export * from "./general/actions.js";
export * from "./parties/actions.js";
export * from "./items/actions.js";

export type InvoiceAction =
  | InvoiceGeneralAction
  | InvoicePartiesAction
  | InvoiceItemsAction;
