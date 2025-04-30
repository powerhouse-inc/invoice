import { BaseDocumentClass } from "document-model";
import {
  type EditInvoiceInput,
  type EditStatusInput,
  type AddRefInput,
  type EditRefInput,
  type DeleteRefInput,
  type InvoiceState,
  type InvoiceLocalState,
} from "../types.js";
import {
  editInvoice,
  editStatus,
  addRef,
  editRef,
  deleteRef,
} from "./creators.js";
import { type InvoiceAction } from "../actions.js";

export default class Invoice_General extends BaseDocumentClass<
  InvoiceState,
  InvoiceLocalState,
  InvoiceAction
> {
  public editInvoice(input: EditInvoiceInput) {
    return this.dispatch(editInvoice(input));
  }

  public editStatus(input: EditStatusInput) {
    return this.dispatch(editStatus(input));
  }

  public addRef(input: AddRefInput) {
    return this.dispatch(addRef(input));
  }

  public editRef(input: EditRefInput) {
    return this.dispatch(editRef(input));
  }

  public deleteRef(input: DeleteRefInput) {
    return this.dispatch(deleteRef(input));
  }
}
