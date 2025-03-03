import React, { useState } from "react";
import axios from "axios"; // or use fetch API directly

interface RequestFinanceProps {
  docState: any; // Replace 'any' with the appropriate type if available
}

const RequestFinance: React.FC<RequestFinanceProps> = ({ docState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [invoiceLink, setInvoiceLink] = useState<string | null>(null);

  const handleRequestFinance = async () => {
    console.log("state when request finance is clicked", docState);
    setIsLoading(true);
    setError(null);
    setInvoiceLink(null);

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
      const response = await axios.post(
        "http://localhost:5001/api/create-invoice",
        {
          meta: {
            format: "rnf_generic",
            version: "0.0.3",
          },
          creationDate:
            `${docState.dateIssued}T09:38:16.916Z` ||
            "2025-01-27T14:38:16.916Z",
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
            email: "liberuum@powerhouse.inc",
            firstName: "Liberuum",
            lastName: "Liberty",
          },
          sellerInfo: {
            email:
              docState.issuer.contactInfo.email ||
              "contributor@contributor.com",
            firstName: docState.issuer.name || "place holder name",
            // lastName: docState.issuer.name || "contributor",
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
        },
      );

      console.log("Invoice created successfully:", response.data);
      setResponseData(response.data);
      // setInvoiceLink("https://baguette-app.request.finance/direct-payment");
      if (response.data?.invoiceLinks?.pay) {
        setInvoiceLink(response.data.invoiceLinks.pay);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.response.data.errors[0]
          : "An error occurred",
      );
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

      {error && <div className="error-message">{error}</div>}

      {invoiceLink && (
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
      )}
    </div>
  );
};

export default RequestFinance;
