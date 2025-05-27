import { z } from "zod";
import type {
  AddLineItemInput,
  AddRefInput,
  Address,
  Bank,
  ContactInfo,
  DeleteLineItemInput,
  DeleteRefInput,
  EditInvoiceInput,
  EditIssuerBankInput,
  EditIssuerInput,
  EditIssuerWalletInput,
  EditLineItemInput,
  EditPayerBankInput,
  EditPayerInput,
  EditPayerWalletInput,
  EditRefInput,
  EditStatusInput,
  IntermediaryBank,
  InvoiceAccountType,
  InvoiceAccountTypeInput,
  InvoiceLineItem,
  InvoiceLineItemTag,
  InvoiceState,
  InvoiceWallet,
  LegalEntity,
  LegalEntityCorporateRegistrationId,
  LegalEntityTaxId,
  PaymentRouting,
  Ref,
  SetLineItemTagInput,
  SetPaymentAccountInput,
  Status,
  Token,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const InvoiceAccountTypeSchema = z.enum([
  "CHECKING",
  "SAVINGS",
  "TRUST",
  "WALLET",
]);

export const InvoiceAccountTypeInputSchema = z.enum([
  "CHECKING",
  "SAVINGS",
  "TRUST",
  "WALLET",
]);

export const StatusSchema = z.enum([
  "ACCEPTED",
  "AWAITINGPAYMENT",
  "CANCELLED",
  "DRAFT",
  "ISSUED",
  "PAYMENTISSUE",
  "PAYMENTRECEIVED",
  "PAYMENTSCHEDULED",
  "PAYMENTSENT",
  "REJECTED",
]);

export function AddLineItemInputSchema(): z.ZodObject<
  Properties<AddLineItemInput>
> {
  return z.object({
    currency: z.string(),
    description: z.string(),
    id: z.string(),
    quantity: z.number(),
    taxPercent: z.number(),
    totalPriceTaxExcl: z.number(),
    totalPriceTaxIncl: z.number(),
    unitPriceTaxExcl: z.number(),
    unitPriceTaxIncl: z.number(),
  });
}

export function AddRefInputSchema(): z.ZodObject<Properties<AddRefInput>> {
  return z.object({
    id: z.string(),
    value: z.string(),
  });
}

export function AddressSchema(): z.ZodObject<Properties<Address>> {
  return z.object({
    __typename: z.literal("Address").optional(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    extendedAddress: z.string().nullable(),
    postalCode: z.string().nullable(),
    stateProvince: z.string().nullable(),
    streetAddress: z.string().nullable(),
  });
}

export function BankSchema(): z.ZodObject<Properties<Bank>> {
  return z.object({
    __typename: z.literal("Bank").optional(),
    ABA: z.string().nullable(),
    BIC: z.string().nullable(),
    SWIFT: z.string().nullable(),
    accountNum: z.string(),
    accountType: InvoiceAccountTypeSchema.nullable(),
    address: AddressSchema(),
    beneficiary: z.string().nullable(),
    intermediaryBank: IntermediaryBankSchema().nullable(),
    memo: z.string().nullable(),
    name: z.string(),
  });
}

export function ContactInfoSchema(): z.ZodObject<Properties<ContactInfo>> {
  return z.object({
    __typename: z.literal("ContactInfo").optional(),
    email: z.string().nullable(),
    tel: z.string().nullable(),
  });
}

export function DeleteLineItemInputSchema(): z.ZodObject<
  Properties<DeleteLineItemInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DeleteRefInputSchema(): z.ZodObject<
  Properties<DeleteRefInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function EditInvoiceInputSchema(): z.ZodObject<
  Properties<EditInvoiceInput>
> {
  return z.object({
    currency: z.string().nullish(),
    dateDelivered: z.string().nullish(),
    dateDue: z.string().nullish(),
    dateIssued: z.string().nullish(),
    invoiceNo: z.string().nullish(),
  });
}

export function EditIssuerBankInputSchema(): z.ZodObject<
  Properties<EditIssuerBankInput>
> {
  return z.object({
    ABA: z.string().nullish(),
    ABAIntermediary: z.string().nullish(),
    BIC: z.string().nullish(),
    BICIntermediary: z.string().nullish(),
    SWIFT: z.string().nullish(),
    SWIFTIntermediary: z.string().nullish(),
    accountNum: z.string().nullish(),
    accountNumIntermediary: z.string().nullish(),
    accountType: z.lazy(() => InvoiceAccountTypeInputSchema.nullish()),
    accountTypeIntermediary: z.lazy(() =>
      InvoiceAccountTypeInputSchema.nullish(),
    ),
    beneficiary: z.string().nullish(),
    beneficiaryIntermediary: z.string().nullish(),
    city: z.string().nullish(),
    cityIntermediary: z.string().nullish(),
    country: z.string().nullish(),
    countryIntermediary: z.string().nullish(),
    extendedAddress: z.string().nullish(),
    extendedAddressIntermediary: z.string().nullish(),
    memo: z.string().nullish(),
    memoIntermediary: z.string().nullish(),
    name: z.string().nullish(),
    nameIntermediary: z.string().nullish(),
    postalCode: z.string().nullish(),
    postalCodeIntermediary: z.string().nullish(),
    stateProvince: z.string().nullish(),
    stateProvinceIntermediary: z.string().nullish(),
    streetAddress: z.string().nullish(),
    streetAddressIntermediary: z.string().nullish(),
  });
}

export function EditIssuerInputSchema(): z.ZodObject<
  Properties<EditIssuerInput>
> {
  return z.object({
    city: z.string().nullish(),
    country: z.string().nullish(),
    email: z.string().nullish(),
    extendedAddress: z.string().nullish(),
    id: z.string().nullish(),
    name: z.string().nullish(),
    postalCode: z.string().nullish(),
    stateProvince: z.string().nullish(),
    streetAddress: z.string().nullish(),
    tel: z.string().nullish(),
  });
}

export function EditIssuerWalletInputSchema(): z.ZodObject<
  Properties<EditIssuerWalletInput>
> {
  return z.object({
    address: z.string().nullish(),
    chainId: z.string().nullish(),
    chainName: z.string().nullish(),
    rpc: z.string().nullish(),
  });
}

export function EditLineItemInputSchema(): z.ZodObject<
  Properties<EditLineItemInput>
> {
  return z.object({
    currency: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    quantity: z.number().nullish(),
    taxPercent: z.number().nullish(),
    totalPriceTaxExcl: z.number().nullish(),
    totalPriceTaxIncl: z.number().nullish(),
    unitPriceTaxExcl: z.number().nullish(),
    unitPriceTaxIncl: z.number().nullish(),
  });
}

export function EditPayerBankInputSchema(): z.ZodObject<
  Properties<EditPayerBankInput>
> {
  return z.object({
    ABA: z.string().nullish(),
    ABAIntermediary: z.string().nullish(),
    BIC: z.string().nullish(),
    BICIntermediary: z.string().nullish(),
    SWIFT: z.string().nullish(),
    SWIFTIntermediary: z.string().nullish(),
    accountNum: z.string().nullish(),
    accountNumIntermediary: z.string().nullish(),
    accountType: z.lazy(() => InvoiceAccountTypeInputSchema.nullish()),
    accountTypeIntermediary: z.lazy(() =>
      InvoiceAccountTypeInputSchema.nullish(),
    ),
    beneficiary: z.string().nullish(),
    beneficiaryIntermediary: z.string().nullish(),
    city: z.string().nullish(),
    cityIntermediary: z.string().nullish(),
    country: z.string().nullish(),
    countryIntermediary: z.string().nullish(),
    extendedAddress: z.string().nullish(),
    extendedAddressIntermediary: z.string().nullish(),
    memo: z.string().nullish(),
    memoIntermediary: z.string().nullish(),
    name: z.string().nullish(),
    nameIntermediary: z.string().nullish(),
    postalCode: z.string().nullish(),
    postalCodeIntermediary: z.string().nullish(),
    stateProvince: z.string().nullish(),
    stateProvinceIntermediary: z.string().nullish(),
    streetAddress: z.string().nullish(),
    streetAddressIntermediary: z.string().nullish(),
  });
}

export function EditPayerInputSchema(): z.ZodObject<
  Properties<EditPayerInput>
> {
  return z.object({
    city: z.string().nullish(),
    country: z.string().nullish(),
    email: z.string().nullish(),
    extendedAddress: z.string().nullish(),
    id: z.string().nullish(),
    name: z.string().nullish(),
    postalCode: z.string().nullish(),
    stateProvince: z.string().nullish(),
    streetAddress: z.string().nullish(),
    tel: z.string().nullish(),
  });
}

export function EditPayerWalletInputSchema(): z.ZodObject<
  Properties<EditPayerWalletInput>
> {
  return z.object({
    address: z.string().nullish(),
    chainId: z.string().nullish(),
    chainName: z.string().nullish(),
    rpc: z.string().nullish(),
  });
}

export function EditRefInputSchema(): z.ZodObject<Properties<EditRefInput>> {
  return z.object({
    id: z.string(),
    value: z.string(),
  });
}

export function EditStatusInputSchema(): z.ZodObject<
  Properties<EditStatusInput>
> {
  return z.object({
    status: StatusSchema,
  });
}

export function IntermediaryBankSchema(): z.ZodObject<
  Properties<IntermediaryBank>
> {
  return z.object({
    __typename: z.literal("IntermediaryBank").optional(),
    ABA: z.string().nullable(),
    BIC: z.string().nullable(),
    SWIFT: z.string().nullable(),
    accountNum: z.string(),
    accountType: InvoiceAccountTypeSchema.nullable(),
    address: AddressSchema(),
    beneficiary: z.string().nullable(),
    memo: z.string().nullable(),
    name: z.string(),
  });
}

export function InvoiceLineItemSchema(): z.ZodObject<
  Properties<InvoiceLineItem>
> {
  return z.object({
    __typename: z.literal("InvoiceLineItem").optional(),
    currency: z.string(),
    description: z.string(),
    id: z.string(),
    lineItemTag: z.array(InvoiceLineItemTagSchema()),
    quantity: z.number(),
    taxPercent: z.number(),
    totalPriceTaxExcl: z.number(),
    totalPriceTaxIncl: z.number(),
    unitPriceTaxExcl: z.number(),
    unitPriceTaxIncl: z.number(),
  });
}

export function InvoiceLineItemTagSchema(): z.ZodObject<
  Properties<InvoiceLineItemTag>
> {
  return z.object({
    __typename: z.literal("InvoiceLineItemTag").optional(),
    dimension: z.string(),
    label: z.string().nullable(),
    value: z.string(),
  });
}

export function InvoiceStateSchema(): z.ZodObject<Properties<InvoiceState>> {
  return z.object({
    __typename: z.literal("InvoiceState").optional(),
    currency: z.string(),
    dateDelivered: z.string().nullable(),
    dateDue: z.string(),
    dateIssued: z.string(),
    invoiceNo: z.string(),
    issuer: LegalEntitySchema(),
    lineItems: z.array(InvoiceLineItemSchema()),
    payer: LegalEntitySchema(),
    paymentAccount: z.string().nullable(),
    refs: z.array(RefSchema()),
    status: StatusSchema,
    totalPriceTaxExcl: z.number(),
    totalPriceTaxIncl: z.number(),
  });
}

export function InvoiceWalletSchema(): z.ZodObject<Properties<InvoiceWallet>> {
  return z.object({
    __typename: z.literal("InvoiceWallet").optional(),
    address: z.string().nullable(),
    chainId: z.string().nullable(),
    chainName: z.string().nullable(),
    rpc: z.string().nullable(),
  });
}

export function LegalEntitySchema(): z.ZodObject<Properties<LegalEntity>> {
  return z.object({
    __typename: z.literal("LegalEntity").optional(),
    address: AddressSchema().nullable(),
    contactInfo: ContactInfoSchema().nullable(),
    country: z.string().nullable(),
    id: LegalEntityIdSchema().nullable(),
    name: z.string().nullable(),
    paymentRouting: PaymentRoutingSchema().nullable(),
  });
}

export function LegalEntityCorporateRegistrationIdSchema(): z.ZodObject<
  Properties<LegalEntityCorporateRegistrationId>
> {
  return z.object({
    __typename: z.literal("LegalEntityCorporateRegistrationId").optional(),
    corpRegId: z.string(),
  });
}

export function LegalEntityIdSchema() {
  return z.union([
    LegalEntityCorporateRegistrationIdSchema(),
    LegalEntityTaxIdSchema(),
  ]);
}

export function LegalEntityTaxIdSchema(): z.ZodObject<
  Properties<LegalEntityTaxId>
> {
  return z.object({
    __typename: z.literal("LegalEntityTaxId").optional(),
    taxId: z.string(),
  });
}

export function PaymentRoutingSchema(): z.ZodObject<
  Properties<PaymentRouting>
> {
  return z.object({
    __typename: z.literal("PaymentRouting").optional(),
    bank: BankSchema().nullable(),
    wallet: InvoiceWalletSchema().nullable(),
  });
}

export function RefSchema(): z.ZodObject<Properties<Ref>> {
  return z.object({
    __typename: z.literal("Ref").optional(),
    id: z.string(),
    value: z.string(),
  });
}

export function SetLineItemTagInputSchema(): z.ZodObject<
  Properties<SetLineItemTagInput>
> {
  return z.object({
    dimension: z.string(),
    id: z.string(),
    label: z.string().nullish(),
    value: z.string(),
  });
}

export function SetPaymentAccountInputSchema(): z.ZodObject<
  Properties<SetPaymentAccountInput>
> {
  return z.object({
    paymentAccount: z.string(),
  });
}

export function TokenSchema(): z.ZodObject<Properties<Token>> {
  return z.object({
    __typename: z.literal("Token").optional(),
    chainId: z.string().nullable(),
    chainName: z.string().nullable(),
    evmAddress: z.string().nullable(),
    rpc: z.string().nullable(),
    symbol: z.string().nullable(),
  });
}
