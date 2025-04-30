import {
  type StateReducer,
  isDocumentAction,
  createReducer,
} from "document-model";
import { type InvoiceDocument, z } from "./types.js";

import { reducer as GeneralReducer } from "../src/reducers/general.js";
import { reducer as PartiesReducer } from "../src/reducers/parties.js";
import { reducer as ItemsReducer } from "../src/reducers/items.js";

const stateReducer: StateReducer<InvoiceDocument> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }

  switch (action.type) {
    case "EDIT_INVOICE":
      z.EditInvoiceInputSchema().parse(action.input);
      GeneralReducer.editInvoiceOperation(
        state[action.scope],
        action,
        dispatch,
      );
      break;

    case "EDIT_STATUS":
      z.EditStatusInputSchema().parse(action.input);
      GeneralReducer.editStatusOperation(state[action.scope], action, dispatch);
      break;

    case "ADD_REF":
      z.AddRefInputSchema().parse(action.input);
      GeneralReducer.addRefOperation(state[action.scope], action, dispatch);
      break;

    case "EDIT_REF":
      z.EditRefInputSchema().parse(action.input);
      GeneralReducer.editRefOperation(state[action.scope], action, dispatch);
      break;

    case "DELETE_REF":
      z.DeleteRefInputSchema().parse(action.input);
      GeneralReducer.deleteRefOperation(state[action.scope], action, dispatch);
      break;

    case "EDIT_ISSUER":
      z.EditIssuerInputSchema().parse(action.input);
      PartiesReducer.editIssuerOperation(state[action.scope], action, dispatch);
      break;

    case "EDIT_ISSUER_BANK":
      z.EditIssuerBankInputSchema().parse(action.input);
      PartiesReducer.editIssuerBankOperation(
        state[action.scope],
        action,
        dispatch,
      );
      break;

    case "EDIT_ISSUER_WALLET":
      z.EditIssuerWalletInputSchema().parse(action.input);
      PartiesReducer.editIssuerWalletOperation(
        state[action.scope],
        action,
        dispatch,
      );
      break;

    case "EDIT_PAYER":
      z.EditPayerInputSchema().parse(action.input);
      PartiesReducer.editPayerOperation(state[action.scope], action, dispatch);
      break;

    case "EDIT_PAYER_BANK":
      z.EditPayerBankInputSchema().parse(action.input);
      PartiesReducer.editPayerBankOperation(
        state[action.scope],
        action,
        dispatch,
      );
      break;

    case "EDIT_PAYER_WALLET":
      z.EditPayerWalletInputSchema().parse(action.input);
      PartiesReducer.editPayerWalletOperation(
        state[action.scope],
        action,
        dispatch,
      );
      break;

    case "ADD_LINE_ITEM":
      z.AddLineItemInputSchema().parse(action.input);
      ItemsReducer.addLineItemOperation(state[action.scope], action, dispatch);
      break;

    case "EDIT_LINE_ITEM":
      z.EditLineItemInputSchema().parse(action.input);
      ItemsReducer.editLineItemOperation(state[action.scope], action, dispatch);
      break;

    case "DELETE_LINE_ITEM":
      z.DeleteLineItemInputSchema().parse(action.input);
      ItemsReducer.deleteLineItemOperation(
        state[action.scope],
        action,
        dispatch,
      );
      break;

    default:
      return state;
  }
};

export const reducer = createReducer<InvoiceDocument>(stateReducer);
