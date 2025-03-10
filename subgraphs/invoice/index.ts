import { Subgraph, Db, Context } from "@powerhousedao/reactor-api";
import { gql } from "graphql-tag";
import { uploadPdfAndGetJson } from "../../scripts/invoice/pdfToDocumentAi";
import { executeTokenTransfer } from "../../scripts/invoice/gnosisTransactionBuilder";
import { requestDirectPayment } from "./requestFinance";
import { actions as InvoiceActions } from '../../document-models/invoice'
import * as crypto from "crypto";
import express from "express";
import cors from "cors";

// Function to validate Alchemy signature
function isValidSignatureForStringBody(
  body: string,
  signature: string,
  signingKey: string
): boolean {
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(body, "utf8");
  const digest = hmac.digest("hex");
  return signature === digest;
}

interface UploadInvoicePdfArgs {
  pdfData: string;
}

interface CreateDirectPaymentArgs {
  paymentData: any; // Will be replaced with a more specific type once API details are known
}

interface ProcessGnosisPaymentArgs {
  payerWallet: JSON;
  paymentDetails: JSON;
  invoiceNo: string;
}

interface UploadInvoicePdfChunkArgs {
  chunk: string;
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  sessionId: string;
}

interface CheckInvoicePaymentStatusArgs {
  invoiceNo: string;
}

interface CheckAndUpdateInvoicePaymentArgs {
  invoiceNo: string;
}

export class InvoiceSubgraph extends Subgraph {
  name = "invoice";
  private fileChunks: Record<string, { chunks: string[], receivedChunks: number }> = {};
  // Add a map to store pending transactions with their associated invoice numbers
  private pendingTransactions: Record<string, { 
    invoiceNo: string, 
    payerWallet: any, 
    paymentDetails: any, 
    timestamp: number
  }> = {};
  // Add a set to track processed transaction hashes to avoid duplicate processing
  private processedTransactions: Set<string> = new Set();

