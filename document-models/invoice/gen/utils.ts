import {
  type DocumentModelUtils,
  baseCreateDocument,
  baseCreateExtendedState,
  baseSaveToFile,
  baseSaveToFileHandle,
  baseLoadFromFile,
  baseLoadFromInput,
} from "document-model";
import {
  type InvoiceDocument,
  type InvoiceState,
  type InvoiceLocalState,
} from "./types.js";
import { reducer } from "./reducer.js";

export const initialGlobalState: InvoiceState = {
  invoiceNo: "",
  dateIssued: "",
  dateDue: "",
  dateDelivered: "",
  status: "DRAFT",
  refs: [],
  issuer: {
    id: null,
    name: "",
    address: {
      streetAddress: "",
      extendedAddress: "",
      city: "",
      postalCode: "",
      country: "",
      stateProvince: "",
    },
    contactInfo: {
      tel: "",
      email: "",
    },
    country: "",
    paymentRouting: {
      bank: {
        name: "",
        address: {
          streetAddress: "",
          extendedAddress: "",
          city: "",
          postalCode: "",
          country: "",
          stateProvince: "",
        },
        ABA: "",
        BIC: "",
        SWIFT: "",
        accountNum: "",
        accountType: "CHECKING",
        beneficiary: "",
        intermediaryBank: {
          name: "",
          address: {
            streetAddress: "",
            extendedAddress: "",
            city: "",
            postalCode: "",
            country: "",
            stateProvince: "",
          },
          ABA: "",
          BIC: "",
          SWIFT: "",
          accountNum: "",
          accountType: "CHECKING",
          beneficiary: "",
          memo: "",
        },
        memo: "",
      },
      wallet: {
        rpc: "",
        chainName: "",
        chainId: "",
        address: "",
      },
    },
  },
  payer: {
    id: null,
    name: "",
    address: {
      streetAddress: "",
      extendedAddress: "",
      city: "",
      postalCode: "",
      country: "",
      stateProvince: "",
    },
    contactInfo: {
      tel: "",
      email: "",
    },
    country: "",
    paymentRouting: {
      bank: {
        name: "",
        address: {
          streetAddress: "",
          extendedAddress: "",
          city: "",
          postalCode: "",
          country: "",
          stateProvince: "",
        },
        ABA: "",
        BIC: "",
        SWIFT: "",
        accountNum: "",
        accountType: "CHECKING",
        beneficiary: "",
        intermediaryBank: {
          name: "",
          address: {
            streetAddress: "",
            extendedAddress: "",
            city: "",
            postalCode: "",
            country: "",
            stateProvince: "",
          },
          ABA: "",
          BIC: "",
          SWIFT: "",
          accountNum: "",
          accountType: "CHECKING",
          beneficiary: "",
          memo: "",
        },
        memo: "",
      },
      wallet: {
        rpc: "",
        chainName: "",
        chainId: "",
        address: "",
      },
    },
  },
  currency: "",
  lineItems: [],
  totalPriceTaxExcl: 0,
  totalPriceTaxIncl: 0,
  paymentAccount: "",
};
export const initialLocalState: InvoiceLocalState = {};

const utils: DocumentModelUtils<InvoiceDocument> = {
  fileExtension: ".phdm",
  createState(state) {
    return {
      global: { ...initialGlobalState, ...state?.global },
      local: { ...initialLocalState, ...state?.local },
    };
  },
  createExtendedState(extendedState) {
    return baseCreateExtendedState(
      { ...extendedState, documentType: "powerhouse/invoice" },
      utils.createState,
    );
  },
  createDocument(state) {
    return baseCreateDocument(
      utils.createExtendedState(state),
      utils.createState,
    );
  },
  saveToFile(document, path, name) {
    return baseSaveToFile(document, path, ".phdm", name);
  },
  saveToFileHandle(document, input) {
    return baseSaveToFileHandle(document, input);
  },
  loadFromFile(path) {
    return baseLoadFromFile(path, reducer);
  },
  loadFromInput(input) {
    return baseLoadFromInput(input, reducer);
  },
};

export default utils;
