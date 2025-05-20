import { useEffect, useMemo, useRef, useState } from "react";
import type { EditorProps } from "document-model";
import {
  type InvoiceDocument,
  Status,
  actions,
} from "../../document-models/invoice/index.js";
import { LegalEntityForm } from "./legalEntity/legalEntity.js";
import { LineItemsTable } from "./lineItems.js";
import { loadUBLFile } from "./ingestUBL.js";
import PDFUploader from "./ingestPDF.js";
import RequestFinance from "./requestFinance.js";
import InvoiceToGnosis from "./invoiceToGnosis.js";
import { toast, ToastContainer } from "@powerhousedao/design-system";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF.js";
import { createRoot } from "react-dom/client";
import { downloadUBL } from "./exportUBL.js";
import { CurrencyForm, currencyList } from "./components/currencyForm.js";
import { InputField } from "./components/inputField.js";
import {
  validateField,
  ValidationContext,
  ValidationResult,
} from "./validation/validationManager.js";
import { DatePicker } from "./components/datePicker.js";
import { SelectField } from "./components/selectField.js";

// Helper function to format numbers with appropriate decimal places
function formatNumber(value: number): string {
  // Check if the value has decimal places
  const hasDecimals = value % 1 !== 0;

  // If no decimals or only trailing zeros after 2 decimal places, show 2 decimal places
  if (!hasDecimals || value.toFixed(5).endsWith("000")) {
    return value.toFixed(2);
  }

  // Otherwise, show actual decimal places up to 5
  const stringValue = value.toString();
  const decimalPart = stringValue.split(".")[1] || "";

  // Determine how many decimal places to show (up to 5)
  const decimalPlaces = Math.min(Math.max(2, decimalPart.length), 5);
  return value.toFixed(decimalPlaces);
}

function isFiatCurrency(currency: string): boolean {
  return currencyList.find((c) => c.ticker === currency)?.crypto === false;
}

export type IProps = EditorProps<InvoiceDocument>;