  resolvers = {
    Mutation: {
      uploadInvoicePdf: {
        resolve: async (
          parent: unknown,
          args: UploadInvoicePdfArgs,
          context: Context,
        ) => {
          try {
            const { pdfData } = args;
            const result = await uploadPdfAndGetJson(pdfData);
            return { success: true, data: result };
          } catch (error) {
            console.error("Error processing PDF:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      },
      uploadInvoicePdfChunk: {
        resolve: async (
          parent: unknown,
          args: UploadInvoicePdfChunkArgs,
          context: Context,
        ) => {
          try {
            const { chunk, chunkIndex, totalChunks, fileName, sessionId } = args;
            const fileKey = `${sessionId}_${fileName}`;

            // Initialize array for this file if it doesn't exist
            if (!this.fileChunks[fileKey]) {
              this.fileChunks[fileKey] = {
                chunks: new Array(totalChunks).fill(''),
                receivedChunks: 0
              };
            }

            // Add the chunk at the correct position
            this.fileChunks[fileKey].chunks[chunkIndex] = chunk;
            this.fileChunks[fileKey].receivedChunks += 1;

            console.log(`Received chunk ${chunkIndex + 1}/${totalChunks} for ${fileName}`);

            // If we've received all chunks, process the complete file
            if (this.fileChunks[fileKey].receivedChunks === totalChunks) {
              // Combine all chunks
              const completeFile = this.fileChunks[fileKey].chunks.join('');

              // Process the file
              const result = await uploadPdfAndGetJson(completeFile);

              // Clean up
              delete this.fileChunks[fileKey];

              return { success: true, data: result };
            }

            // If not all chunks received yet, just acknowledge receipt
            return {
              success: true,
              data: {
                message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
                progress: (this.fileChunks[fileKey].receivedChunks / totalChunks) * 100
              }
            };
          } catch (error) {
            console.error("Error processing PDF chunk:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      },
      createDirectPayment: {
        resolve: async (
          parent: unknown,
          args: CreateDirectPaymentArgs,
          context: Context,
        ) => {
          try {
            const { paymentData } = args;
            console.log("Creating direct payment with data:", paymentData.invoiceNumber);

            // This will be replaced with the actual external API call
            // For now, we're just logging the data and returning a success response
            // const response = await axios.post("https://external-api-endpoint.com/direct-payment", paymentData);
            const response = await requestDirectPayment(paymentData);
            if (response.errors && response.errors.length > 0) {
              return {
                success: false,
                error: response.errors[0]
              };
            }
            return {
              success: true,
              data: {
                message: "Direct payment request received successfully",
                response
              }
            };
          } catch (error) {
            console.error("Error creating direct payment:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      },
      processGnosisPayment: {
        resolve: async (parent: unknown, args: ProcessGnosisPaymentArgs, context: unknown) => {
          try {
            const { payerWallet, paymentDetails, invoiceNo } = args;
            // Cast payerWallet to any to access its properties
            const typedPayerWallet = payerWallet as any;

            console.log("Processing gnosis payment:", {
              payerWallet,
              invoiceNo,
              paymentDetails
            });

            // Import and call the executeTokenTransfer function
            const result = await executeTokenTransfer(payerWallet, paymentDetails);

            console.log("Token transfer result:", result);
            
            // Store the transaction information for later matching with webhook
            if (result.success && result.txHash) {
              // Generate a unique ID for this transaction
              const transactionId = `gnosis-${invoiceNo}-${Date.now()}`;
              
              // Store the transaction with all the details needed for matching
              this.pendingTransactions[transactionId] = {
                invoiceNo,
                payerWallet,
                paymentDetails,
                timestamp: Date.now()
              };
              
              console.log(`Stored pending transaction ${transactionId} for invoice ${invoiceNo}`);
            }

            // Return the result without updating the document status yet
            // The status will be updated when the webhook confirms the transaction
            return {
              success: true,
              data: result,
            };
          } catch (error) {
            console.error("Error processing gnosis payment:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      },
      checkAndUpdateInvoicePayment: {
        resolve: async (parent: unknown, args: CheckAndUpdateInvoicePaymentArgs, context: unknown) => {
          try {
            const { invoiceNo } = args;
            
            // Find the pending transaction for this invoice
            let pendingTx = null;
            let txHash = null;
            
            for (const [hash, txInfo] of Object.entries(this.pendingTransactions)) {
              if (txInfo.invoiceNo === invoiceNo) {
                pendingTx = txInfo;
                txHash = hash;
                break;
              }
            }
            
            if (!pendingTx) {
              return {
                success: false,
                message: `No pending transaction found for invoice ${invoiceNo}`
              };
            }
            
            try {
              // Check the current status in the document
              const drive = await this.reactor.getDrive('powerhouse');
              const documents = drive.state.global.nodes.filter((node: any) => node.documentType === 'Invoice');
              
              let currentStatus = 'UNKNOWN';
              let documentId = null;
              
              for (const document of documents) {
                const invoiceDocument = await this.reactor.getDocument('powerhouse', document.id);
                const reactorInvoiceNo = (invoiceDocument.state.global as any).invoiceNo;
                
                if (reactorInvoiceNo === invoiceNo) {
                  currentStatus = (invoiceDocument.state.global as any).status || 'UNKNOWN';
                  documentId = document.id;
                  break;
                }
              }
              
              // If already paid, no need to check further
              if (currentStatus === 'PAID') {
                // Clean up the pending transaction
                if (txHash) {
                  delete this.pendingTransactions[txHash];
                }
                
                return {
                  success: true,
                  message: `Invoice ${invoiceNo} is already marked as PAID`,
                  status: 'PAID'
                };
              }
              
              // In a real implementation, you would check the blockchain for confirmation
              // Here we could use a blockchain provider to check if the transaction has been confirmed
              
              // For example, if using ethers.js:
              // const provider = new ethers.JsonRpcProvider(pendingTx.payerWallet.rpc);
              // const paymentDetails = Array.isArray(pendingTx.paymentDetails) 
              //   ? pendingTx.paymentDetails 
              //   : [pendingTx.paymentDetails];
              
              // For each payment, check if there's a confirmed transaction on the blockchain
              // that matches our expected details (recipient, token, amount)
              
              // For this example, we'll manually update the status
              // In production, you should implement the blockchain check
              await this.updateDocumentStatus(invoiceNo);
              
              // Clean up the pending transaction
              if (txHash) {
                delete this.pendingTransactions[txHash];
              }
              
              return {
                success: true,
                message: `Invoice ${invoiceNo} status updated to PAID`,
                status: 'PAID'
              };
            } catch (error) {
              console.error(`Error checking transaction status for invoice ${invoiceNo}:`, error);
              return {
                success: false,
                message: `Error checking transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          } catch (error) {
            console.error("Error in checkAndUpdateInvoicePayment:", error);
            throw error;
          }
        }
      },
    },
    Query: {
      example: {
        resolve: async (parent: unknown, args: unknown, context: unknown) => {
          return "example";
        },
      },
      checkInvoicePaymentStatus: {
        resolve: async (parent: unknown, args: CheckInvoicePaymentStatusArgs, context: unknown) => {
          try {
            const { invoiceNo } = args;
            
            // Check if the invoice is in any pending transactions
            let isPending = false;
            let pendingTxHash = null;
            
            for (const [txHash, txInfo] of Object.entries(this.pendingTransactions)) {
              if (txInfo.invoiceNo === invoiceNo) {
                isPending = true;
                pendingTxHash = txHash;
                break;
              }
            }
            
            // Check the current status in the document
            const drive = await this.reactor.getDrive('powerhouse');
            const documents = drive.state.global.nodes.filter((node: any) => node.documentType === 'Invoice');
            
            let currentStatus = 'UNKNOWN';
            let documentId = null;
            
            for (const document of documents) {
              const invoiceDocument = await this.reactor.getDocument('powerhouse', document.id);
              const reactorInvoiceNo = (invoiceDocument.state.global as any).invoiceNo;
              
              if (reactorInvoiceNo === invoiceNo) {
                currentStatus = (invoiceDocument.state.global as any).status || 'UNKNOWN';
                documentId = document.id;
                break;
              }
            }
            
            // Get payment details if available
            let paymentDetails = null;
            if (isPending && pendingTxHash) {
              const txInfo = this.pendingTransactions[pendingTxHash];
              const typedPaymentDetails = txInfo.paymentDetails as any;
              
              // Extract relevant payment details for the client
              if (Array.isArray(typedPaymentDetails)) {
                paymentDetails = typedPaymentDetails.map((payment: any) => ({
                  recipient: payment.payeeWallet?.address,
                  token: payment.token?.evmAddress,
                  amount: payment.amount
                }));
              } else {
                paymentDetails = {
                  recipient: typedPaymentDetails.payeeWallet?.address,
                  token: typedPaymentDetails.token?.evmAddress,
                  amount: typedPaymentDetails.amount
                };
              }
            }
            
            return {
              invoiceNo,
              status: currentStatus,
              isPending,
              pendingTxHash,
              documentId,
              paymentDetails
            };
          } catch (error) {
            console.error("Error checking invoice payment status:", error);
            throw error;
          }
        }
      },
    },
  };

  // @ts-ignore
  typeDefs = gql`
    type UploadInvoiceResponse {
      success: Boolean!
      data: JSON
      error: String
    }

    type DirectPaymentResponse {
      success: Boolean!
      data: JSON
      error: String
    }

    type GnosisPaymentResponse {
      success: Boolean!
      data: JSON
      error: String
    }

    scalar JSON

    type Mutation {
      uploadInvoicePdf(pdfData: String!): UploadInvoiceResponse!
      uploadInvoicePdfChunk(
        chunk: String!
        chunkIndex: Int!
        totalChunks: Int!
        fileName: String!
        sessionId: String!
      ): UploadInvoiceResponse!
      processGnosisPayment(
        payerWallet: JSON!
        paymentDetails: JSON!
        invoiceNo: String!
      ): GnosisPaymentResponse!
      createDirectPayment(
        paymentData: JSON!
        invoiceNo: String!
      ): DirectPaymentResponse!
      checkAndUpdateInvoicePayment(invoiceNo: String!): CheckAndUpdateInvoicePaymentResponse!
    }

    type InvoicePaymentStatus {
      invoiceNo: String!
      status: String!
      isPending: Boolean!
      pendingTxHash: String
      documentId: String
      paymentDetails: JSON
    }

    type CheckAndUpdateInvoicePaymentResponse {
      success: Boolean!
      message: String!
      status: String
    }

    type Query {
      example(id: ID!): String
      checkInvoicePaymentStatus(invoiceNo: String!): InvoicePaymentStatus!
    }
  `;

  additionalContextFields = {
    example: "test",
  };

  async onSetup() {
    try {
      if (this.subgraphManager && this.subgraphManager['app']) {
        console.log('Registering webhook handler at /webhook');

        // Add CORS middleware for the webhook route
        this.subgraphManager['app'].post('/webhook',
          cors(), // Add CORS middleware
          express.json(),
          this.handleWebhook.bind(this)
        );
      }

      // Set up a periodic cleanup of old pending transactions
      setInterval(() => this.cleanupOldPendingTransactions(), 3600000); // Run every hour
    } catch (error) {
      console.error('Error in invoice subgraph setup:', error);
    }
  }

  // Webhook handler method
  private async handleWebhook(req: any, res: any) {
    try {
      console.log('Webhook received');
      // Log all headers to debug
      // console.log('Webhook request headers:', req.headers);
      // console.log('Webhook request body:', req.body);

      // Get the request body and signature
      let payload = req.body;
      let rawBody = JSON.stringify(payload);

      const signature = req.headers['x-alchemy-signature'];
      if (!signature) {
        console.warn('Missing signature header');
        // For testing, continue anyway
        // return res.status(400).json({ error: 'Missing signature header' });
      } else {
        // Validate the signature
        const signingKey = process.env.ALCHEMY_SIGNING_KEY || 'whsec_test';
        const isValid = isValidSignatureForStringBody(rawBody, signature, signingKey);

        if (!isValid) {
          console.warn('Invalid signature');
          // For testing, continue anyway
          // return res.status(401).json({ error: 'Invalid signature' });
        }
      }

      // Process the webhook
      // console.log('Processing webhook test button:', payload.event);
      // console.log('Processing webhook payload:', payload.event.activity);

      // Check if this is a transaction confirmation webhook
      if (payload.event && payload.event.activity) {
        const activities = Array.isArray(payload.event.activity) 
          ? payload.event.activity 
          : [payload.event.activity];
        
        for (const activity of activities) {
          // Check if this is a transaction with relevant details
          if (activity.category === 'token' && activity.fromAddress && activity.toAddress && activity.rawContract) {
            console.log(`Processing token transfer from ${activity.fromAddress} to ${activity.toAddress}`);
            
            // Check if we've already processed this transaction
            if (activity.hash && this.processedTransactions.has(activity.hash)) {
              console.log(`Transaction ${activity.hash} has already been processed, skipping`);
              continue;
            }
            
            // Extract transaction details from the activity
            const fromAddress = activity.fromAddress.toLowerCase();
            const toAddress = activity.toAddress.toLowerCase();
            const tokenAddress = activity.rawContract.address.toLowerCase();
            const tokenValue = activity.value || 0;
            const tokenDecimals = activity.rawContract.decimals || 18;
            
            console.log(`Token transfer details: ${tokenValue} of token ${tokenAddress} from ${fromAddress} to ${toAddress}`);
            
            // Look for matching pending transactions based on transaction details
            let matchedInvoiceNo = null;
            let matchedTxHash = null;
            
            for (const [txHash, txInfo] of Object.entries(this.pendingTransactions)) {
              const paymentDetails = Array.isArray(txInfo.paymentDetails) 
                ? txInfo.paymentDetails 
                : [txInfo.paymentDetails];
              
              // Safe transactions may be sent from a different address than the Safe itself
              // So we'll focus on recipient, token, and amount
              
              for (const payment of paymentDetails) {
                // Cast payment to any to access its properties
                const typedPayment = payment as any;
                
                // Check if recipient address matches
                if (typedPayment.payeeWallet && 
                    typedPayment.payeeWallet.address.toLowerCase() === toAddress) {
                  
                  // Check if token address matches
                  if (typedPayment.token && 
                      typedPayment.token.evmAddress.toLowerCase() === tokenAddress) {
                    
                    // Check if amount is similar (allowing for some precision loss)
                    // Convert both to a common format for comparison
                    const expectedAmount = parseFloat(typedPayment.amount);
                    const actualAmount = parseFloat(tokenValue);
                    
                    // Allow for a small difference due to precision issues
                    const amountDifference = Math.abs(expectedAmount - actualAmount);
                    const isAmountSimilar = amountDifference < 0.0001 || 
                                           (expectedAmount > 0 && amountDifference / expectedAmount < 0.01); // 1% tolerance
                    
                    if (isAmountSimilar) {
                      console.log(`Found matching transaction for invoice ${txInfo.invoiceNo}`);
                      console.log(`Expected: ${expectedAmount}, Actual: ${actualAmount}`);
                      matchedInvoiceNo = txInfo.invoiceNo;
                      matchedTxHash = txHash;
                      break;
                    } else {
                      console.log(`Token amounts don't match. Expected: ${expectedAmount}, Actual: ${actualAmount}`);
                    }
                  } else {
                    console.log(`Token addresses don't match. Expected: ${typedPayment.token?.evmAddress}, Actual: ${tokenAddress}`);
                  }
                } else {
                  console.log(`Recipient addresses don't match. Expected: ${typedPayment.payeeWallet?.address}, Actual: ${toAddress}`);
                }
              }
              
              if (matchedInvoiceNo) break;
            }
            
            // If we found a matching transaction, update the invoice status
            if (matchedInvoiceNo) {
              console.log(`Updating status for invoice ${matchedInvoiceNo} to PAID`);
              await this.updateDocumentStatus(matchedInvoiceNo);
              
              // Remove all related transactions from pending
              for (const [txHash, txInfo] of Object.entries(this.pendingTransactions)) {
                if (txInfo.invoiceNo === matchedInvoiceNo) {
                  delete this.pendingTransactions[txHash];
                  console.log(`Removed pending transaction ${txHash} for invoice ${matchedInvoiceNo}`);
                }
              }
              
              // Add to processed transactions to avoid duplicate processing
              if (activity.hash) {
                this.processedTransactions.add(activity.hash);
              }
            } else {
              console.log('No matching pending transaction found for this activity');
            }
          }
        }
      }

      // For testing, just acknowledge receipt
      return res.status(200).json({
        success: true,
        message: 'Webhook received successfully'
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async onDisconnect() { }

  private async updateDocumentStatus(invoiceNo: string): Promise<void> {
    try {
      const drive = await this.reactor.getDrive('powerhouse')
      const documents = drive.state.global.nodes.filter((node: any) => node.documentType === 'Invoice')
      for (const document of documents) {
        const invoiceDocument = await this.reactor.getDocument('powerhouse', document.id)
        const reactorInvoiceNo = (invoiceDocument.state.global as any).invoiceNo
        if (reactorInvoiceNo === invoiceNo) {
          console.log(`Changing status of Invoice No: ${invoiceNo} to PAID`)
          await this.reactor.addAction('powerhouse', document.id, InvoiceActions.editStatus({
            status: "PAID",
          }))
          return Promise.resolve()
        }
      }
    } catch (error) {
      console.error(`Error finding document for invoice ${invoiceNo}:`, error);
      return Promise.reject(error);
    }
  }

  // Add a method to clean up old pending transactions
  private cleanupOldPendingTransactions() {
    const now = Date.now();
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const MAX_PROCESSED_TRANSACTIONS = 1000; // Limit the size of the processed transactions set
    
    let cleanupCount = 0;
    for (const [txHash, txInfo] of Object.entries(this.pendingTransactions)) {
      if (now - txInfo.timestamp > MAX_AGE_MS) {
        delete this.pendingTransactions[txHash];
        cleanupCount++;
      }
    }
    
    // Also clean up the processed transactions set if it gets too large
    if (this.processedTransactions.size > MAX_PROCESSED_TRANSACTIONS) {
      // Convert to array, keep only the most recent transactions
      const txArray = Array.from(this.processedTransactions);
      const toKeep = txArray.slice(-MAX_PROCESSED_TRANSACTIONS/2); // Keep the most recent half
      this.processedTransactions = new Set(toKeep);
      console.log(`Cleaned up processed transactions set from ${txArray.length} to ${toKeep.length} items`);
    }
    
    if (cleanupCount > 0) {
      console.log(`Cleaned up ${cleanupCount} old pending transactions`);
    }
  }
}
