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
}

export class UBLExporter {
  private invoice: InvoiceState;

  constructor(invoice: InvoiceState) {
    this.invoice = invoice;
  }

  /**
   * Convert the invoice state to UBL XML format
   * @returns UBL XML string
   */
  convertInvoiceToUBL(): string {
    const issueDate = this.formatDate(this.invoice.dateIssued);
    const dueDate = this.formatDate(this.invoice.dateDue);
    const deliveryDate = this.formatDate(this.invoice.dateDelivered);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
  <cbc:ID>${this.escapeXml(this.invoice.invoiceNo || "")}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  ${dueDate ? `<cbc:DueDate>${dueDate}</cbc:DueDate>` : ""}
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  ${deliveryDate ? `<cbc:TaxPointDate>${deliveryDate}</cbc:TaxPointDate>` : ""}
  <cbc:DocumentCurrencyCode>${this.escapeXml(this.invoice.currency || "USD")}</cbc:DocumentCurrencyCode>
  
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
    const ublXml = this.convertInvoiceToUBL();
    const blob = new Blob([ublXml], { type: "application/xml" });
    return new File([blob], filename, { type: "application/xml" });
  }

  /**
   * Trigger download of the UBL file in the browser
   */
  async downloadUBL(filename = "invoice.xml"): Promise<void> {
    const ublXml = this.convertInvoiceToUBL();
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
        <cbc:ID schemeID="walletAddress">${this.escapeXml(this.invoice.issuer.paymentRouting?.wallet.address)}</cbc:ID>
        <cbc:ID schemeID="chainName">${this.escapeXml(this.invoice.issuer.paymentRouting?.wallet.chainName || "")}</cbc:ID>
        <cbc:ID schemeID="chainId">${this.escapeXml(this.invoice.issuer.paymentRouting?.wallet.chainId || "")}</cbc:ID>
      </cac:PayeeFinancialAccount>
    </cac:PaymentMeans>`;
    }

    return `<cac:PaymentMeans>
  <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
  <cac:PayeeFinancialAccount>
    <cbc:ID${this.invoice.issuer.paymentRouting?.bank.accountNum ? ' schemeID="IBAN"' : ""}>${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.accountNum)}</cbc:ID>
    ${this.invoice.issuer.paymentRouting?.bank.BIC ? `<cbc:ID schemeID="BIC">${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.BIC)}</cbc:ID>` : ""}
    ${this.invoice.issuer.paymentRouting?.bank.SWIFT ? `<cbc:ID schemeID="SWIFT">${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.SWIFT)}</cbc:ID>` : ""}
    ${this.invoice.issuer.paymentRouting?.bank.ABA ? `<cbc:ID schemeID="ABA">${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.ABA)}</cbc:ID>` : ""}
    ${
      this.invoice.issuer.paymentRouting?.bank.name
        ? `<cac:FinancialInstitutionBranch>
      <cac:FinancialInstitution>
        <cbc:Name>${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.name)}</cbc:Name>
      ${this.invoice.issuer.paymentRouting?.bank.address?.streetAddress ? `<cbc:StreetName schemeID="streetAddress">${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.address.streetAddress)}</cbc:StreetName>` : ""}
      ${this.invoice.issuer.paymentRouting?.bank.address?.extendedAddress ? `<cbc:AdditionalStreetName schemeID="extendedAddress">${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.address.extendedAddress)}</cbc:AdditionalStreetName>` : ""}
      ${this.invoice.issuer.paymentRouting?.bank.address?.city ? `<cbc:CityName schemeID="city">${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.address.city)}</cbc:CityName>` : ""}
      ${this.invoice.issuer.paymentRouting?.bank.address?.stateProvince ? `<cbc:CountrySubentity schemeID="stateProvince">${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.address.stateProvince)}</cbc:CountrySubentity>` : ""}
      ${this.invoice.issuer.paymentRouting?.bank.address?.postalCode ? `<cbc:PostalZone schemeID="postalCode">${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.address.postalCode)}</cbc:PostalZone>` : ""}
      ${this.invoice.issuer.paymentRouting?.bank.address?.country ? `<cac:Country><cbc:IdentificationCode schemeID="country">${this.escapeXml(this.invoice.issuer.paymentRouting?.bank.address.country)}</cbc:IdentificationCode></cac:Country>` : ""}
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
    // Group line items by tax percentage
    const taxGroups = new Map<number, number>();

    this.invoice.lineItems.forEach((item) => {
      const taxPercent = item.taxPercent || 0;
      const taxAmount = item.totalPriceTaxIncl - item.totalPriceTaxExcl;

      if (taxGroups.has(taxPercent)) {
        taxGroups.set(taxPercent, taxGroups.get(taxPercent)! + taxAmount);
      } else {
        taxGroups.set(taxPercent, taxAmount);
      }
    });

    // If no tax groups, return empty string
    if (taxGroups.size === 0) return "";

    let taxTotal = `<cac:TaxTotal>
  <cbc:TaxAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${Array.from(
    taxGroups.values(),
  )
    .reduce((sum, amount) => sum + amount, 0)
    .toFixed(2)}</cbc:TaxAmount>`;

    // Add tax subtotals for each tax rate
    for (const [taxPercent, taxAmount] of taxGroups.entries()) {
      // Calculate taxable amount (base amount before tax)
      const taxableAmount = this.invoice.lineItems
        .filter((item) => (item.taxPercent || 0) === taxPercent)
        .reduce((sum, item) => sum + item.totalPriceTaxExcl, 0);

      taxTotal += `
  <cac:TaxSubtotal>
    <cbc:TaxableAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${taxableAmount.toFixed(2)}</cbc:TaxableAmount>
    <cbc:TaxAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${taxAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxCategory>
      <cbc:ID>S</cbc:ID>
      <cbc:Percent>${taxPercent}</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:TaxCategory>
  </cac:TaxSubtotal>`;
    }

    taxTotal += `
</cac:TaxTotal>`;

    return taxTotal;
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
  <cbc:LineExtensionAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${lineExtensionAmount.toFixed(2)}</cbc:LineExtensionAmount>
  <cbc:TaxExclusiveAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${taxExclusiveAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
  <cbc:TaxInclusiveAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${taxInclusiveAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
  <cbc:PayableAmount currencyID="${this.escapeXml(this.invoice.currency || "USD")}">${payableAmount.toFixed(2)}</cbc:PayableAmount>
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
  <cbc:InvoicedQuantity>${item.quantity}</cbc:InvoicedQuantity>
  <cbc:LineExtensionAmount currencyID="${currency}">${item.totalPriceTaxExcl.toFixed(2)}</cbc:LineExtensionAmount>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${taxAmount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:Item>
    <cbc:Description>${this.escapeXml(item.description || "")}</cbc:Description>
    <cac:ClassifiedTaxCategory>
      <cbc:ID>S</cbc:ID>
      <cbc:Percent>${item.taxPercent || 0}</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:ClassifiedTaxCategory>
  </cac:Item>
  <cac:Price>
    <cbc:PriceAmount currencyID="${currency}">${item.unitPriceTaxExcl.toFixed(2)}</cbc:PriceAmount>
  </cac:Price>
</cac:InvoiceLine>`;
      })
      .join("\n");
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
}: ExportUBLOptions): Promise<File> {
  const exporter = new UBLExporter(invoice);
  return exporter.exportToFile({ filename });
}

/**
 * Export and download an invoice as UBL
 * @param options Export options
 */
export async function downloadUBL({
  invoice,
  filename = "invoice.xml",
}: ExportUBLOptions): Promise<void> {
  const exporter = new UBLExporter(invoice);
  return exporter.downloadUBL(filename);
}
