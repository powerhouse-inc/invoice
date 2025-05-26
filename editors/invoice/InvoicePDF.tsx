import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { InvoiceState } from "../../document-models/invoice/index.js";
import powerhouseLogo from "./assets/powerhouseLogo.png";
import countries from "world-countries";

type Country = {
  name: {
    common: string;
    official: string;
    native?: Record<string, { common: string; official: string }>;
  };
  cca2: string;
};
const countriesArray = countries as unknown as Country[];

function getCountryName(countryCode: string) {
  const country = countriesArray.find((c) => c.cca2 === countryCode);
  return country?.name.common;
}

// Create styles
const styles = StyleSheet.create({
  defaultText: {
    fontFamily: "Helvetica", // Built-in font as fallback
  },
  pageBackground: {
    backgroundColor: "#f8fafc",
  },
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 15,
    margin: 15,
    height: "92%",
    borderRadius: 15,
    borderColor: "#fcfbfb",
    borderWidth: 0.5,
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
    fontFamily: "Helvetica",
  },
  invoiceNumber: {
    fontSize: 12,
    marginLeft: 0,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    marginBottom: 5,
    fontSize: 14,
    marginRight: 4,
    fontFamily: "Helvetica",
    color: "#9ea0a2",
    fontWeight: "normal",
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
    marginHorizontal: 5,
    marginTop: 20,
  },
  gridColumn: {
    flex: 2,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    fontSize: 10,
    textTransform: "uppercase",
    color: "#9ea0a2",
    fontWeight: "normal",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0,
    padding: 8,
    fontSize: 10,
    alignItems: "flex-start",
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#374151",
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "normal",
  },
  tableCol40: {
    width: "40%",
    paddingRight: 8,
  },
  tableCol15: {
    width: "15%",
    textAlign: "right",
  },
  totals: {
    marginTop: 20,
    marginRight: 0,
    alignItems: "flex-end",
    width: "100%",
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "flex-end",
    width: "100%",
  },
  totalLabel: {
    marginRight: 8,
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "normal",
    width: 120,
    textAlign: "right",
  },
  totalValue: {
    minWidth: 100,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "normal",
    color: "#374151",
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
    marginTop: 8,
    width: "100%",
  },
  totalLabelBold: {
    marginRight: 8,
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    width: 120,
    textAlign: "right",
  },
  totalValueBold: {
    minWidth: 100,
    textAlign: "right",
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  status: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 4,
  },
  totalAmount: {
    fontSize: 25,
    paddingTop: 7,
    fontWeight: "bold",
    color: "#black",
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
  logo: {
    width: 170,
    marginTop: -15,
    marginLeft: -15,
  },
  statusLabel: {
    fontSize: 14,
    marginTop: -13,
    fontFamily: "Helvetica",
    fontWeight: "normal",
    color: "#9ea0a2",
    marginRight: 4,
  },
  invoiceLabel: {
    fontSize: 14,
    marginRight: 4,
    marginBottom: 4,
    fontFamily: "Helvetica",
    color: "#9ea0a2",
    fontWeight: "normal",
  },
  companyInfo: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 4,
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  termsTitle: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 4,
    fontFamily: "Helvetica",
  },
  termsText: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "normal",
    fontFamily: "Helvetica",
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
  if (!hasDecimals || value.toFixed(5).endsWith("000")) {
    return Number(value.toFixed(2)).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Otherwise, show actual decimal places up to 5
  const stringValue = value.toString();
  const decimalPart = stringValue.split(".")[1] || "";

  // Determine how many decimal places to show (up to 5)
  const decimalPlaces = Math.min(Math.max(2, decimalPart.length), 5);
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
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
      <Page size="A4" style={styles.pageBackground}>
        <View style={styles.page}>
          {/* Top Row: Logo (left) and Invoice of (right) */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <Image style={styles.logo} src={powerhouseLogo} />
              <View>
                <Text style={styles.invoiceLabel}>Invoice number</Text>
                <Text style={styles.invoiceNumber}>{invoice.invoiceNo}</Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.invoiceLabel}>
                Invoice of ({invoice.currency})
              </Text>
              <Text
                style={[
                  styles.invoiceNumber,
                  { fontSize: 24, fontWeight: "bold" },
                ]}
              >
                {formatNumber(invoice.totalPriceTaxIncl)}
              </Text>
            </View>
          </View>

          {/* Issuer and Payer Information */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 40,
            }}
          >
            {/* Issuer */}
            <View style={{ width: "45%" }}>
              <Text style={styles.sectionTitle}>Issuer</Text>
              <Text style={styles.companyName}>{invoice.issuer.name}</Text>
              <Text style={styles.companyInfo}>
                {invoice.issuer.address?.streetAddress || ""}
              </Text>
              {invoice.issuer.address?.extendedAddress && (
                <Text style={styles.companyInfo}>
                  {invoice.issuer.address?.extendedAddress || ""}
                </Text>
              )}
              <Text style={styles.companyInfo}>
                {invoice.issuer.address?.city || ""},{" "}
                {getCountryName(invoice.issuer.address?.country || "") || ""} -{" "}
                {invoice.issuer.address?.postalCode || "00000"}
              </Text>
              {invoice.issuer.contactInfo?.email && (
                <Text style={styles.companyInfo}>
                  {invoice.issuer.contactInfo.email}
                </Text>
              )}
            </View>

            {/* Payer */}
            <View style={{ width: "45%" }}>
              <Text style={styles.sectionTitle}>Payer</Text>
              <Text style={styles.companyName}>{invoice.payer.name}</Text>
              <Text style={styles.companyInfo}>
                {invoice.payer.address?.streetAddress || ""}
              </Text>
              {invoice.payer.address?.extendedAddress && (
                <Text style={styles.companyInfo}>
                  {invoice.payer.address?.extendedAddress || ""}
                </Text>
              )}
              <Text style={styles.companyInfo}>
                {invoice.payer.address?.city || ""},{" "}
                {getCountryName(invoice.payer.address?.country || "") || ""} -{" "}
                {invoice.payer.address?.postalCode || "00000"}
              </Text>
              {invoice.payer.contactInfo?.email && (
                <Text style={styles.companyInfo}>
                  {invoice.payer.contactInfo.email}
                </Text>
              )}
            </View>

            {/* Invoice details (right) */}
            <View style={{ width: "30%", alignItems: "flex-end", textAlign: "right" }}>
              <View style={{ marginBottom: 18, width: "100%" }}>
                <Text style={{ color: "#9ea0a2", fontSize: 14, textAlign: "right", fontFamily: "Helvetica", fontWeight: "normal" }}>Invoice date</Text>
                <Text style={{ fontWeight: 4, fontSize: 14, textAlign: "right", color: "#000", fontFamily: "Helvetica" }}>
                  {formatDate(invoice.dateIssued)}
                </Text>
              </View>
              <View style={{ marginBottom: 18, width: "100%" }}>
                <Text style={{ color: "#9ea0a2", fontSize: 14, textAlign: "right", fontFamily: "Helvetica", fontWeight: "normal" }}>Due date</Text>
                <Text style={{ fontWeight: 4, fontSize: 14, textAlign: "right", color: "#000", fontFamily: "Helvetica" }}>
                  {formatDate(invoice.dateDue)}
                </Text>
              </View>
              {fiatMode && (
                <View style={{ marginBottom: 18, width: "100%" }}>
                  <Text style={{ color: "#9ea0a2", fontSize: 14, textAlign: "right", fontFamily: "Helvetica", fontWeight: "normal" }}>Account Type:</Text>
                  <Text style={{ fontWeight: 4, fontSize: 14, textAlign: "right", color: "#000", fontFamily: "Helvetica" }}>
                    {invoice.issuer.paymentRouting?.bank?.accountType || "CHECKING"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Payment Information */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
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
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  invoice.lineItems.reduce(
                    (sum, item) => sum + item.quantity * item.unitPriceTaxExcl,
                    0
                  ),
                  invoice.currency
                )}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  invoice.lineItems.reduce(
                    (sum, item) => sum + item.quantity * (item.unitPriceTaxIncl - item.unitPriceTaxExcl),
                    0
                  ),
                  invoice.currency
                )}
              </Text>
            </View>
            <View style={styles.totalRowBold}>
              <Text style={styles.totalLabelBold}>Total</Text>
              <Text style={styles.totalValueBold}>
                {formatCurrency(
                  invoice.lineItems.reduce(
                    (sum, item) => sum + item.quantity * item.unitPriceTaxIncl,
                    0
                  ),
                  invoice.currency
                )}
              </Text>
            </View>
          </View>
        </View>
        {/* Terms & Conditions */}
        <View style={{ marginLeft: 40 }}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>Please pay within 30 days of receiving this invoice.</Text>
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
        <InvoiceField
          label="Delivery Date"
          value={formatDate(data.dateDelivered)}
        />
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
    <InvoiceField
      label="Country"
      value={getCountryName(data.address?.country || "") || ""}
    />
    <InvoiceField label="Email" value={data.contactInfo?.email || ""} />
  </View>
);

