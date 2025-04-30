import { BaseDocumentClass } from "document-model";
import {
  type EditIssuerInput,
  type EditIssuerBankInput,
  type EditIssuerWalletInput,
  type EditPayerInput,
  type EditPayerBankInput,
  type EditPayerWalletInput,
  type InvoiceState,
  type InvoiceLocalState,
} from "../types.js";
import {
  editIssuer,
  editIssuerBank,
  editIssuerWallet,
  editPayer,
  editPayerBank,
  editPayerWallet,
} from "./creators.js";
import { type InvoiceAction } from "../actions.js";

export default class Invoice_Parties extends BaseDocumentClass<
  InvoiceState,
  InvoiceLocalState,
  InvoiceAction
> {
  public editIssuer(input: EditIssuerInput) {
    return this.dispatch(editIssuer(input));
  }

  public editIssuerBank(input: EditIssuerBankInput) {
    return this.dispatch(editIssuerBank(input));
  }

  public editIssuerWallet(input: EditIssuerWalletInput) {
    return this.dispatch(editIssuerWallet(input));
  }

  public editPayer(input: EditPayerInput) {
    return this.dispatch(editPayer(input));
  }

  public editPayerBank(input: EditPayerBankInput) {
    return this.dispatch(editPayerBank(input));
  }

  public editPayerWallet(input: EditPayerWalletInput) {
    return this.dispatch(editPayerWallet(input));
  }
}
