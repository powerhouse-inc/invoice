import React, { useState } from "react";
import axios, { AxiosError } from "axios"; // or use fetch API directly

interface RequestFinanceProps {
  docState: any; // Replace 'any' with the appropriate type if available
}

const RequestFinance: React.FC<RequestFinanceProps> = ({ docState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [invoiceLink, setInvoiceLink] = useState<string | null>(null);
  const [directPaymentStatus, setDirectPaymentStatus] = useState<string | null>(
    null,
  );

  // Function to call the createDirectPayment mutation
  const createDirectPayment = async (paymentData: any) => {
    try {
      // GraphQL mutation request
      const response = await fetch("http://localhost:4001/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation CreateDirectPayment($paymentData: JSON!) {
              createDirectPayment(paymentData: $paymentData) {
                success
                data
                error
              }
            }
          `,
          variables: {
            paymentData,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      if (result.data?.createDirectPayment?.success) {
        setDirectPaymentStatus("Direct payment created successfully");
        return result.data.createDirectPayment.data;
      } else {
        throw new Error(
          result.data?.createDirectPayment?.error || "Unknown error",
        );
      }
    } catch (err) {
      console.error("Error creating direct payment:", err);
      setDirectPaymentStatus(
        `Error creating direct payment: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      throw err;
    }
  };

  const handleRequestFinance = async () => {
    console.log("state when request finance is clicked", docState);
    setIsLoading(true);
    setError(null);
    setInvoiceLink(null);
    setDirectPaymentStatus(null);

    const bankDetails = {
      currency: docState.currency || "EUR",
      accountNumber:
        docState.issuer.paymentRouting.bank.accountNum ||
        "DE89300500000132013000", // the IBAN
      country:
        docState.issuer.paymentRouting.bank.address.country.toUpperCase() ||
        "DE",
      bankName: docState.issuer.paymentRouting.bank.name || "GmbH Bank Name",
      firstName:
        docState.issuer.paymentRouting.bank.beneficiary.split(" ")[0] ||
        "Liberuum",
      lastName:
        docState.issuer.paymentRouting.bank.beneficiary.split(" ")[1] ||
        "Liberty",
      bicSwift: docState.issuer.paymentRouting.bank.BIC || "GMBHDEFFXXX",
    };

    try {
      const invoiceData = {
        meta: {
          format: "rnf_generic",
          version: "0.0.3",
        },
        creationDate:
          `${docState.dateIssued}T09:38:16.916Z` || "2025-01-27T14:38:16.916Z",
        invoiceItems: docState.lineItems.map((item: any) => ({
          currency: bankDetails.currency,
          name: item.description,
          quantity: item.quantity,
          unitPrice: item.totalPriceTaxIncl * 100,
        })) || [
          {
            currency: "EUR",
            name: "test invoice",
            quantity: 1,
            unitPrice: "25000",
          },
        ],
        invoiceNumber: docState.invoiceNo || "2.07",
        buyerInfo: {
          // email: docState.payer.contactInfo.email || "liberuum@powerhouse.inc",
          email: "liberuum@powerhouse.inc",
          // firstName: docState.payer.name.split(" ")[0] || "Liberuum",
          // lastName: docState.payer.name.split(" ")[1] || "Liberty",
          businessName: docState.payer.name || "place holder name",
          address: {
            country: docState.payer.address.country || "DE",
            city: docState.payer.address.city || "Berlin",
            streetAddress:
              docState.payer.address.streetAddress || "Musterstraße 1",
            extendedAddress: docState.payer.address.extendedAddress || "",
            postalCode: docState.payer.address.postalCode || "",
          },
        },
        sellerInfo: {
          email:
            docState.issuer.contactInfo.email || "contributor@contributor.com",
          firstName: docState.issuer.name || "place holder name",
          lastName:
            docState.issuer.name.split(" ")[
              docState.issuer.name.split(" ").length - 1
            ] || "contributor",
          address: {
            country: docState.issuer.address.country || "DE",
            city: docState.issuer.address.city || "Berlin",
            streetAddress:
              docState.issuer.address.streetAddress || "Musterstraße 1",
            extendedAddress: docState.issuer.address.extendedAddress || "",
            postalCode: docState.issuer.address.postalCode || "",
          },
        },
        paymentOptions: [
          {
            type: "bank-account",
            value: {
              currency: bankDetails.currency,
              paymentInformation: {
                bankAccountDetails: {
                  accountNumber: bankDetails.accountNumber, // the IBAN
                  country: bankDetails.country,
                  currency: bankDetails.currency,
                  bankName: bankDetails.bankName,
                  firstName: bankDetails.firstName,
                  lastName: bankDetails.lastName,
                  bicSwift: bankDetails.bicSwift,
                },
              },
            },
          },
        ],
      };

      // Instead of calling the API endpoint directly, use the createDirectPayment function
      const directPaymentResult = await createDirectPayment(invoiceData);
      console.log("Direct payment created:", directPaymentResult);

      // Process the response
      if (directPaymentResult?.response?.invoiceLinks?.pay) {
        setInvoiceLink(directPaymentResult.response.invoiceLinks.pay);
      }

      setResponseData(directPaymentResult);
      setDirectPaymentStatus("Direct payment created successfully");
    } catch (err) {
      // Handle error with proper typing
      let errorMessage = "An error occurred";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        className="bg-blue-500 text-black px-4 py-2 rounded-md"
        onClick={handleRequestFinance}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Send Payment to Request Finance >"}
      </button>

      {error && (
        <div className="error-message" style={{ color: "red" }}>
          {error}
        </div>
      )}

      {invoiceLink && (
        <div>
          <div className="direct-payment-status">
            <p>{directPaymentStatus}</p>
          </div>
          <div className="invoice-link">
            <a
              style={{ color: "blue" }}
              href={invoiceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="view-invoice-button"
            >
              View Invoice
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestFinance;
