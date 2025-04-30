import { type SignalDispatch } from "document-model";
import {
  type EditInvoiceAction,
  type EditStatusAction,
  type AddRefAction,
  type EditRefAction,
  type DeleteRefAction,
} from "./actions.js";
import { type InvoiceState } from "../types.js";

export interface InvoiceGeneralOperations {
  editInvoiceOperation: (
    state: InvoiceState,
    action: EditInvoiceAction,
    dispatch?: SignalDispatch,
  ) => void;
  editStatusOperation: (
    state: InvoiceState,
    action: EditStatusAction,
    dispatch?: SignalDispatch,
  ) => void;
  addRefOperation: (
    state: InvoiceState,
    action: AddRefAction,
    dispatch?: SignalDispatch,
  ) => void;
  editRefOperation: (
    state: InvoiceState,
    action: EditRefAction,
    dispatch?: SignalDispatch,
  ) => void;
  deleteRefOperation: (
    state: InvoiceState,
    action: DeleteRefAction,
    dispatch?: SignalDispatch,
  ) => void;
}
