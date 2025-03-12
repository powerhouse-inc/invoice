import {
  InvoiceState,
  LegalEntity,
  LegalEntityCorporateRegistrationId,
  LegalEntityTaxId,
  Maybe,
} from "../../document-models/invoice";

interface ExportUBLOptions {
  invoice: InvoiceState;
  filename?: string;
  pdfBlob?: Blob;
}

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

export class UBLExporter {
  private invoice: InvoiceState;
  private pdfBlob?: Blob;

  constructor(invoice: InvoiceState, pdfBlob?: Blob) {
    this.invoice = invoice;
    this.pdfBlob = pdfBlob;
  }

  /**
   * Convert the invoice state to UBL XML format
   * @returns UBL XML string
   */
  async convertInvoiceToUBL(): Promise<string> {
    const issueDate = this.formatDate(this.invoice.dateIssued);
    const dueDate = this.formatDate(this.invoice.dateDue);
    const deliveryDate = this.formatDate(this.invoice.dateDelivered);

    // Generate PDF attachment section first
    const pdfAttachmentSection = await this.generatePDFAttachment();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2 UBL-Invoice-2.1.xsd">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
  <cbc:ID>${this.escapeXml(this.invoice.invoiceNo || "")}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  ${dueDate ? `<cbc:DueDate>${dueDate}</cbc:DueDate>` : ""}
  <cbc:InvoiceTypeCode listID="UNCL1001" listAgencyID="6">380</cbc:InvoiceTypeCode>
  ${deliveryDate ? `<cbc:TaxPointDate>${deliveryDate}</cbc:TaxPointDate>` : ""}
  <cbc:DocumentCurrencyCode listID="ISO4217" listAgencyID="6">${this.escapeXml(this.invoice.currency || "USD")}</cbc:DocumentCurrencyCode>
  
  ${pdfAttachmentSection}
  ${this.generateSupplierParty(this.invoice.issuer)}
  ${this.generateCustomerParty(this.invoice.payer)}
  ${this.generatePaymentMeans()}
  ${this.generateTaxSummary()}
  ${this.generateLegalMonetaryTotal()}
  ${this.generateInvoiceLines()}
</Invoice>`;

    return xml;
  }

  /**
   * Export the invoice to a UBL file
   * @param options Export options
   * @returns Promise resolving to the generated file
   */
  async exportToFile({
    filename = "invoice.xml",
  }: { filename?: string } = {}): Promise<File> {
    const ublXml = await this.convertInvoiceToUBL();
    const blob = new Blob([ublXml], { type: "application/xml" });
    return new File([blob], filename, { type: "application/xml" });
  }

  /**
   * Trigger download of the UBL file in the browser
   */
  async downloadUBL(filename = "invoice.xml"): Promise<void> {
    const ublXml = await this.convertInvoiceToUBL();
    const blob = new Blob([ublXml], { type: "application/xml" });

    // Create download link and trigger click
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Format date as YYYY-MM-DD for UBL format
   */
  private formatDate(dateString: string | null): string {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return date.toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  }

  /**
   * Escape special XML characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Generate the AccountingSupplierParty section
   */
  private generateSupplierParty(issuer: LegalEntity | null): string {
    if (!issuer) return "";

    return `<cac:AccountingSupplierParty>
  <cac:Party>
    ${
      issuer.id
        ? `<cac:PartyIdentification>
      <cbc:ID>${this.escapeXml((issuer.id as Maybe<LegalEntityTaxId>)?.taxId || (issuer.id as LegalEntityCorporateRegistrationId)?.corpRegId)}</cbc:ID>
    </cac:PartyIdentification>`
        : ""
    }
    ${
      issuer.name
        ? `<cac:PartyName>
      <cbc:Name>${this.escapeXml(issuer.name)}</cbc:Name>
    </cac:PartyName>`
        : ""
    }
    <cac:PostalAddress>
      ${issuer.address?.streetAddress ? `<cbc:StreetName>${this.escapeXml(issuer.address?.streetAddress)}</cbc:StreetName>` : ""}
      ${issuer.address?.city ? `<cbc:CityName>${this.escapeXml(issuer.address?.city)}</cbc:CityName>` : ""}
      ${issuer.address?.postalCode ? `<cbc:PostalZone>${this.escapeXml(issuer.address?.postalCode)}</cbc:PostalZone>` : ""}
      ${issuer.address?.stateProvince ? `<cbc:CountrySubentity>${this.escapeXml(issuer.address?.stateProvince)}</cbc:CountrySubentity>` : ""}
      ${
        issuer.country
          ? `<cac:Country>
        <cbc:IdentificationCode>${this.escapeXml(issuer.country)}</cbc:IdentificationCode>
      </cac:Country>`
          : ""
      }
    </cac:PostalAddress>
    ${
      issuer.contactInfo?.tel || issuer.contactInfo?.email
        ? `<cac:Contact>
      ${issuer.contactInfo?.tel ? `<cbc:Telephone>${this.escapeXml(issuer.contactInfo?.tel)}</cbc:Telephone>` : ""}
      ${issuer.contactInfo?.email ? `<cbc:ElectronicMail>${this.escapeXml(issuer.contactInfo?.email)}</cbc:ElectronicMail>` : ""}
    </cac:Contact>`
        : ""
    }
  </cac:Party>
</cac:AccountingSupplierParty>`;
  }

  /**
   * Generate the AccountingCustomerParty section
   */
  private generateCustomerParty(payer: LegalEntity | null): string {
    if (!payer) return "";

    return `<cac:AccountingCustomerParty>
  <cac:Party>
    ${
      payer.id
        ? `<cac:PartyIdentification>
      <cbc:ID>${this.escapeXml((payer.id as Maybe<LegalEntityTaxId>)?.taxId || (payer.id as LegalEntityCorporateRegistrationId)?.corpRegId)}</cbc:ID>
    </cac:PartyIdentification>`
        : ""
    }
    ${
      payer.name
        ? `<cac:PartyName>
      <cbc:Name>${this.escapeXml(payer.name)}</cbc:Name>
    </cac:PartyName>`
        : ""
    }
    <cac:PostalAddress>
      ${payer.address?.streetAddress ? `<cbc:StreetName>${this.escapeXml(payer.address?.streetAddress)}</cbc:StreetName>` : ""}
      ${payer.address?.city ? `<cbc:CityName>${this.escapeXml(payer.address?.city)}</cbc:CityName>` : ""}
      ${payer.address?.postalCode ? `<cbc:PostalZone>${this.escapeXml(payer.address?.postalCode)}</cbc:PostalZone>` : ""}
      ${payer.address?.stateProvince ? `<cbc:CountrySubentity>${this.escapeXml(payer.address?.stateProvince)}</cbc:CountrySubentity>` : ""}
      ${
        payer.country
          ? `<cac:Country>
        <cbc:IdentificationCode>${this.escapeXml(payer.country)}</cbc:IdentificationCode>
      </cac:Country>`
          : ""
      }
    </cac:PostalAddress>
    ${
      payer.contactInfo?.tel || payer.contactInfo?.email
        ? `<cac:Contact>
      ${payer.contactInfo?.tel ? `<cbc:Telephone>${this.escapeXml(payer.contactInfo?.tel)}</cbc:Telephone>` : ""}
      ${payer.contactInfo?.email ? `<cbc:ElectronicMail>${this.escapeXml(payer.contactInfo?.email)}</cbc:ElectronicMail>` : ""}
    </cac:Contact>`
        : ""
    }
    ${
      this.invoice.payer?.paymentRouting?.bank?.accountNum
        ? `<cac:FinancialAccount>
      <cbc:ID>${this.escapeXml(this.invoice.payer.paymentRouting.bank.accountNum)}</cbc:ID>
      ${
        this.invoice.payer.paymentRouting.bank.name ||
        this.invoice.payer.paymentRouting.bank.SWIFT
          ? `<cac:FinancialInstitutionBranch>
        <cac:FinancialInstitution>
          ${this.invoice.payer.paymentRouting.bank.name ? `<cbc:Name>${this.escapeXml(this.invoice.payer.paymentRouting.bank.name)}</cbc:Name>` : ""}
          ${this.invoice.payer.paymentRouting.bank.SWIFT ? `<cbc:ID>${this.escapeXml(this.invoice.payer.paymentRouting.bank.SWIFT)}</cbc:ID>` : ""}
        </cac:FinancialInstitution>
      </cac:FinancialInstitutionBranch>`
          : ""
      }
    </cac:FinancialAccount>`
        : ""
    }
  </cac:Party>
</cac:AccountingCustomerParty>`;
  }

  /**
   * Generate the PaymentMeans section with bank details
   */
  private generatePaymentMeans(): string {
    if (
      !this.invoice.issuer?.paymentRouting?.bank?.accountNum &&
      !this.invoice.issuer?.paymentRouting?.wallet?.address
    )
      return "";

    if (this.invoice.issuer?.paymentRouting?.wallet?.address) {
      return `<cac:PaymentMeans>
      <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
      <cac:PayeeFinancialAccount>
        <cbc:ID schemeID="walletAddress">${this.escapeXml(this.invoice.issuer.paymentRouting?.wallet?.address || "")}</cbc:ID>
        <cbc:ID schemeID="chainName">${this.escapeXml(this.invoice.issuer.paymentRouting?.wallet?.chainName || "")}</cbc:ID>
        <cbc:ID schemeID="chainId">${this.escapeXml(this.invoice.issuer.paymentRouting?.wallet?.chainId || "")}</cbc:ID>
      </cac:PayeeFinancialAccount>
    </cac:PaymentMeans>`;
    }

    const bank = this.invoice.issuer?.paymentRouting?.bank;
    if (!bank) return "";

    return `<cac:PaymentMeans>
  <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
  <cac:PayeeFinancialAccount>
    <cbc:ID${bank.accountNum ? ' schemeID="IBAN"' : ""}>${this.escapeXml(bank.accountNum || "")}</cbc:ID>
    ${bank.BIC ? `<cbc:ID schemeID="BIC">${this.escapeXml(bank.BIC)}</cbc:ID>` : ""}
    ${bank.SWIFT ? `<cbc:ID schemeID="SWIFT">${this.escapeXml(bank.SWIFT)}</cbc:ID>` : ""}
    ${bank.ABA ? `<cbc:ID schemeID="ABA">${this.escapeXml(bank.ABA)}</cbc:ID>` : ""}
    ${
      bank.name
        ? `<cac:FinancialInstitutionBranch>
      <cac:FinancialInstitution>
        <cbc:Name>${this.escapeXml(bank.name)}</cbc:Name>
      ${bank.address?.streetAddress ? `<cbc:StreetName schemeID="streetAddress">${this.escapeXml(bank.address.streetAddress)}</cbc:StreetName>` : ""}
      ${bank.address?.extendedAddress ? `<cbc:AdditionalStreetName schemeID="extendedAddress">${this.escapeXml(bank.address.extendedAddress)}</cbc:AdditionalStreetName>` : ""}
      ${bank.address?.city ? `<cbc:CityName schemeID="city">${this.escapeXml(bank.address.city)}</cbc:CityName>` : ""}
      ${bank.address?.stateProvince ? `<cbc:CountrySubentity schemeID="stateProvince">${this.escapeXml(bank.address.stateProvince)}</cbc:CountrySubentity>` : ""}
      ${bank.address?.postalCode ? `<cbc:PostalZone schemeID="postalCode">${this.escapeXml(bank.address.postalCode)}</cbc:PostalZone>` : ""}
      ${bank.address?.country ? `<cac:Country><cbc:IdentificationCode schemeID="country">${this.escapeXml(bank.address.country)}</cbc:IdentificationCode></cac:Country>` : ""}
      </cac:FinancialInstitution>
    </cac:FinancialInstitutionBranch>`
        : ""
    }
  </cac:PayeeFinancialAccount>
</cac:PaymentMeans>`;
  }

  /**
   * Generate tax summary section
   */
  private generateTaxSummary(): string {
    const taxGroups = new Map<number, number>();

    // Group tax amounts by tax rate
    for (const item of this.invoice.lineItems) {
      const taxRate = item.taxPercent;
      const taxAmount = item.totalPriceTaxIncl - item.totalPriceTaxExcl;
      
      if (taxGroups.has(taxRate)) {
        taxGroups.set(taxRate, (taxGroups.get(taxRate) || 0) + taxAmount);
      } else {
        taxGroups.set(taxRate, taxAmount);
      }
    }

    if (taxGroups.size === 0) return "";

    const taxTotalAmount = Array.from(taxGroups.values()).reduce(
      (sum, amount) => sum + amount,
      0
    );

    // Add tax totals
    let xml = `<cac:TaxTotal>
<cbc:TaxAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${formatNumber(taxTotalAmount)}</cbc:TaxAmount>`;

    // Add tax subtotals for each tax rate
    const taxSubtotals: Record<
      string,
      { taxableAmount: number; taxAmount: number }
    > = {};

    for (const item of this.invoice.lineItems) {
      const taxRate = item.taxPercent.toString();
      const taxableAmount = item.totalPriceTaxExcl;
      const taxAmount = item.totalPriceTaxIncl - item.totalPriceTaxExcl;

      if (taxSubtotals[taxRate]) {
        taxSubtotals[taxRate].taxableAmount += taxableAmount;
        taxSubtotals[taxRate].taxAmount += taxAmount;
      } else {
        taxSubtotals[taxRate] = { taxableAmount, taxAmount };
      }
    }

    // Add tax subtotals for each tax rate
    for (const [taxRate, { taxableAmount, taxAmount }] of Object.entries(
      taxSubtotals,
    )) {
      xml += `
<cac:TaxSubtotal>
<cbc:TaxableAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${formatNumber(taxableAmount)}</cbc:TaxableAmount>
<cbc:TaxAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${formatNumber(taxAmount)}</cbc:TaxAmount>
<cac:TaxCategory>
<cbc:ID>S</cbc:ID>
<cbc:Percent>${taxRate}</cbc:Percent>
<cac:TaxScheme>
<cbc:ID>VAT</cbc:ID>
</cac:TaxScheme>
</cac:TaxCategory>
</cac:TaxSubtotal>`;
    }

    xml += `
</cac:TaxTotal>`;

    return xml;
  }

  /**
   * Generate the LegalMonetaryTotal section
   */
  private generateLegalMonetaryTotal(): string {
    // Calculate totals
    const lineExtensionAmount = this.invoice.lineItems.reduce(
      (sum, item) => sum + item.totalPriceTaxExcl,
      0,
    );

    const taxExclusiveAmount = lineExtensionAmount;

    const taxInclusiveAmount = this.invoice.lineItems.reduce(
      (sum, item) => sum + item.totalPriceTaxIncl,
      0,
    );

    const payableAmount = taxInclusiveAmount;

    return `<cac:LegalMonetaryTotal>
  <cbc:LineExtensionAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${formatNumber(lineExtensionAmount)}</cbc:LineExtensionAmount>
  <cbc:TaxExclusiveAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${formatNumber(taxExclusiveAmount)}</cbc:TaxExclusiveAmount>
  <cbc:TaxInclusiveAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${formatNumber(taxInclusiveAmount)}</cbc:TaxInclusiveAmount>
  <cbc:PayableAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${formatNumber(payableAmount)}</cbc:PayableAmount>
</cac:LegalMonetaryTotal>`;
  }

  /**
   * Generate InvoiceLine sections for each line item
   */
  private generateInvoiceLines(): string {
    if (!this.invoice.lineItems.length) return "";

    return this.invoice.lineItems
      .map((item, index) => {
        const lineId = item.id || (index + 1).toString();
        const currency = this.escapeXml(
          item.currency || this.invoice.currency || "USD",
        );
        const taxAmount = item.totalPriceTaxIncl - item.totalPriceTaxExcl;

        return `<cac:InvoiceLine>
  <cbc:ID>${this.escapeXml(lineId)}</cbc:ID>
  <cbc:InvoicedQuantity unitCode="ZZ" unitCodeListID="UNECERec20">${item.quantity}</cbc:InvoicedQuantity>
  <cbc:LineExtensionAmount currencyID="${currency}">${formatNumber(item.totalPriceTaxExcl)}</cbc:LineExtensionAmount>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${formatNumber(taxAmount)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:Item>
    <cbc:Description>${this.escapeXml(item.description || "")}</cbc:Description>
    <cbc:Name>${this.escapeXml(item.description || "")}</cbc:Name>
    <cac:ClassifiedTaxCategory>
      <cbc:ID schemeID="UNCL5305">S</cbc:ID>
      <cbc:Percent>${item.taxPercent || 0}</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID schemeID="UN/ECE 5153">VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:ClassifiedTaxCategory>
  </cac:Item>
  <cac:Price>
    <cbc:PriceAmount currencyID="${currency}">${formatNumber(item.unitPriceTaxExcl)}</cbc:PriceAmount>
  </cac:Price>
</cac:InvoiceLine>`;
      })
      .join("\n");
  }

  /**
   * Generate PDF attachment section if a PDF blob is available
   */
  private async generatePDFAttachment(): Promise<string> {
    if (!this.pdfBlob) return "";
    
    try {
      // Convert PDF blob to base64
      const base64Data = await this.blobToBase64(this.pdfBlob);
      const filename = `${this.invoice.invoiceNo || "invoice"}.pdf`;
      
      return `<cac:AdditionalDocumentReference>
  <cbc:ID>${filename}</cbc:ID>
  <cbc:DocumentType>PrimaryImage</cbc:DocumentType>
  <cac:Attachment>
    <cbc:EmbeddedDocumentBinaryObject mimeCode="application/pdf" filename="${filename}">
      ${base64Data}
    </cbc:EmbeddedDocumentBinaryObject>
  </cac:Attachment>
</cac:AdditionalDocumentReference>`;
    } catch (error) {
      console.error("Error embedding PDF in UBL:", error);
      return "";
    }
  }
  
  /**
   * Convert a Blob to base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove data URL prefix if present
        const base64Content = base64data.split(',')[1] || base64data;
        resolve(base64Content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

/**
 * Export an invoice to UBL format
 * @param options Export options
 * @returns Promise resolving to the generated file
 */
export async function exportToUBL({
  invoice,
  filename = "invoice.xml",
  pdfBlob,
}: ExportUBLOptions): Promise<File> {
  const exporter = new UBLExporter(invoice, pdfBlob);
  return exporter.exportToFile({ filename });
}

/**
 * Export and download an invoice as UBL
 * @param options Export options
 */
export async function downloadUBL({
  invoice,
  filename = "invoice.xml",
  pdfBlob,
}: ExportUBLOptions): Promise<void> {
  const exporter = new UBLExporter(invoice, pdfBlob);
  return exporter.downloadUBL(filename);
}
