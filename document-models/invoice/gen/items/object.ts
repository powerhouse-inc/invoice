import { BaseDocumentClass } from "document-model";
import {
  type AddLineItemInput,
  type EditLineItemInput,
  type DeleteLineItemInput,
  type InvoiceState,
  type InvoiceLocalState,
} from "../types.js";
import { addLineItem, editLineItem, deleteLineItem } from "./creators.js";
import { type InvoiceAction } from "../actions.js";

export default class Invoice_Items extends BaseDocumentClass<
  InvoiceState,
  InvoiceLocalState,
  InvoiceAction
> {
  public addLineItem(input: AddLineItemInput) {
    return this.dispatch(addLineItem(input));
  }

  public editLineItem(input: EditLineItemInput) {
    return this.dispatch(editLineItem(input));
  }

  public deleteLineItem(input: DeleteLineItemInput) {
    return this.dispatch(deleteLineItem(input));
  }
}