export default function Editor(props: IProps) {
  const { document: doc, dispatch } = props;
  const state = doc.state.global;

  const [fiatMode, setFiatMode] = useState(isFiatCurrency(state.currency));
  const [uploadDropdownOpen, setUploadDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [invoiceNoInput, setInvoiceNoInput] = useState(state.invoiceNo || "");
  const uploadDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Validation state
  const [invoiceValidation, setInvoiceValidation] =
    useState<ValidationResult | null>(null);
  const [walletValidation, setWalletValidation] =
    useState<ValidationResult | null>(null);
  const [currencyValidation, setCurrencyValidation] =
    useState<ValidationResult | null>(null);
  const [countryValidation, setCountryValidation] =
    useState<ValidationResult | null>(null);
  const [ibanValidation, setIbanValidation] = useState<ValidationResult | null>(
    null
  );
  const [bicValidation, setBicValidation] = useState<ValidationResult | null>(
    null
  );
  const [bankNameValidation, setBankNameValidation] =
    useState<ValidationResult | null>(null);
  const [streetAddressValidation, setStreetAddressValidation] =
    useState<ValidationResult | null>(null);
  const [cityValidation, setCityValidation] = useState<ValidationResult | null>(
    null
  );
  const [postalCodeValidation, setPostalCodeValidation] =
    useState<ValidationResult | null>(null);
  const [payerEmailValidation, setPayerEmailValidation] =
    useState<ValidationResult | null>(null);
  const [lineItemValidation, setLineItemValidation] =
    useState<ValidationResult | null>(null);

  const prevStatus = useRef(state.status);

  useEffect(() => {
    setFiatMode(isFiatCurrency(state.currency));
  }, [state.currency, state]);

  // Add click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        uploadDropdownRef.current &&
        !uploadDropdownRef.current.contains(event.target as Node)
      ) {
        setUploadDropdownOpen(false);
      }
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setExportDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const itemsTotalTaxExcl = useMemo(() => {
    return state.lineItems.reduce((total, lineItem) => {
      return total + lineItem.quantity * lineItem.unitPriceTaxExcl;
    }, 0.0);
  }, [state.lineItems]);

  const itemsTotalTaxIncl = useMemo(() => {
    return state.lineItems.reduce((total, lineItem) => {
      return total + lineItem.quantity * lineItem.unitPriceTaxIncl;
    }, 0.0);
  }, [state.lineItems]);

  const STATUS_OPTIONS: Status[] = [
    "DRAFT",
    "ISSUED",
    "CANCELLED",
    "ACCEPTED",
    "REJECTED",
    "AWAITINGPAYMENT",
    "PAYMENTSCHEDULED",
    "PAYMENTSENT",
    "PAYMENTISSUE",
    "PAYMENTRECEIVED",
  ];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await loadUBLFile({ file, dispatch });
      toast("UBL file uploaded successfully", {
        type: "success",
      });
    } catch (error) {
      // Handle error presentation to user
      console.error("Failed to load UBL file:", error);
      toast("Failed to load UBL file", {
        type: "error",
      });
    }
  };

  const handleExportPDF = () => {
    // Create a temporary container for the PDFDownloadLink
    const container = window.document.createElement("div");
    container.style.display = "none";
    window.document.body.appendChild(container);

    // Create root for React 18
    const root = createRoot(container);

    // Render the PDFDownloadLink
    const cleanup = () => {
      root.unmount();
      window.document.body.removeChild(container);
    };

    try {
      root.render(
        <PDFDownloadLink
          document={<InvoicePDF invoice={state} fiatMode={fiatMode} />}
          fileName={`invoice-${state.invoiceNo || "export"}.pdf`}
          className="hidden"
        >
          {({ blob, url, loading, error }) => {
            if (loading) {
              return null;
            }

            if (error) {
              cleanup();
              toast("Failed to export PDF", { type: "error" });
              console.error("PDF generation error:", error);
              return null;
            }

            if (url && blob) {
              // Create a direct download link
              const downloadLink = window.document.createElement("a");
              downloadLink.href = url;
              downloadLink.download = `invoice-${state.invoiceNo || "export"}.pdf`;
              window.document.body.appendChild(downloadLink);
              downloadLink.click();
              window.document.body.removeChild(downloadLink);

              // Cleanup after ensuring download has started
              setTimeout(cleanup, 100);
            }
            return null;
          }}
        </PDFDownloadLink>
      );
    } catch (error) {
      console.error("Error exporting PDF:", error);
      cleanup();
      toast("Failed to export PDF", { type: "error" });
    }
  };

  async function handleExportUBL() {
    try {
      // Generate a PDF blob first
      const pdfBlob = await generatePDFBlob();

      // Generate filename based on invoice number
      const filename = `invoice_${state.invoiceNo || "export"}.xml`;

      return await downloadUBL({
        invoice: state,
        filename,
        pdfBlob, // Pass the PDF blob to be embedded in the UBL file
      });
    } catch (error) {
      console.error("Error exporting to UBL:", error);
      toast("Failed to export UBL", { type: "error" });
      throw error;
    }
  }

  // New function to generate a PDF blob using the existing PDF generation logic
  async function generatePDFBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Create a temporary container for the PDFDownloadLink
      const container = window.document.createElement("div");
      container.style.display = "none";
      window.document.body.appendChild(container);

      // Create root for React 18
      const root = createRoot(container);

      // Cleanup function
      const cleanup = () => {
        root.unmount();
        window.document.body.removeChild(container);
      };

      try {
        root.render(
          <PDFDownloadLink
            document={<InvoicePDF invoice={state} fiatMode={fiatMode} />}
            fileName={`invoice-${state.invoiceNo || "export"}.pdf`}
            className="hidden"
          >
            {({ blob, url, loading, error }) => {
              if (loading) {
                return null;
              }

              if (error) {
                cleanup();
                reject(error);
                return null;
              }

              if (blob) {
                // We have the blob, resolve it
                resolve(blob);
                // Cleanup after getting the blob
                setTimeout(cleanup, 100);
              }
              return null;
            }}
          </PDFDownloadLink>
        );
      } catch (error) {
        console.error("Error generating PDF blob:", error);
        cleanup();
        reject(error);
      }
    });
  }

  // Add validation check when status changes
  const handleStatusChange = (newStatus: Status) => {
    if (newStatus === "PAYMENTSCHEDULED" || newStatus === "ISSUED") {
      const context: ValidationContext = {
        currency: state.currency,
        currentStatus: state.status,
        targetStatus: newStatus === "PAYMENTSCHEDULED" ? "ISSUED" : "ISSUED",
      };

      // Collect all validation errors
      const validationErrors: ValidationResult[] = [];

      // Validate invoice number
      const invoiceValidation = validateField(
        "invoiceNo",
        state.invoiceNo,
        context
      );
      setInvoiceValidation(invoiceValidation);
      if (invoiceValidation && !invoiceValidation.isValid) {
        validationErrors.push(invoiceValidation);
      }

      // Validate wallet address if currency is crypto
      if (!isFiatCurrency(state.currency)) {
        const walletValidation = validateField(
          "address",
          state.issuer.paymentRouting?.wallet?.address ?? "",
          context
        );
        setWalletValidation(walletValidation);
        if (walletValidation && !walletValidation.isValid) {
          validationErrors.push(walletValidation);
        }
      }

      // Validate currency
      const currencyValidation = validateField(
        "currency",
        state.currency,
        context
      );
      setCurrencyValidation(currencyValidation);
      if (currencyValidation && !currencyValidation.isValid) {
        validationErrors.push(currencyValidation);
      }

      // Validate country
      const country =
        state.issuer.paymentRouting?.bank?.address?.country &&
        state.issuer.country
          ? state.issuer.paymentRouting?.bank?.address?.country
          : "";
      const countryValidation = validateField("country", country, context);
      setCountryValidation(countryValidation);
      if (countryValidation && !countryValidation.isValid) {
        validationErrors.push(countryValidation);
      }

      // Validate EUR&GBP IBAN account number
      const ibanValidation = validateField(
        "accountNum",
        state.issuer.paymentRouting?.bank?.accountNum,
        context
      );
      setIbanValidation(ibanValidation);
      if (ibanValidation && !ibanValidation.isValid) {
        validationErrors.push(ibanValidation);
      }

      // Validate BIC number
      const bicValidation = validateField(
        "bicNumber",
        state.issuer.paymentRouting?.bank?.BIC,
        context
      );
      setBicValidation(bicValidation);
      if (bicValidation && !bicValidation.isValid) {
        validationErrors.push(bicValidation);
      }

      // Validate bank name
      const bankNameValidation = validateField(
        "bankName",
        state.issuer.paymentRouting?.bank?.name,
        context
      );
      setBankNameValidation(bankNameValidation);
      if (bankNameValidation && !bankNameValidation.isValid) {
        validationErrors.push(bankNameValidation);
      }

      // Validate street address
      const streetAddressValidation = validateField(
        "streetAddress",
        state.issuer.address?.streetAddress,
        context
      );
      setStreetAddressValidation(streetAddressValidation);
      if (streetAddressValidation && !streetAddressValidation.isValid) {
        validationErrors.push(streetAddressValidation);
      }

      // Validate city
      const cityValidation = validateField(
        "city",
        state.issuer.address?.city,
        context
      );
      setCityValidation(cityValidation);
      if (cityValidation && !cityValidation.isValid) {
        validationErrors.push(cityValidation);
      }

      // Validate postal code
      const postalCodeValidation = validateField(
        "postalCode",
        state.issuer.address?.postalCode,
        context
      );
      setPostalCodeValidation(postalCodeValidation);
      if (postalCodeValidation && !postalCodeValidation.isValid) {
        validationErrors.push(postalCodeValidation);
      }

      // Validate payer email
      const payerEmailValidation = validateField(
        "email",
        state.payer.contactInfo?.email,
        context
      );
      setPayerEmailValidation(payerEmailValidation);
      if (payerEmailValidation && !payerEmailValidation.isValid) {
        validationErrors.push(payerEmailValidation);
      }

      // Validate line items
      const lineItemValidation = validateField(
        "lineItem",
        state.lineItems,
        context
      );
      setLineItemValidation(lineItemValidation);
      if (lineItemValidation && !lineItemValidation.isValid) {
        validationErrors.push(lineItemValidation);
      }

      if (
        newStatus === "PAYMENTSCHEDULED" &&
        !isFiatCurrency(state.currency) &&
        state.issuer.paymentRouting?.wallet?.chainName === ""
      ) {
        validationErrors.push({
          message: "Select currency and chain before accepting invoice",
          severity: "warning",
          isValid: false,
        });
      }

      // If there are any validation errors, show them and return
      if (validationErrors.length > 0) {
        validationErrors.forEach((error) => {
          toast(error.message, {
            type: error.severity === "error" ? "error" : "warning",
          });
        });
        return;
      }
    }

    dispatch(actions.editStatus({ status: newStatus }));
  };

  const handleCurrencyChange = (currency: string) => {
    if (
      (prevStatus.current === "PAYMENTSCHEDULED" || prevStatus.current === "DRAFT") &&
      !isFiatCurrency(currency) &&
      state.issuer.paymentRouting?.wallet?.chainName === ""
    ) {
      dispatch(actions.editStatus({ status: "DRAFT" }));
      toast("Select currency and chain before accepting invoice", {
        type: "warning",
      });
    }
    dispatch(actions.editInvoice({ currency }));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Left side with Invoice title, input, and upload */}
        <div className="flex items-center gap-4 flex-nowrap">
          <h1 className="text-3xl font-bold whitespace-nowrap">Invoice</h1>
          <InputField
            placeholder={"Add invoice number"}
            value={invoiceNoInput}
            handleInputChange={(e) => setInvoiceNoInput(e.target.value)}
            onBlur={(e) => {
              const newValue = e.target.value;
              if (newValue !== state.invoiceNo) {
                dispatch(actions.editInvoice({ invoiceNo: newValue }));
              }
            }}
            input={invoiceNoInput}
            validation={invoiceValidation}
          />

          {/* Upload Dropdown Button */}
          <div className="relative" ref={uploadDropdownRef}>
            <button
              onClick={() => setUploadDropdownOpen(!uploadDropdownOpen)}
              className="inline-flex items-center h-10 px-4 rounded bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors whitespace-nowrap cursor-pointer"
              disabled={isPdfLoading}
            >
              {isPdfLoading ? "Processing..." : "Upload File"}
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {uploadDropdownOpen && !isPdfLoading && (
              <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    Upload UBL
                    <input
                      accept=".xml"
                      className="hidden"
                      onChange={(e) => {
                        handleFileUpload(e);
                        setUploadDropdownOpen(false);
                      }}
                      type="file"
                    />
                  </label>
                  <PDFUploader
                    dispatch={dispatch}
                    changeDropdownOpen={setUploadDropdownOpen}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown Button */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="inline-flex items-center h-10 px-4 rounded bg-black hover:bg-gray-800 text-white font-medium transition-colors whitespace-nowrap cursor-pointer"
            >
              Export File
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {exportDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => {
                      handleExportUBL();
                      setExportDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Export UBL
                  </button>
                  <button
                    onClick={() => {
                      handleExportPDF();
                      setExportDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Currency selector */}
        <div className="flex items-center gap-2">
          <CurrencyForm
            currency={state.currency}
            handleInputChange={(e) => {
              handleCurrencyChange(e.target.value);
            }}
            validation={currencyValidation}
          />
        </div>

        {/* Status on the right */}
        <SelectField
          options={STATUS_OPTIONS}
          value={state.status}
          onChange={(value) => handleStatusChange(value as Status)}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Issuer Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Issuer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-2">
              <label className="block mb-1 text-sm">Issue Date:</label>
              <DatePicker
                name="issueDate"
                className="w-full"
                onChange={(e) => {
                  const newDate = e.target.value.split("T")[0];
                  dispatch(
                    actions.editInvoice({
                      dateIssued: newDate,
                    })
                  );
                }}
                value={state.dateIssued}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 text-sm">Delivery Date:</label>
              <DatePicker
                name="deliveryDate"
                className="w-full"
                onChange={(e) => {
                  const newValue = e.target.value.split("T")[0];
                  if (newValue !== state.dateDelivered) {
                    dispatch(
                      actions.editInvoice({
                        dateDelivered: newValue,
                      })
                    );
                  }
                }}
                value={state.dateDelivered || ""}
              />
            </div>
          </div>
          <LegalEntityForm
            legalEntity={state.issuer}
            onChangeBank={(input) => dispatch(actions.editIssuerBank(input))}
            onChangeInfo={(input) => dispatch(actions.editIssuer(input))}
            onChangeWallet={(input) =>
              dispatch(actions.editIssuerWallet(input))
            }
            bankDisabled={!fiatMode}
            walletDisabled={fiatMode}
            currency={state.currency}
            status={state.status}
            walletvalidation={walletValidation}
            countryvalidation={countryValidation}
            ibanvalidation={ibanValidation}
            bicvalidation={bicValidation}
            banknamevalidation={bankNameValidation}
            streetaddressvalidation={streetAddressValidation}
            cityvalidation={cityValidation}
            postalcodevalidation={postalCodeValidation}
          />
        </div>

        {/* Payer Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Payer</h3>
          <div className="mb-2">
            <label className="block mb-1 text-sm">Due Date:</label>
            <DatePicker
              name="dateDue"
              className="w-full"
              onChange={(e) =>
                dispatch(
                  actions.editInvoice({
                    dateDue: e.target.value.split("T")[0],
                  })
                )
              }
              value={state.dateDue}
            />
          </div>
          <LegalEntityForm
            bankDisabled
            legalEntity={state.payer}
            onChangeInfo={(input) => dispatch(actions.editPayer(input))}
            currency={state.currency}
            status={state.status}
            payeremailvalidation={payerEmailValidation}
          />
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <LineItemsTable
          currency={state.currency}
          lineItems={state.lineItems}
          onAddItem={(item) => dispatch(actions.addLineItem(item))}
          onDeleteItem={(input) => dispatch(actions.deleteLineItem(input))}
          onUpdateCurrency={(input) => {
            setFiatMode(input.currency !== "USDS");
            dispatch(actions.editInvoice(input));
          }}
          onUpdateItem={(item) => dispatch(actions.editLineItem(item))}
        />
      </div>

      {/* Totals Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-start-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between text-gray-700">
                <span className="font-medium">Subtotal (excl. tax):</span>
                <span>
                  {formatNumber(itemsTotalTaxExcl)} {state.currency}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-900">
                <span>Total (incl. tax):</span>
                <span>
                  {formatNumber(itemsTotalTaxIncl)} {state.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finance Request Section */}
      {state.status === "PAYMENTSCHEDULED" && (
        <div className="mt-8">
          {!isFiatCurrency(state.currency) ? (
            <InvoiceToGnosis docState={state} />
          ) : (
            <RequestFinance docState={state} />
          )}
        </div>
      )}

      {/* Live PDF Preview */}
      {/* <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold">PDF Preview</h3>
        </div>
        <div style={{ height: "1000px" }}>
          <PDFViewer width="100%" height="100%">
            <InvoicePDF invoice={state} fiatMode={fiatMode} />
          </PDFViewer>
        </div>
      </div> */}
    </div>
  );
}
