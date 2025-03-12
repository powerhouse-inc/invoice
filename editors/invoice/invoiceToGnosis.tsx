import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@powerhousedao/design-system";

interface InvoiceToGnosisProps {
  docState: any; // Replace 'any' with the appropriate type if available
}

const InvoiceToGnosis: React.FC<InvoiceToGnosisProps> = ({ docState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [invoiceStatusResponse, setInvoiceStatusResponse] = useState<any>(null);
  const [safeTxHash, setsafeTxHash] = useState<string | null>(null);

  // useEffect(() => {
  //   if (safeTxHash) {
  //     const eventSource = new EventSource(
  //       `http://localhost:5001/api/transaction-status/${safeTxHash}/${docState.invoiceNo}`,
  //     );

  //     eventSource.onmessage = (event) => {
  //       const data = JSON.parse(event.data);
  //       console.log("SSE data: ", data);
  //       if (data.status === "completed") {
  //         console.log("Transaction completed and status updated");
  //         toast("Invoice Paid", {
  //           type: "success",
  //         });
  //         eventSource.close(); // Close the connection immediately
  //       }
  //     };

  //     eventSource.onerror = () => {
  //       eventSource.close();
  //     };

  //     return () => {
  //       eventSource.close();
  //     };
  //   }
  // }, [safeTxHash]);

  const TOKEN_ADDRESSES = {
    BASE: {
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      USDS: "0x820C137fa70C8691f0e44Dc420a5e53c168921Dc",
      // Add more tokens as needed
    },
    // Add more networks as needed
  };

  // Separate payerWallet configuration
  const payerWallet = {
    rpc: "https://base.llamarpc.com",
    chainName: "Base",
    chainId: "8453",
    address: "0x1FB6bEF04230d67aF0e3455B997a28AFcCe1F45e", // Safe address
  };

  const currency = docState.currency;
  const chainName = docState.issuer.paymentRouting.wallet.chainName;

  // Extract payment details from current-state.json
  const paymentDetails = {
    payeeWallet: {
      address: docState.issuer.paymentRouting.wallet.address,
      chainName: docState.issuer.paymentRouting.wallet.chainName,
      chainId: docState.issuer.paymentRouting.wallet.chainId,
    },
    token: {
      evmAddress: getTokenAddress(chainName, currency),
      symbol: docState.currency,
      chainName: docState.issuer.paymentRouting.wallet.chainName,
      chainId: docState.issuer.paymentRouting.wallet.chainId,
    },
    amount: docState.totalPriceTaxIncl || 0.000015, // Make the amount small for testing
  };

  function getTokenAddress(chainName: any, symbol: any) {
    const networkTokens =
      TOKEN_ADDRESSES[chainName.toUpperCase() as keyof typeof TOKEN_ADDRESSES];
    if (!networkTokens) {
      console.error(`Network ${chainName} not supported`);
    }

    const tokenAddress = networkTokens[symbol as keyof typeof networkTokens];
    if (!tokenAddress) {
      console.error(`Token ${symbol} not supported on ${chainName}`);
    }

    return tokenAddress;
  }

  const handleInvoiceToGnosis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:4001/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation ProcessGnosisPayment($payerWallet: JSON!, $paymentDetails: JSON!, $invoiceNo: String!) {
              processGnosisPayment(payerWallet: $payerWallet, paymentDetails: $paymentDetails, invoiceNo: $invoiceNo) {
                success
                data
                error
              }
            }
          `,
          variables: {
            payerWallet: payerWallet,
            paymentDetails: paymentDetails,
            invoiceNo: docState.invoiceNo,
          },
        }),
      });

      const result = await response.json();
      const data = result.data.processGnosisPayment;

      if (data.success) {
        console.log("Transfer result:", data);
        setResponseData(data);
        // Since data is now a JSON scalar, we need to parse it if it's a string
        const dataObj =
          typeof data.data === "string" ? JSON.parse(data.data) : data.data;
        // The executeTokenTransfer function returns txHash.transactions array
        setsafeTxHash(dataObj.txHash.safeTxHash);
      } else {
        console.error("Error during transfer:", data.error);
        setError(data.error);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error during transfer:", error);
      setIsLoading(false);
    }
  };

  const handleUpdateInvoiceStatus = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/update-invoice-status",
        {
          invoiceNo: docState.invoiceNo,
        },
      );
      console.log("Response: ", response.data.message);
      setInvoiceStatusResponse(response.data.message);
    } catch (error) {
      console.error("Error updating invoice status:", error);
    }
  };

  return (
    <div>
      <button
        className="bg-blue-500 text-black px-4 py-2 rounded-md"
        onClick={handleInvoiceToGnosis}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Send Payment to Gnosis >"}
      </button>

      {error && <div className="error-message">{error}</div>}

      {safeTxHash && (
        <div className="invoice-link">
          <p>Safe Transaction Hash: {safeTxHash}</p>
          <a
            style={{ color: "blue" }}
            href={
              "https://app.safe.global/transactions/queue?safe=base:0x1FB6bEF04230d67aF0e3455B997a28AFcCe1F45e"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="view-invoice-button"
          >
            View Transaction Details
          </a>
        </div>
      )}
      {invoiceStatusResponse && (
        <div className="invoice-status-response">
          <p>Invoice Status Response: {invoiceStatusResponse}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceToGnosis;
