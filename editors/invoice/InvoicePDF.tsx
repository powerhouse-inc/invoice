import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { InvoiceState } from "../../document-models/invoice";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
  },
  invoiceNumber: {
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: 70,
    color: "#4B5563", // text-gray-600
    fontSize: 10,
  },
  value: {
    flex: 1,
    fontSize: 10,
  },
  gridContainer: {
    flexDirection: "row",
    gap: 5,
    marginTop: 20,
  },
  gridColumn: {
    flex: 1,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6", // bg-gray-100
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB", // border-gray-200
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 8,
    fontSize: 10,
  },
  tableCol40: {
    width: "40%",
  },
  tableCol15: {
    width: "15%",
  },
  totals: {
    marginTop: 20,
    marginRight: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  totalLabel: {
    marginRight: 8,
    color: "#4B5563",
    fontSize: 14,
  },
  totalValue: {
    minWidth: 100,
    textAlign: "right",
    fontSize: 14,
  },
  status: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 4,
  },
  paymentSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1F2937",
  },
  paymentRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
});

// Format date to readable string
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format currency
const formatCurrency = (amount: number, currency: string) => {
  // Format number with appropriate decimal places
  const formattedAmount = formatNumber(amount);
  return `${formattedAmount} ${currency}`;
};

// Helper function to format numbers with appropriate decimal places
function formatNumber(value: number): string {
  // Check if the value has decimal places
  const hasDecimals = value % 1 !== 0;
  
  // If no decimals or only trailing zeros after 2 decimal places, show 2 decimal places
  if (!hasDecimals || (value.toFixed(5).endsWith('000'))) {
    return value.toFixed(2);
  }
  
  // Otherwise, show actual decimal places up to 5
  const stringValue = value.toString();
  const decimalPart = stringValue.split('.')[1] || '';
  
  // Determine how many decimal places to show (up to 5)
  const decimalPlaces = Math.min(Math.max(2, decimalPart.length), 5);
  return value.toFixed(decimalPlaces);
}