{
  /* New component for individual fields */
}
const InvoiceField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) =>
  value && (
    <View style={styles.row}>
      {/* <Text style={styles.label}>{label}:</Text> */}
      <Text style={styles.value}>{value}</Text>
    </View>
  );

{
  /* New component for fiat payment section */
}
const PaymentSectionFiat: React.FC<{ paymentRouting: any }> = ({
  paymentRouting,
}) => (
  <View style={[styles.gridContainer, { marginTop: 0 }]}>
    <View style={styles.gridColumn}>
      <Text style={styles.companyName}>{paymentRouting.bank?.name || ""}</Text>
      <Text style={styles.companyInfo}>{paymentRouting.bank?.address?.streetAddress || ""}</Text>
      {paymentRouting.bank?.address?.extendedAddress && (
        <Text style={styles.companyInfo}>{paymentRouting.bank?.address?.extendedAddress}</Text>
      )}
      <Text style={styles.companyInfo}>
        {paymentRouting.bank?.address?.city || ""}, {getCountryName(paymentRouting.bank?.address?.country || "") || ""} - {paymentRouting.bank?.address?.postalCode || ""}
      </Text>
    </View>
    <View style={styles.gridColumn}>
      <Text style={styles.companyName}>{paymentRouting.bank?.beneficiary || ""}</Text>
      <Text style={styles.companyInfo}>{paymentRouting.bank?.accountNum || ""}</Text>
      <Text style={styles.companyInfo}>{paymentRouting.bank?.accountType || ""}</Text>
      <Text style={styles.companyInfo}>
        {paymentRouting.bank?.BIC || paymentRouting.bank?.SWIFT || paymentRouting.bank?.ABA || ""}
      </Text>
    </View>
  </View>
);

{
  /* New component for crypto payment section */
}
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

{
  /* New component for line items */
}
const InvoiceLineItem: React.FC<{ item: any; currency: string }> = ({
  item,
  currency,
}) => (
  <View style={styles.tableRow}>
    <View style={styles.tableCol40}>
      <Text style={styles.itemName}>{item.description}</Text>
      {item.longDescription && (
        <Text style={styles.itemDescription}>{item.longDescription}</Text>
      )}
    </View>
    <Text style={styles.tableCol15}>{item.quantity}</Text>
    <Text style={styles.tableCol15}>{formatCurrency(item.unitPriceTaxExcl, currency)}</Text>
    <Text style={styles.tableCol15}>{formatCurrency(item.unitPriceTaxIncl - item.unitPriceTaxExcl, currency)}</Text>
    <Text style={styles.tableCol15}>{formatCurrency(item.quantity * item.unitPriceTaxIncl, currency)}</Text>
  </View>
);
