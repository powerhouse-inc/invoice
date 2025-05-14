import React, { useState } from "react";
import { InvoiceAction, actions } from "../../document-models/invoice/index.js";
import { toast } from "@powerhousedao/design-system";
import { uploadPdfChunked } from "./uploadPdfChunked.js";
import { getCountryCodeFromName } from "./utils/utils.js";

let GRAPHQL_URL = 'http://localhost:4001/graphql/invoice'

if (window.document.baseURI !== 'http://localhost:3000/') {
  GRAPHQL_URL = 'https://switchboard-dev.powerhouse.xyz/graphql/invoice'
}


export async function loadPDFFile({
  file,
  dispatch,
}: {
  file: File;
  dispatch: (action: InvoiceAction) => void;
}) {
  if (!file) throw new Error("No file provided");

  if (file.type !== "application/pdf") {
    throw new Error("Please upload a PDF file");
  }

  console.log("Loading PDF file:", file.name);

  return file;
}

interface PDFUploaderProps {
  dispatch: (action: InvoiceAction) => void;
  changeDropdownOpen: (open: boolean) => void;
}

export default function PDFUploader({
  dispatch,
  changeDropdownOpen,
}: PDFUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setIsLoading(true);
    setUploadProgress(0);


    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result?.toString().split(",")[1];
        if (!base64Data) {
          throw new Error("Failed to read file");
        }

        try {
          const result = await uploadPdfChunked(
            base64Data,
            GRAPHQL_URL,
            50 * 1024,
            (progress) => setUploadProgress(progress),
          );

          if (result.success) {
            const invoiceData = result.data.invoiceData;

            // Dispatch the parsed invoice data
            dispatch(
              actions.editInvoice({
                invoiceNo: invoiceData.invoiceNo || "",
                dateIssued:
                  invoiceData.dateIssued ||
                  new Date().toISOString().split("T")[0],
                dateDue:
                  invoiceData.dateDue || new Date().toISOString().split("T")[0],
                currency: invoiceData.currency || "USD",
              }),
            );

            // If we have line items, dispatch them
            if (invoiceData.lineItems && invoiceData.lineItems.length > 0) {
              invoiceData.lineItems.forEach((item: any) => {
                dispatch(
                  actions.addLineItem({
                    id: item.id,
                    description: item.description,
                    taxPercent: item.taxPercent,
                    quantity: item.quantity,
                    currency: item.currency,
                    unitPriceTaxExcl: item.unitPriceTaxExcl,
                    unitPriceTaxIncl: item.unitPriceTaxIncl,
                    totalPriceTaxExcl: item.totalPriceTaxExcl,
                    totalPriceTaxIncl: item.totalPriceTaxIncl,
                  }),
                );
              });
            }

            // If we have issuer data, dispatch it
            if (invoiceData.issuer) {
              dispatch(
                actions.editIssuer({
                  name: invoiceData.issuer.name || "",
                  country:
                    getCountryCodeFromName(invoiceData.issuer.country) || "",
                  streetAddress:
                    invoiceData.issuer.address?.streetAddress || "",
                  extendedAddress:
                    invoiceData.issuer.address?.extendedAddress || "",
                  city: invoiceData.issuer.address?.city || "",
                  postalCode: invoiceData.issuer.address?.postalCode || "",
                  stateProvince:
                    invoiceData.issuer.address?.stateProvince || "",
                  tel: invoiceData.issuer.contactInfo?.tel || "",
                  email: invoiceData.issuer.contactInfo?.email || "",
                  id: invoiceData.issuer.id?.taxId || "",
                }),
              );

              // Add bank information dispatch
              if (invoiceData.issuer.paymentRouting?.bank) {
                const bank = invoiceData.issuer.paymentRouting.bank;
                console.log("Dispatching bank details:", bank); // Debug log
                dispatch(
                  actions.editIssuerBank({
                    name: bank.name || "",
                    accountNum: bank.accountNum || "",
                    ABA: bank.ABA || "",
                    BIC: bank.BIC || "",
                    SWIFT: bank.SWIFT || "",
                    accountType: bank.accountType || "CHECKING",
                    beneficiary: bank.beneficiary || "",
                    memo: bank.memo || "",
                    streetAddress: bank.address?.streetAddress || "",
                    city: bank.address?.city || "",
                    stateProvince: bank.address?.stateProvince || "",
                    postalCode: bank.address?.postalCode || "",
                    country:
                      getCountryCodeFromName(bank.address?.country) || "",
                    extendedAddress: bank.address?.extendedAddress || "",
                  }),
                );
              }

              // Add crypto wallet information dispatch
              if (invoiceData.issuer.paymentRouting?.wallet) {
                dispatch(
                  actions.editIssuerWallet({
                    address:
                      invoiceData.issuer.paymentRouting.wallet.address || "",
                    chainId:
                      invoiceData.issuer.paymentRouting.wallet.chainId || "",
                    chainName:
                      invoiceData.issuer.paymentRouting.wallet.chainName || "",
                    rpc: invoiceData.issuer.paymentRouting.wallet.rpc || "",
                  }),
                );
              }
            }

            // If we have payer data, dispatch it
            if (invoiceData.payer) {
              dispatch(
                actions.editPayer({
                  name: invoiceData.payer.name || "",
                  country:
                    getCountryCodeFromName(invoiceData.payer.country) || "",
                  streetAddress: invoiceData.payer.address?.streetAddress || "",
                  extendedAddress:
                    invoiceData.payer.address?.extendedAddress || "",
                  city: invoiceData.payer.address?.city || "",
                  postalCode: invoiceData.payer.address?.postalCode || "",
                  stateProvince: invoiceData.payer.address?.stateProvince || "",
                  tel: invoiceData.payer.contactInfo?.tel || "",
                  email: invoiceData.payer.contactInfo?.email || "",
                  id: invoiceData.payer.id?.taxId || "",
                }),
              );

              // Add payer bank information if present
              if (invoiceData.payer.paymentRouting?.bank) {
                dispatch(
                  actions.editPayerBank({
                    name: invoiceData.payer.paymentRouting.bank.name || "",
                    accountNum:
                      invoiceData.payer.paymentRouting.bank.accountNum || "",
                    ABA: invoiceData.payer.paymentRouting.bank.ABA || "",
                    BIC: invoiceData.payer.paymentRouting.bank.BIC || "",
                    SWIFT: invoiceData.payer.paymentRouting.bank.SWIFT || "",
                    accountType:
                      invoiceData.payer.paymentRouting.bank.accountType ||
                      "CHECKING",
                    beneficiary:
                      invoiceData.payer.paymentRouting.bank.beneficiary || "",
                    memo: invoiceData.payer.paymentRouting.bank.memo || "",
                  }),
                );
              }

              // Add payer crypto wallet information if present
              if (invoiceData.payer.paymentRouting?.wallet) {
                dispatch(
                  actions.editPayerWallet({
                    address:
                      invoiceData.payer.paymentRouting.wallet.address || "",
                    chainId:
                      invoiceData.payer.paymentRouting.wallet.chainId || "",
                    chainName:
                      invoiceData.payer.paymentRouting.wallet.chainName || "",
                    rpc: invoiceData.payer.paymentRouting.wallet.rpc || "",
                  }),
                );
              }
            }

            setIsLoading(false);
            toast("Invoice uploaded successfully", {
              type: "success",
            });

            // Add debug logging here
            console.log(
              "Final document state:",
              JSON.stringify(
                {
                  issuer: invoiceData.issuer,
                  payer: invoiceData.payer,
                  lineItems: invoiceData.lineItems,
                  paymentRouting: invoiceData.issuer?.paymentRouting,
                  bankDetails: invoiceData.issuer?.paymentRouting?.bank,
                },
                null,
                2,
              ),
            );

            changeDropdownOpen(false);
          } else {
            throw new Error(result.error || "Failed to process PDF");
          }
        } catch (error) {
          console.error("Error processing PDF:", error);
          setError(
            error instanceof Error
              ? error.message
              : "An error occurred while processing the PDF",
          );
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to read file");
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling file:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while handling the file",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="pdf-upload"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          {isLoading ? "Uploading..." : "Upload PDF"}
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
        </label>

        {isLoading && uploadProgress > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Uploading: {uploadProgress.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