interface InvoicePDFProps {
  invoice: InvoiceState;
  fiatMode: boolean;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoice,
  fiatMode,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Text style={[styles.title, { marginBottom: 0 }]}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNo}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Text style={[styles.title, { marginBottom: 0, fontSize: 10 }]}>
              Status:
            </Text>
            <Text style={styles.status}>{invoice.status}</Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          <InvoiceSection
            title="Issuer"
            data={{
              ...invoice.issuer,
              dateDue: invoice.dateDue,
              dateIssued: invoice.dateIssued,
            }}
          />
          <InvoiceSection
            title="Payer"
            data={{
              ...invoice.payer,
              dateDue: invoice.dateDue,
              dateIssued: invoice.dateIssued,
            }}
          />
        </View>

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Information</Text>
          <InvoiceField label="Currency" value={invoice.currency} />
          {fiatMode ? (
            <PaymentSectionFiat
              paymentRouting={invoice.issuer.paymentRouting}
            />
          ) : (
            <PaymentSectionCrypto
              paymentRouting={invoice.issuer.paymentRouting}
            />
          )}
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol40}>Description</Text>
            <Text style={styles.tableCol15}>Quantity</Text>
            <Text style={styles.tableCol15}>Unit Price</Text>
            <Text style={styles.tableCol15}>Tax</Text>
            <Text style={styles.tableCol15}>Total</Text>
          </View>
          {invoice.lineItems.map((item, index) => (
            <InvoiceLineItem
              key={index}
              item={item}
              currency={invoice.currency}
            />
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(
                invoice.lineItems.reduce(
                  (sum, item) => sum + item.quantity * item.unitPriceTaxExcl,
                  0,
                ),
                invoice.currency,
              )}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total (incl. tax):</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(
                invoice.lineItems.reduce(
                  (sum, item) => sum + item.quantity * item.unitPriceTaxIncl,
                  0,
                ),
                invoice.currency,
              )}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// New component for issuer and payer sections
const InvoiceSection: React.FC<{ title: string; data: any }> = ({
  title,
  data,
}) => (
  <View style={styles.gridColumn}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {title === "Issuer" && (
      <>
        <InvoiceField label="Issue Date" value={formatDate(data.dateIssued)} />
        <InvoiceField label="Delivery Date" value={formatDate(data.dateDue)} />
      </>
    )}
    {title === "Payer" && (
      <InvoiceField label="Due Date" value={formatDate(data.dateDue)} />
    )}
    <InvoiceField label="Name" value={data.name} />
    <InvoiceField
      label={data.id?.taxId ? "Tax ID" : data.id?.corpRegId ? "Corp. Reg" : ""}
      value={data.id?.taxId || data.id?.corpRegId || ""}
    />
    <InvoiceField label="Address" value={data.address?.streetAddress || ""} />
    <InvoiceField label="City" value={data.address?.city || ""} />
    <InvoiceField label="Country" value={data.address?.country || ""} />
    <InvoiceField label="Email" value={data.contactInfo?.email || ""} />
  </View>
);

// New component for individual fields
const InvoiceField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) =>
  value && (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

// New component for fiat payment section
const PaymentSectionFiat: React.FC<{ paymentRouting: any }> = ({
  paymentRouting,
}) => (
  <View style={[styles.gridContainer, { marginTop: 0 }]}>
    <View style={styles.gridColumn}>
      <InvoiceField label="Bank Name" value={paymentRouting.bank?.name || ""} />
      <InvoiceField
        label="Address"
        value={paymentRouting.bank?.address?.streetAddress || ""}
      />
      <InvoiceField
        label="City"
        value={paymentRouting.bank?.address?.city || ""}
      />
      <InvoiceField
        label="Country"
        value={paymentRouting.bank?.address?.country || ""}
      />
      <InvoiceField
        label="Extended Address"
        value={paymentRouting.bank?.address?.extendedAddress || ""}
      />
      <InvoiceField
        label="Postal Code"
        value={paymentRouting.bank?.address?.postalCode || ""}
      />
      <InvoiceField
        label="State/Province"
        value={paymentRouting.bank?.address?.stateProvince || ""}
      />
    </View>
    <View style={styles.gridColumn}>
      <InvoiceField
        label="Account Type"
        value={paymentRouting.bank?.accountType || ""}
      />
      <InvoiceField
        label="Account Nr"
        value={paymentRouting.bank?.accountNum || ""}
      />
      <InvoiceField
        label="Beneficiary"
        value={paymentRouting.bank?.beneficiary || ""}
      />
      <InvoiceField
        label={
          paymentRouting.bank?.BIC
            ? "BIC:"
            : paymentRouting.bank?.SWIFT
              ? "SWIFT:"
              : paymentRouting.bank?.ABA
                ? "ABA:"
                : "Routing:"
        }
        value={
          paymentRouting.bank?.BIC ||
          paymentRouting.bank?.SWIFT ||
          paymentRouting.bank?.ABA ||
          ""
        }
      />
    </View>
  </View>
);

// New component for crypto payment section
const PaymentSectionCrypto: React.FC<{ paymentRouting: any }> = ({
  paymentRouting,
}) => (
  <View style={styles.row}>
    <View style={styles.gridColumn}>
      <InvoiceField
        label="Chain"
        value={paymentRouting.wallet?.chainName || ""}
      />
      <InvoiceField
        label="Address"
        value={paymentRouting.wallet?.address || ""}
      />
    </View>
  </View>
);

// New component for line items
const InvoiceLineItem: React.FC<{ item: any; currency: string }> = ({
  item,
  currency,
}) => (
  <View style={styles.tableRow}>
    <Text style={styles.tableCol40}>{item.description}</Text>
    <Text style={styles.tableCol15}>{item.quantity}</Text>
    <Text style={styles.tableCol15}>
      {formatCurrency(item.unitPriceTaxExcl, currency)}
    </Text>
    <Text style={styles.tableCol15}>
      {formatCurrency(item.unitPriceTaxIncl - item.unitPriceTaxExcl, currency)}
    </Text>
    <Text style={styles.tableCol15}>
      {formatCurrency(item.quantity * item.unitPriceTaxIncl, currency)}
    </Text>
  </View>
);
