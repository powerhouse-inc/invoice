import { type BaseAction } from "document-model";
import type {
  EditIssuerInput,
  EditIssuerBankInput,
  EditIssuerWalletInput,
  EditPayerInput,
  EditPayerBankInput,
  EditPayerWalletInput,
} from "../types.js";

export type EditIssuerAction = BaseAction<
  "EDIT_ISSUER",
  EditIssuerInput,
  "global"
>;
export type EditIssuerBankAction = BaseAction<
  "EDIT_ISSUER_BANK",
  EditIssuerBankInput,
  "global"
>;
export type EditIssuerWalletAction = BaseAction<
  "EDIT_ISSUER_WALLET",
  EditIssuerWalletInput,
  "global"
>;
export type EditPayerAction = BaseAction<
  "EDIT_PAYER",
  EditPayerInput,
  "global"
>;
export type EditPayerBankAction = BaseAction<
  "EDIT_PAYER_BANK",
  EditPayerBankInput,
  "global"
>;
export type EditPayerWalletAction = BaseAction<
  "EDIT_PAYER_WALLET",
  EditPayerWalletInput,
  "global"
>;

export type InvoicePartiesAction =
  | EditIssuerAction
  | EditIssuerBankAction
  | EditIssuerWalletAction
  | EditPayerAction
  | EditPayerBankAction
  | EditPayerWalletAction;
