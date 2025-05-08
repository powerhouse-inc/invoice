/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type Subgraph } from "@powerhousedao/reactor-api";
import { addFile } from "document-drive";
import { actions } from "../../document-models/invoice/index.js";
import { generateId } from "document-model";
import { uploadPdfAndGetJson } from "../../scripts/invoice/pdfToDocumentAi.js";
import { requestDirectPayment } from "../../scripts/invoice/requestFinance.js";
import { executeTokenTransfer } from "../../scripts/invoice/gnosisTransactionBuilder.js";
import * as crypto from "crypto";

const DEFAULT_DRIVE_ID = "powerhouse";

interface UploadInvoicePdfChunkArgs {
  chunk: string;
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  sessionId: string;
}

// Define a type for the file chunks data
interface FileChunksData {
  chunks: string[];
  receivedChunks: number;
}

// Create a Map to store file chunks data
const fileChunksMap = new Map<string, FileChunksData>();

let pendingTransactions: Record<string, { 
  invoiceNo: string, 
  payerWallet: any, 
  paymentDetails: any, 
  timestamp: number
}> = {};

// Add a set to track processed transaction hashes to avoid duplicate processing
let processedTransactions: Set<string> = new Set();

let reactor: any;

export const getResolvers = (subgraph: Subgraph): Record<string, any> => {
  reactor = subgraph.reactor;

  return {
    Query: {
      Invoice: async (_: any, args: any, ctx: any) => {
        return {
          getDocument: async (args: any) => {
            const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
            const docId: string = args.docId || "";
            const doc = await reactor.getDocument(driveId, docId);
            return {
              id: docId,
              driveId: driveId,
              ...doc,
              state: doc.state.global,
              stateJSON: doc.state.global,
              revision: doc.revision.global,
            };
          },
          getDocuments: async (args: any) => {
            const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
            const docsIds = await reactor.getDocuments(driveId);
            const docs = await Promise.all(
              docsIds.map(async (docId: any) => {
                const doc = await reactor.getDocument(driveId, docId);
                return {
                  id: docId,
                  driveId: driveId,
                  ...doc,
                  state: doc.state.global,
                  stateJSON: doc.state.global,
                  revision: doc.revision.global,
                };
              }),
            );

            return docs.filter(
              (doc) => doc.documentType === "powerhouse/invoice",
            );
          },
        };
      },
    },
    Mutation: {
      Invoice_createDocument: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId = generateId();

        await reactor.addDriveAction(
          driveId,
          addFile({
            id: docId,
            name: args.name,
            documentType: "powerhouse/invoice",
            synchronizationUnits: [
              {
                branch: "main",
                scope: "global",
                syncId: generateId(),
              },
              {
                branch: "main",
                scope: "local",
                syncId: generateId(),
              },
            ],
          }),
        );

        return docId;
      },

      Invoice_editInvoice: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editInvoice({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_editStatus: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editStatus({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_addRef: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.addRef({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_editRef: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editRef({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_deleteRef: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.deleteRef({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_editIssuer: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editIssuer({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_editIssuerBank: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editIssuerBank({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_editIssuerWallet: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editIssuerWallet({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_editPayer: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editPayer({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_editPayerBank: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editPayerBank({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_editPayerWallet: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editPayerWallet({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_addLineItem: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.addLineItem({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_editLineItem: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.editLineItem({ ...args.input }),
        );

        return doc.revision.global + 1;
      },

      Invoice_deleteLineItem: async (_: any, args: any) => {
        const driveId: string = args.driveId || DEFAULT_DRIVE_ID;
        const docId: string = args.docId || "";
        const doc = await reactor.getDocument(driveId, docId);

        await reactor.addAction(
          driveId,
          docId,
          actions.deleteLineItem({ ...args.input }),
        );

        return doc.revision.global + 1;
      },
      Invoice_uploadInvoicePdfChunk: async (_: any, args: any) => {
        try {
          const { chunk, chunkIndex, totalChunks, fileName, sessionId } = args;
          const fileKey = `${sessionId}_${fileName}`;

          // Initialize array for this file if it doesn't exist
          if (!fileChunksMap.has(fileKey)) {
            fileChunksMap.set(fileKey, {
              chunks: new Array(totalChunks).fill(''),
              receivedChunks: 0
            });
          }

          // Get the file chunks data
          const fileData = fileChunksMap.get(fileKey)!;

          // Add the chunk at the correct position
          fileData.chunks[chunkIndex] = chunk;
          fileData.receivedChunks += 1;

          console.log(`Received chunk ${chunkIndex + 1}/${totalChunks} for ${fileName}`);

          // If we've received all chunks, process the complete file
          if (fileData.receivedChunks === totalChunks) {
            // Combine all chunks
            const completeFile = fileData.chunks.join('');

            // Process the file
            const result = await uploadPdfAndGetJson(completeFile);

            // Clean up
            fileChunksMap.delete(fileKey);

            return {
              success: true,
              data: result
            };
          }

          // If not all chunks received yet, just acknowledge receipt
          return {
            success: true,
            data: {
              message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
              progress: (fileData.receivedChunks / totalChunks) * 100
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
      Invoice_createRequestFinancePayment: async (_: any, args: any) => {

        try {
          const { paymentData } = args;
          if (!paymentData) {
            return {
              success: false,
              error: "No payment data provided"
            };
          }
          console.log("Creating direct payment with data:", paymentData.invoiceNumber);

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
      Invoice_processGnosisPayment: async (_: any, args: any) => {
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
            pendingTransactions[transactionId] = {
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
  };
};

// Add a method to clean up old pending transactions
export const cleanupOldPendingTransactions = () => {
  const now = Date.now();
  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const MAX_PROCESSED_TRANSACTIONS = 1000; // Limit the size of the processed transactions set
  
  let cleanupCount = 0;
  for (const [txHash, txInfo] of Object.entries(pendingTransactions)) {
    if (now - txInfo.timestamp > MAX_AGE_MS) {
      delete pendingTransactions[txHash];
      cleanupCount++;
    }
  }
  
  // Also clean up the processed transactions set if it gets too large
  if (processedTransactions.size > MAX_PROCESSED_TRANSACTIONS) {
    // Convert to array, keep only the most recent transactions
    const txArray = Array.from(processedTransactions);
    const toKeep = txArray.slice(-MAX_PROCESSED_TRANSACTIONS/2); // Keep the most recent half
    processedTransactions = new Set(toKeep);
    console.log(`Cleaned up processed transactions set from ${txArray.length} to ${toKeep.length} items`);
  }
  
  if (cleanupCount > 0) {
    console.log(`Cleaned up ${cleanupCount} old pending transactions`);
  }
}

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

const updateDocumentStatus = async (invoiceNo: string): Promise<void> => {
  try {
    const drive = await reactor.getDrive('powerhouse')
    const documents = drive.state.global.nodes.filter((node: any) => node.documentType === 'powerhouse/invoice')
    if(documents.length === 0) {
      console.log(`No documents found for invoice ${invoiceNo}`)
      return Promise.reject(new Error(`No documents found for invoice ${invoiceNo}`))
    }
    for (const document of documents) {
      const invoiceDocument = await reactor.getDocument('powerhouse', document.id)
      const reactorInvoiceNo = (invoiceDocument.state.global as any).invoiceNo
      if (reactorInvoiceNo === invoiceNo) {
        console.log(`Changing status of Invoice No: ${invoiceNo} to PAID`)
        await reactor.addAction('powerhouse', document.id, actions.editStatus({
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

// Webhook handler method
export const handleWebhook = async (req: any, res: any) => {
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
          if (activity.hash && processedTransactions.has(activity.hash)) {
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
          
          for (const [txHash, txInfo] of Object.entries(pendingTransactions)) {
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
            await updateDocumentStatus(matchedInvoiceNo);
            
            // Remove all related transactions from pending
            for (const [txHash, txInfo] of Object.entries(pendingTransactions)) {
              if (txInfo.invoiceNo === matchedInvoiceNo) {
                delete pendingTransactions[txHash];
                console.log(`Removed pending transaction ${txHash} for invoice ${matchedInvoiceNo}`);
              }
            }
            
            // Add to processed transactions to avoid duplicate processing
            if (activity.hash) {
              processedTransactions.add(activity.hash);
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