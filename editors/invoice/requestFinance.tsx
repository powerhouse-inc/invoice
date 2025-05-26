import React, { useState } from "react";

let GRAPHQL_URL = 'http://localhost:4001/graphql/invoice'

if (window.document.baseURI !== 'http://localhost:3000/') {
  GRAPHQL_URL = 'https://switchboard.powerhouse.xyz/graphql/invoice'
}

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
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation Invoice_createRequestFinancePayment($paymentData: JSON!) {
              Invoice_createRequestFinancePayment(paymentData: $paymentData) {
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

      if (result.data?.Invoice_createRequestFinancePayment?.success) {
        setDirectPaymentStatus("Direct payment created successfully");
        return result.data.Invoice_createRequestFinancePayment.data;
      } else {
        throw new Error(
          result.data?.Invoice_createRequestFinancePayment?.error || "Unknown error",
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
      currency: docState.currency,
      accountNumber:
        docState.issuer.paymentRouting.bank.accountNum,
      country:
        docState.issuer.paymentRouting.bank.address.country.toUpperCase(),
      bankName: docState.issuer.paymentRouting.bank.name,
      firstName:
        docState.issuer.paymentRouting.bank.beneficiary.split(" ")[0] ||
        "Liberuum",
      lastName:
        docState.issuer.paymentRouting.bank.beneficiary.split(" ")[1] ||
        "Liberty",
      bicSwift: docState.issuer.paymentRouting.bank.BIC,
    };

    try {
      const invoiceData = {
        meta: {
          format: "rnf_generic",
          version: "0.0.3",
        },
        creationDate: docState.dateIssued,
        invoiceItems: docState.lineItems.map((item: any) => ({
          currency: bankDetails.currency,
          name: item.description,
          quantity: item.quantity,
          unitPrice: item.totalPriceTaxIncl * 100,
        })),
        invoiceNumber: docState.invoiceNo,
        buyerInfo: {
          email: docState.payer.contactInfo.email,
          firstName: docState.payer.name,
          // lastName: docState.payer.name.split(" ")[1] || "Liberty",
          businessName: docState.payer.name,
          address: {
            country: docState.payer.address.country,
            city: docState.payer.address.city,
            streetAddress: docState.payer.address.streetAddress,
            extendedAddress: docState.payer.address.extendedAddress,
            postalCode: docState.payer.address.postalCode,
          },
        },
        sellerInfo: {
          email:
            docState.issuer.contactInfo.email,
          firstName: docState.issuer.name,
          lastName: '',
          address: {
            country: docState.issuer.address.country,
            city: docState.issuer.address.city,
            streetAddress:
              docState.issuer.address.streetAddress,
            extendedAddress: docState.issuer.address.extendedAddress,
            postalCode: docState.issuer.address.postalCode,
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
