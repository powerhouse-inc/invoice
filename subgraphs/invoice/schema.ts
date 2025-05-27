import { gql } from "graphql-tag";
import type { DocumentNode } from "graphql";

export const schema: DocumentNode = gql`
  """
  Subgraph definition for Invoice (powerhouse/invoice)
  """
  type InvoiceState {
    invoiceNo: String!
    dateIssued: String!
    dateDue: String!
    dateDelivered: String
    status: Status!
    refs: [Ref!]!
    issuer: LegalEntity!
    payer: LegalEntity!
    currency: String!
    lineItems: [InvoiceLineItem!]!
    totalPriceTaxExcl: Float!
    totalPriceTaxIncl: Float!
    paymentAccount: String
  }

  type Ref {
    id: OID!
    value: String!
  }

  type Token {
    evmAddress: String
    symbol: String
    chainName: String
    chainId: String
    rpc: String
  }

  type LegalEntity {
    id: LegalEntityId
    name: String
    address: Address
    contactInfo: ContactInfo
    country: String
    paymentRouting: PaymentRouting
  }

  type Address {
    streetAddress: String
    extendedAddress: String
    city: String
    postalCode: String
    country: String
    stateProvince: String
  }

  type ContactInfo {
    tel: String
    email: String
  }

  type PaymentRouting {
    bank: Bank
    wallet: InvoiceWallet
  }

  type Bank {
    name: String!
    address: Address!
    ABA: String
    BIC: String
    SWIFT: String
    accountNum: String!
    accountType: InvoiceAccountType
    beneficiary: String
    intermediaryBank: IntermediaryBank
    memo: String
  }

  type IntermediaryBank {
    name: String!
    address: Address!
    ABA: String
    BIC: String
    SWIFT: String
    accountNum: String!
    accountType: InvoiceAccountType
    beneficiary: String
    memo: String
  }

  type InvoiceWallet {
    rpc: String
    chainName: String
    chainId: String
    address: String
  }

  type InvoiceLineItem {
    id: OID!
    description: String!
    taxPercent: Float!
    quantity: Float!
    currency: String!
    unitPriceTaxExcl: Float!
    unitPriceTaxIncl: Float!
    totalPriceTaxExcl: Float!
    totalPriceTaxIncl: Float!
    lineItemTag: [InvoiceLineItemTag!]!
  }

  type InvoiceLineItemTag {
    dimension: String!
    value: String!
    label: String
  }

  union LegalEntityId = LegalEntityTaxId | LegalEntityCorporateRegistrationId

  type LegalEntityTaxId {
    taxId: String!
  }

  type LegalEntityCorporateRegistrationId {
    corpRegId: String!
  }

  enum Status {
    DRAFT
    ISSUED
    CANCELLED
    ACCEPTED
    REJECTED
    AWAITINGPAYMENT
    PAYMENTSCHEDULED
    PAYMENTSENT
    PAYMENTISSUE
    PAYMENTRECEIVED
  }

  enum InvoiceAccountType {
    CHECKING
    SAVINGS
    TRUST
    WALLET
  }

  enum InvoiceAccountTypeInput {
    CHECKING
    SAVINGS
    TRUST
    WALLET
  }

  """
  Queries: Invoice
  """
  type InvoiceQueries {
    getDocument(driveId: String, docId: PHID): Invoice
    getDocuments: [Invoice!]
  }

  type Query {
    Invoice: InvoiceQueries
  }

  """
  Mutations: Invoice
  """
  type Mutation {
    Invoice_createDocument(driveId: String, name: String): String

    Invoice_editInvoice(
      driveId: String
      docId: PHID
      input: Invoice_EditInvoiceInput
    ): Int
    Invoice_editStatus(
      driveId: String
      docId: PHID
      input: Invoice_EditStatusInput
    ): Int
    Invoice_addRef(
      driveId: String
      docId: PHID
      input: Invoice_AddRefInput
    ): Int
    Invoice_editRef(
      driveId: String
      docId: PHID
      input: Invoice_EditRefInput
    ): Int
    Invoice_deleteRef(
      driveId: String
      docId: PHID
      input: Invoice_DeleteRefInput
    ): Int
    Invoice_setPaymentAccount(
      driveId: String
      docId: PHID
      input: Invoice_SetPaymentAccountInput
    ): Int
    Invoice_editIssuer(
      driveId: String
      docId: PHID
      input: Invoice_EditIssuerInput
    ): Int
    Invoice_editIssuerBank(
      driveId: String
      docId: PHID
      input: Invoice_EditIssuerBankInput
    ): Int
    Invoice_editIssuerWallet(
      driveId: String
      docId: PHID
      input: Invoice_EditIssuerWalletInput
    ): Int
    Invoice_editPayer(
      driveId: String
      docId: PHID
      input: Invoice_EditPayerInput
    ): Int
    Invoice_editPayerBank(
      driveId: String
      docId: PHID
      input: Invoice_EditPayerBankInput
    ): Int
    Invoice_editPayerWallet(
      driveId: String
      docId: PHID
      input: Invoice_EditPayerWalletInput
    ): Int
    Invoice_addLineItem(
      driveId: String
      docId: PHID
      input: Invoice_AddLineItemInput
    ): Int
    Invoice_editLineItem(
      driveId: String
      docId: PHID
      input: Invoice_EditLineItemInput
    ): Int
    Invoice_deleteLineItem(
      driveId: String
      docId: PHID
      input: Invoice_DeleteLineItemInput
    ): Int
    Invoice_setLineItemTag(
      driveId: String
      docId: PHID
      input: Invoice_SetLineItemTagInput
    ): Int
    Invoice_uploadInvoicePdfChunk(
      chunk: String!
      chunkIndex: Int!
      totalChunks: Int!
      fileName: String!
      sessionId: String!
    ): UploadInvoicePdfChunkResult!
    Invoice_createRequestFinancePayment(
      paymentData: JSON!
    ): CreateRequestFinancePaymentResult!
    Invoice_processGnosisPayment(
      payerWallet: JSON!
      paymentDetails: JSON!
      invoiceNo: String!
    ): ProcessGnosisPaymentResult
  }

  """
  Result type for PDF chunk upload
  """
  type UploadInvoicePdfChunkResult {
    success: Boolean!
    data: JSON
    error: String
  }

  """
  Result type for request finance payment request
  """
  type CreateRequestFinancePaymentResult {
    success: Boolean!
    data: JSON
    error: String
  }

  """
  Result type for process gnosis payment
  """
  type ProcessGnosisPaymentResult {
    success: Boolean!
    data: JSON
    error: String
  }

  scalar JSON

  """
  Module: General
  """
  input Invoice_EditInvoiceInput {
    invoiceNo: String
    dateIssued: String
    dateDue: String
    dateDelivered: String
    currency: String
  }
  input Invoice_EditStatusInput {
    status: Status!
  }
  input Invoice_AddRefInput {
    id: OID!
    value: String!
  }
  input Invoice_EditRefInput {
    id: OID!
    value: String!
  }
  input Invoice_DeleteRefInput {
    id: OID!
  }
  input Invoice_SetPaymentAccountInput {
    paymentAccount: String!
  }

  """
  Module: Parties
  """
  input Invoice_EditIssuerInput {
    id: String
    name: String
    streetAddress: String
    extendedAddress: String
    city: String
    postalCode: String
    country: String
    stateProvince: String
    tel: String
    email: String
  }
  input Invoice_EditIssuerBankInput {
    name: String
    streetAddress: String
    extendedAddress: String
    city: String
    postalCode: String
    country: String
    stateProvince: String
    ABA: String
    BIC: String
    SWIFT: String
    accountNum: String
    accountType: InvoiceAccountTypeInput
    beneficiary: String
    memo: String
    # intermediaryBank
    nameIntermediary: String
    streetAddressIntermediary: String
    extendedAddressIntermediary: String
    cityIntermediary: String
    postalCodeIntermediary: String
    countryIntermediary: String
    stateProvinceIntermediary: String
    ABAIntermediary: String
    BICIntermediary: String
    SWIFTIntermediary: String
    accountNumIntermediary: String
    accountTypeIntermediary: InvoiceAccountTypeInput
    beneficiaryIntermediary: String
    memoIntermediary: String
  }
  input Invoice_EditIssuerWalletInput {
    rpc: String
    chainName: String
    chainId: String
    address: String
  }

  input Invoice_EditPayerInput {
    id: String
    name: String
    streetAddress: String
    extendedAddress: String
    city: String
    postalCode: String
    country: String
    stateProvince: String
    tel: String
    email: String
  }
  input Invoice_EditPayerBankInput {
    name: String
    streetAddress: String
    extendedAddress: String
    city: String
    postalCode: String
    country: String
    stateProvince: String
    ABA: String
    BIC: String
    SWIFT: String
    accountNum: String
    accountType: InvoiceAccountTypeInput
    beneficiary: String
    memo: String
    # intermediaryBank
    nameIntermediary: String
    streetAddressIntermediary: String
    extendedAddressIntermediary: String
    cityIntermediary: String
    postalCodeIntermediary: String
    countryIntermediary: String
    stateProvinceIntermediary: String
    ABAIntermediary: String
    BICIntermediary: String
    SWIFTIntermediary: String
    accountNumIntermediary: String
    accountTypeIntermediary: InvoiceAccountTypeInput
    beneficiaryIntermediary: String
    memoIntermediary: String
  }
  input Invoice_EditPayerWalletInput {
    rpc: String
    chainName: String
    chainId: String
    address: String
  }

  """
  Module: Items
  """
  input Invoice_AddLineItemInput {
    id: OID!
    description: String!
    taxPercent: Float!
    quantity: Float!
    currency: String! # Default can be USD
    unitPriceTaxExcl: Float!
    unitPriceTaxIncl: Float!
    totalPriceTaxExcl: Float!
    totalPriceTaxIncl: Float!
  }
  input Invoice_EditLineItemInput {
    id: OID!
    description: String
    taxPercent: Float
    quantity: Float
    currency: String
    unitPriceTaxExcl: Float
    unitPriceTaxIncl: Float
    totalPriceTaxExcl: Float
    totalPriceTaxIncl: Float
  }
  input Invoice_DeleteLineItemInput {
    id: OID!
  }
  input Invoice_SetLineItemTagInput {
    id: OID!
    dimension: String!
    value: String!
    label: String
  }
`;
