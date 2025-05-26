import type { DocumentModelState } from "document-model";

export const documentModel: DocumentModelState = {
  id: "powerhouse/invoice",
  name: "Invoice",
  extension: ".phdm",
  description:
    "Invoice document model that allows a contributor to request compensations based on his contributions",
  author: {
    name: "Powerhouse",
    website: "https://powerhouse.inc",
  },
  specifications: [
    {
      version: 1,
      changeLog: [],
      state: {
        global: {
          schema:
            "type InvoiceState {\n  invoiceNo: String!\n  dateIssued: String!\n  dateDue: String!\n  dateDelivered: String\n  status: Status!\n  refs: [Ref!]!\n  issuer: LegalEntity!\n  payer: LegalEntity!\n  currency: String!\n  lineItems: [InvoiceLineItem!]!\n  totalPriceTaxExcl: Float!\n  totalPriceTaxIncl: Float!\n}\n\ntype Ref {\n  id: OID!\n  value: String!\n}\n\ntype Token {\n  evmAddress: String\n  symbol: String\n  chainName: String\n  chainId: String\n  rpc: String\n}\n\ntype LegalEntity {\n  id: LegalEntityId\n  name: String\n  address: Address\n  contactInfo: ContactInfo\n  country: String\n  paymentRouting: PaymentRouting\n}\n\ntype Address {\n  streetAddress: String\n  extendedAddress: String\n  city: String\n  postalCode: String\n  country: String\n  stateProvince: String\n}\n\ntype ContactInfo {\n  tel: String\n  email: String\n}\n\ntype PaymentRouting {\n  bank: Bank\n  wallet: InvoiceWallet\n}\n\ntype Bank {\n  name: String!\n  address: Address!\n  ABA: String\n  BIC: String\n  SWIFT: String\n  accountNum: String!\n  accountType: InvoiceAccountType\n  beneficiary: String\n  intermediaryBank: IntermediaryBank\n  memo: String\n}\n\ntype IntermediaryBank {\n  name: String!\n  address: Address!\n  ABA: String\n  BIC: String\n  SWIFT: String\n  accountNum: String!\n  accountType: InvoiceAccountType\n  beneficiary: String\n  memo: String\n}\n\ntype InvoiceWallet {\n  rpc: String\n  chainName: String\n  chainId: String\n  address: String\n}\n\ntype InvoiceLineItem {\n  id: OID!\n  description: String!\n  taxPercent: Float!\n  quantity: Float!\n  currency: String!\n  unitPriceTaxExcl: Float!\n  unitPriceTaxIncl: Float!\n  totalPriceTaxExcl: Float!\n  totalPriceTaxIncl: Float!\n}\n\nunion LegalEntityId = LegalEntityTaxId | LegalEntityCorporateRegistrationId\n\ntype LegalEntityTaxId {\n  taxId: String!\n}\n\ntype LegalEntityCorporateRegistrationId {\n  corpRegId: String!\n}\n\nenum Status {\n  DRAFT\n  ISSUED\n  CANCELLED\n  ACCEPTED\n  REJECTED\n  AWAITINGPAYMENT\n  PAYMENTSCHEDULED\n  PAYMENTSENT\n  PAYMENTISSUE\n  PAYMENTRECEIVED\n}\n\nenum InvoiceAccountType {\n  CHECKING\n  SAVINGS\n  TRUST\n  WALLET\n}\n\nenum InvoiceAccountTypeInput {\n  CHECKING\n  SAVINGS\n  TRUST\n  WALLET\n}",
          initialValue:
            '"{\\n  \\"invoiceNo\\": \\"\\",\\n  \\"dateIssued\\": \\"\\",\\n  \\"dateDue\\": \\"\\",\\n  \\"dateDelivered\\": \\"\\",\\n  \\"status\\": \\"DRAFT\\",\\n  \\"refs\\": [],\\n  \\"issuer\\": {\\n    \\"id\\": null,\\n    \\"name\\": \\"\\",\\n    \\"address\\": {\\n      \\"streetAddress\\": \\"\\",\\n      \\"extendedAddress\\": \\"\\",\\n      \\"city\\": \\"\\",\\n      \\"postalCode\\": \\"\\",\\n      \\"country\\": \\"\\",\\n      \\"stateProvince\\": \\"\\"\\n    },\\n    \\"contactInfo\\": {\\n      \\"tel\\": \\"\\",\\n      \\"email\\": \\"\\"\\n    },\\n    \\"country\\": \\"\\",\\n    \\"paymentRouting\\": {\\n      \\"bank\\": {\\n        \\"name\\": \\"\\",\\n        \\"address\\": {\\n          \\"streetAddress\\": \\"\\",\\n          \\"extendedAddress\\": \\"\\",\\n          \\"city\\": \\"\\",\\n          \\"postalCode\\": \\"\\",\\n          \\"country\\": \\"\\",\\n          \\"stateProvince\\": \\"\\"\\n        },\\n        \\"ABA\\": \\"\\",\\n        \\"BIC\\": \\"\\",\\n        \\"SWIFT\\": \\"\\",\\n        \\"accountNum\\": \\"\\",\\n        \\"accountType\\": \\"CHECKING\\",\\n        \\"beneficiary\\": \\"\\",\\n        \\"intermediaryBank\\": {\\n          \\"name\\": \\"\\",\\n          \\"address\\": {\\n            \\"streetAddress\\": \\"\\",\\n            \\"extendedAddress\\": \\"\\",\\n            \\"city\\": \\"\\",\\n            \\"postalCode\\": \\"\\",\\n            \\"country\\": \\"\\",\\n            \\"stateProvince\\": \\"\\"\\n          },\\n          \\"ABA\\": \\"\\",\\n          \\"BIC\\": \\"\\",\\n          \\"SWIFT\\": \\"\\",\\n          \\"accountNum\\": \\"\\",\\n          \\"accountType\\": \\"CHECKING\\",\\n          \\"beneficiary\\": \\"\\",\\n          \\"memo\\": \\"\\"\\n        },\\n        \\"memo\\": \\"\\"\\n      },\\n      \\"wallet\\": {\\n        \\"rpc\\": \\"\\",\\n        \\"chainName\\": \\"\\",\\n        \\"chainId\\": \\"\\",\\n        \\"address\\": \\"\\"\\n      }\\n    }\\n  },\\n  \\"payer\\": {\\n    \\"id\\": null,\\n    \\"name\\": \\"\\",\\n    \\"address\\": {\\n      \\"streetAddress\\": \\"\\",\\n      \\"extendedAddress\\": \\"\\",\\n      \\"city\\": \\"\\",\\n      \\"postalCode\\": \\"\\",\\n      \\"country\\": \\"\\",\\n      \\"stateProvince\\": \\"\\"\\n    },\\n    \\"contactInfo\\": {\\n      \\"tel\\": \\"\\",\\n      \\"email\\": \\"\\"\\n    },\\n    \\"country\\": \\"\\",\\n    \\"paymentRouting\\": {\\n      \\"bank\\": {\\n        \\"name\\": \\"\\",\\n        \\"address\\": {\\n          \\"streetAddress\\": \\"\\",\\n          \\"extendedAddress\\": \\"\\",\\n          \\"city\\": \\"\\",\\n          \\"postalCode\\": \\"\\",\\n          \\"country\\": \\"\\",\\n          \\"stateProvince\\": \\"\\"\\n        },\\n        \\"ABA\\": \\"\\",\\n        \\"BIC\\": \\"\\",\\n        \\"SWIFT\\": \\"\\",\\n        \\"accountNum\\": \\"\\",\\n        \\"accountType\\": \\"CHECKING\\",\\n        \\"beneficiary\\": \\"\\",\\n        \\"intermediaryBank\\": {\\n          \\"name\\": \\"\\",\\n          \\"address\\": {\\n            \\"streetAddress\\": \\"\\",\\n            \\"extendedAddress\\": \\"\\",\\n            \\"city\\": \\"\\",\\n            \\"postalCode\\": \\"\\",\\n            \\"country\\": \\"\\",\\n            \\"stateProvince\\": \\"\\"\\n          },\\n          \\"ABA\\": \\"\\",\\n          \\"BIC\\": \\"\\",\\n          \\"SWIFT\\": \\"\\",\\n          \\"accountNum\\": \\"\\",\\n          \\"accountType\\": \\"CHECKING\\",\\n          \\"beneficiary\\": \\"\\",\\n          \\"memo\\": \\"\\"\\n        },\\n        \\"memo\\": \\"\\"\\n      },\\n      \\"wallet\\": {\\n        \\"rpc\\": \\"\\",\\n        \\"chainName\\": \\"\\",\\n        \\"chainId\\": \\"\\",\\n        \\"address\\": \\"\\"\\n      }\\n    }\\n  },\\n  \\"currency\\": \\"\\",\\n  \\"lineItems\\": [],\\n  \\"totalPriceTaxExcl\\": 0,\\n  \\"totalPriceTaxIncl\\": 0\\n}"',
          examples: [],
        },
        local: {
          schema: "",
          initialValue: '""',
          examples: [],
        },
      },
      modules: [
        {
          id: "WDJ7NWCy8TEDk1TWvr0F+VXvIqc=",
          name: "general",
          description: "",
          operations: [
            {
              id: "8Ld7B60Upub1CNmVrx3TMzmyl54=",
              name: "EDIT_INVOICE",
              description: "",
              schema:
                "input EditInvoiceInput {\n    invoiceNo: String\n    dateIssued: String\n    dateDue: String\n    dateDelivered: String\n    currency: String\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "cCXTmSu1J8VoyDQAk9l/ub3SjWw=",
              name: "EDIT_STATUS",
              description: "",
              schema: "input EditStatusInput {\n  status: Status!\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "1OkChgHSA5jIpjIGS6MVVxGyfM8=",
              name: "ADD_REF",
              description: "",
              schema:
                "input AddRefInput {\n    id: OID!\n    value: String!\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "581o1DMt70KKGjJ2r71DvorNcXA=",
              name: "EDIT_REF",
              description: "",
              schema:
                "input EditRefInput {\n    id: OID!\n    value: String!\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "1a8Gp073BABmS4Qg7ydVPhHQYoA=",
              name: "DELETE_REF",
              description: "",
              schema: "input DeleteRefInput {\n  id: OID!\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "M8OqnRBEHn6EHQTyrx826u5xAJg=",
          name: "parties",
          description: "",
          operations: [
            {
              id: "HSnSU0WWJ8ytXGtuYqKPy8mccB4=",
              name: "EDIT_ISSUER",
              description: "",
              schema:
                "input EditIssuerInput {\n    id: String\n    name: String\n    streetAddress: String\n    extendedAddress: String\n    city: String\n    postalCode: String\n    country: String\n    stateProvince: String\n    tel: String\n    email: String\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "nq2GFV2bmGet6sNlA2XytS7cPA0=",
              name: "EDIT_ISSUER_BANK",
              description: "",
              schema:
                "input EditIssuerBankInput {\n  name: String\n    streetAddress: String\n    extendedAddress: String\n    city: String\n    postalCode: String\n    country: String\n    stateProvince: String\n    ABA: String\n    BIC: String\n    SWIFT: String\n    accountNum: String\n    accountType: InvoiceAccountTypeInput\n    beneficiary: String\n    memo: String\n    # intermediaryBank\n    nameIntermediary: String\n    streetAddressIntermediary: String\n    extendedAddressIntermediary: String\n    cityIntermediary: String\n    postalCodeIntermediary: String\n    countryIntermediary: String\n    stateProvinceIntermediary: String\n    ABAIntermediary: String\n    BICIntermediary: String\n    SWIFTIntermediary: String\n    accountNumIntermediary: String\n    accountTypeIntermediary: InvoiceAccountTypeInput\n    beneficiaryIntermediary: String\n    memoIntermediary: String\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "XtXz6W0lScsBwPkaWofR9LtWjm0=",
              name: "EDIT_ISSUER_WALLET",
              description: "",
              schema:
                "input EditIssuerWalletInput {\n    rpc: String\n    chainName: String\n    chainId: String\n    address: String\n}\n\n",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "Lt7r5VNsfyWZhAlm/g3VY0buEhM=",
              name: "EDIT_PAYER",
              description: "",
              schema:
                "input EditPayerInput {\n    id: String\n    name: String\n    streetAddress: String\n    extendedAddress: String\n    city: String\n    postalCode: String\n    country: String\n    stateProvince: String\n    tel: String\n    email: String\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "Ibn3ArEEpicKLmrfE37zsq78Qeg=",
              name: "EDIT_PAYER_BANK",
              description: "",
              schema:
                "input EditPayerBankInput {\n    name: String\n    streetAddress: String\n    extendedAddress: String\n    city: String\n    postalCode: String\n    country: String\n    stateProvince: String\n    ABA: String\n    BIC: String\n    SWIFT: String\n    accountNum: String\n    accountType: InvoiceAccountTypeInput\n    beneficiary: String\n    memo: String\n    # intermediaryBank\n    nameIntermediary: String\n    streetAddressIntermediary: String\n    extendedAddressIntermediary: String\n    cityIntermediary: String\n    postalCodeIntermediary: String\n    countryIntermediary: String\n    stateProvinceIntermediary: String\n    ABAIntermediary: String\n    BICIntermediary: String\n    SWIFTIntermediary: String\n    accountNumIntermediary: String\n    accountTypeIntermediary: InvoiceAccountTypeInput\n    beneficiaryIntermediary: String\n    memoIntermediary: String\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "uEdf8IAGEgC8tiZRKn9WI4O/7KY=",
              name: "EDIT_PAYER_WALLET",
              description: "",
              schema:
                "input EditPayerWalletInput {\n    rpc: String\n    chainName: String\n    chainId: String\n    address: String\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
        {
          id: "V6qGoeW+8RP3CHE0XQiBYOy4EKI=",
          name: "items",
          description: "",
          operations: [
            {
              id: "+Y7o2f0Ht0lsDpoR9FlQwEwzaFU=",
              name: "ADD_LINE_ITEM",
              description: "",
              schema:
                "input AddLineItemInput {\n    id: OID!\n    description: String!\n    taxPercent: Float!\n    quantity: Float!\n    currency: String! # Default can be USD\n    unitPriceTaxExcl: Float!\n    unitPriceTaxIncl: Float!\n    totalPriceTaxExcl: Float!\n    totalPriceTaxIncl: Float!\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "PCi10xZY1UKyAAsV/etTfQSULa0=",
              name: "EDIT_LINE_ITEM",
              description: "",
              schema:
                "input EditLineItemInput {\n    id: OID!\n    description: String\n    taxPercent: Float\n    quantity: Float\n    currency: String\n    unitPriceTaxExcl: Float\n    unitPriceTaxIncl: Float\n    totalPriceTaxExcl: Float\n    totalPriceTaxIncl: Float\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
            {
              id: "E9/QRfqZQuNXj/f2sO2HeEjojUI=",
              name: "DELETE_LINE_ITEM",
              description: "",
              schema: "input DeleteLineItemInput {\n  id: OID!\n}",
              template: "",
              reducer: "",
              errors: [],
              examples: [],
              scope: "global",
            },
          ],
        },
      ],
    },
  ],
};
