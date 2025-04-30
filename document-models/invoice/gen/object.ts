import {
  BaseDocumentClass,
  type ExtendedState,
  type PartialState,
  applyMixins,
  type SignalDispatch,
} from "document-model";
import { type InvoiceState, type InvoiceLocalState } from "./types.js";
import { type InvoiceAction } from "./actions.js";
import { reducer } from "./reducer.js";
import utils from "./utils.js";
import Invoice_General from "./general/object.js";
import Invoice_Parties from "./parties/object.js";
import Invoice_Items from "./items/object.js";

export * from "./general/object.js";
export * from "./parties/object.js";
export * from "./items/object.js";

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
interface Invoice extends Invoice_General, Invoice_Parties, Invoice_Items {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class Invoice extends BaseDocumentClass<
  InvoiceState,
  InvoiceLocalState,
  InvoiceAction
> {
  static fileExtension = ".phdm";

  constructor(
    initialState?: Partial<
      ExtendedState<PartialState<InvoiceState>, PartialState<InvoiceLocalState>>
    >,
    dispatch?: SignalDispatch,
  ) {
    super(reducer, utils.createDocument(initialState), dispatch);
  }

  public saveToFile(path: string, name?: string) {
    return super.saveToFile(path, Invoice.fileExtension, name);
  }

  public loadFromFile(path: string) {
    return super.loadFromFile(path);
  }

  static async fromFile(path: string) {
    const document = new this();
    await document.loadFromFile(path);
    return document;
  }
}

applyMixins(Invoice, [Invoice_General, Invoice_Parties, Invoice_Items]);

export { Invoice };
