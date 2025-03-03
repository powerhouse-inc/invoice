import React, { useState } from "react";
import { InvoiceAction, actions } from "../../document-models/invoice";
import { toast } from "@powerhousedao/design-system";

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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    changeDropdownOpen(false);

    const file = event.target.files?.[0];
    if (!file) return;

    toast("Extracting data from PDF...", {
      type: "info",
    });

    setIsLoading(true);
    console.log("File selected for upload:", file.name);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result?.toString().split(",")[1];
        console.log("Base64 data prepared for upload");

        // GraphQL mutation
        const response = await fetch("http://localhost:4001/invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation UploadInvoicePdf($pdfData: String!) {
                uploadInvoicePdf(pdfData: $pdfData) {
                  success
                  data
                  error
                }
              }
            `,
            variables: {
              pdfData: base64Data,
            },
          }),
        });

        const responseData = await response.json();

        if (response.ok && responseData.data?.uploadInvoicePdf?.success) {
          const invoiceData =
            responseData.data.uploadInvoicePdf.data.invoiceData;
          console.log("Extracted response:", responseData);
          console.log("Extracted data:", invoiceData);
          console.log("Extracted date issued:", invoiceData.dateIssued);

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
            })
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
                })
              );
            });
          }

          // If we have issuer data, dispatch it
          if (invoiceData.issuer) {
            dispatch(
              actions.editIssuer({
                name: invoiceData.issuer.name || "",
                country: invoiceData.issuer.country || "",
                streetAddress: invoiceData.issuer.address?.streetAddress || "",
                extendedAddress:
                  invoiceData.issuer.address?.extendedAddress || "",
                city: invoiceData.issuer.address?.city || "",
                postalCode: invoiceData.issuer.address?.postalCode || "",
                stateProvince: invoiceData.issuer.address?.stateProvince || "",
                tel: invoiceData.issuer.contactInfo?.tel || "",
                email: invoiceData.issuer.contactInfo?.email || "",
                id: invoiceData.issuer.id?.taxId || "",
              })
            );

            // Add bank information dispatch
            if (invoiceData.issuer.paymentRouting?.bank) {
              dispatch(
                actions.editIssuerBank({
                  name: invoiceData.issuer.paymentRouting.bank.name || "",
                  accountNum:
                    invoiceData.issuer.paymentRouting.bank.accountNum || "",
                  ABA: invoiceData.issuer.paymentRouting.bank.ABA || "",
                  BIC: invoiceData.issuer.paymentRouting.bank.BIC || "",
                  SWIFT: invoiceData.issuer.paymentRouting.bank.SWIFT || "",
                  accountType:
                    invoiceData.issuer.paymentRouting.bank.accountType ||
                    "CHECKING",
                  beneficiary:
                    invoiceData.issuer.paymentRouting.bank.beneficiary || "",
                  memo: invoiceData.issuer.paymentRouting.bank.memo || "",
                })
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
                })
              );
            }
          }

          // If we have payer data, dispatch it
          if (invoiceData.payer) {
            dispatch(
              actions.editPayer({
                name: invoiceData.payer.name || "",
                country: invoiceData.payer.country || "",
                streetAddress: invoiceData.payer.address?.streetAddress || "",
                extendedAddress:
                  invoiceData.payer.address?.extendedAddress || "",
                city: invoiceData.payer.address?.city || "",
                postalCode: invoiceData.payer.address?.postalCode || "",
                stateProvince: invoiceData.payer.address?.stateProvince || "",
                tel: invoiceData.payer.contactInfo?.tel || "",
                email: invoiceData.payer.contactInfo?.email || "",
                id: invoiceData.payer.id?.taxId || "",
              })
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
                })
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
                })
              );
            }
          }

          setIsLoading(false);
          toast("Invoice uploaded successfully", {
            type: "success",
          });
        } else {
          console.error("Error extracting data from PDF:", responseData);
          toast(
            responseData.data?.uploadInvoicePdf?.error ||
              "Error extracting data from PDF",
            {
              type: "error",
            }
          );
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling file:", error);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
        Upload PDF
        <input
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          type="file"
          disabled={isLoading}
        />
      </label>
    </div>
  );
}
