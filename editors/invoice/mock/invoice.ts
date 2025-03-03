import { InvoiceState } from "document-models/invoice";

const mockInvoiceState: InvoiceState = {
  currency: "USD",
  dateDelivered: "2024-12-15",
  dateDue: "2024-12-31",
  dateIssued: "2024-12-01",
  invoiceNo: "INV-2024-001",
  issuer: {
    name: "Tech Solutions Ltd",
    country: "USA",
    id: {
      corpRegId: "CR789012345",
    },
    address: {
      streetAddress: "123 Innovation Drive",
      extendedAddress: "Suite 400",
      city: "San Francisco",
      stateProvince: "CA",
      postalCode: "94105",
      country: "USA",
    },
    contactInfo: {
      email: "billing@techsolutions.com",
      tel: "+1-415-555-0123",
    },
    paymentRouting: {
      bank: {
        name: "Pacific Bank",
        accountNum: "987654321",
        accountType: "CHECKING",
        ABA: "121000358",
        SWIFT: "PACAUS6S",
        BIC: null,
        beneficiary: "Tech Solutions Ltd",
        address: {
          streetAddress: "456 Financial Ave",
          extendedAddress: null,
          city: "San Francisco",
          stateProvince: "CA",
          postalCode: "94104",
          country: "USA",
        },
        memo: "Direct payment for services",
        intermediaryBank: null,
      },
      wallet: null,
    },
  },

  payer: {
    name: "Global Enterprises Inc",
    country: "USA",
    id: {
      taxId: "TAX456789012",
    },
    address: {
      streetAddress: "789 Corporate Blvd",
      extendedAddress: null,
      city: "New York",
      stateProvince: "NY",
      postalCode: "10001",
      country: "USA",
    },
    contactInfo: {
      email: "accounts@globalenterprises.com",
      tel: "+1-212-555-0123",
    },
    paymentRouting: null,
  },

  lineItems: [
    {
      id: "LI001",
      description: "Software Development Services",
      quantity: 160.0,
      unitPriceTaxExcl: 150.0,
      unitPriceTaxIncl: 165.0,
      totalPriceTaxExcl: 24000.0,
      totalPriceTaxIncl: 26400.0,
      taxPercent: 10.0,
      currency: "USD",
    },
    {
      id: "LI002",
      description: "Cloud Infrastructure Setup",
      quantity: 1.0,
      unitPriceTaxExcl: 5000.0,
      unitPriceTaxIncl: 5500.0,
      totalPriceTaxExcl: 5000.0,
      totalPriceTaxIncl: 5500.0,
      taxPercent: 10.0,
      currency: "USD",
    },
  ],

  refs: [
    {
      id: "REF001",
      value: "PO-2024-456",
    },
    {
      id: "REF002",
      value: "PROJECT-Q4-2024",
    },
  ],

  status: "ISSUED",

  totalPriceTaxExcl: 29000.0,
  totalPriceTaxIncl: 31900.0,
};

export default mockInvoiceState;
