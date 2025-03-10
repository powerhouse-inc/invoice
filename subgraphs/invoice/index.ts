import { Subgraph, Db, Context } from "@powerhousedao/reactor-api";
import { gql } from "graphql-tag";
import { uploadPdfAndGetJson } from "../../scripts/invoice/pdfToDocumentAi";
import { executeTokenTransfer } from "../../scripts/invoice/gnosisTransactionBuilder";
import { requestDirectPayment } from "./requestFinance";
import { updateInvoiceStatus } from "../../scripts/invoice/main";
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

export class InvoiceSubgraph extends Subgraph {
  name = "invoice";
  private fileChunks: Record<string, { chunks: string[], receivedChunks: number }> = {};


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

            console.log("Processing gnosis payment:", {
              payerWallet,
              invoiceNo,
              paymentDetails
            });

            // Import and call the executeTokenTransfer function

            const result = await executeTokenTransfer(payerWallet, paymentDetails);

            console.log("Token transfer result:", result);

            console.log('Updating invoice status...')

            await updateInvoiceStatus(invoiceNo);

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
    },
    Query: {
      example: {
        resolve: async (parent: unknown, args: unknown, context: unknown) => {
          return "example";
        },
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
      createDirectPayment(paymentData: JSON!): DirectPaymentResponse!
      processGnosisPayment(
        payerWallet: JSON!
        paymentDetails: JSON!
        invoiceNo: String!
      ): DirectPaymentResponse!
    }

    type Query {
      example(id: ID!): String
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
      console.log('Processing webhook payload:', payload.event.activity);

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

  // private async updateDocumentStatus(invoiceNo: string): Promise<void> {
  //   try {
  //     const driveId = "powerhouse";
  //     const drive = await this.reactor.getDrive(driveId);
  //     console.log(drive.state.global.nodes)
  //     const invoiceDocuments = drive.state.global.nodes.filter(
  //       (e: any) => e.documentType === "Invoice"
  //     );
     
  //     if (invoiceDocuments.length === 0) {
  //       console.error(`No invoice documents found for invoice ${invoiceNo}`);
  //       return Promise.reject(new Error(`No invoice documents found for invoice ${invoiceNo}`));
  //     }

  //     for (const document of invoiceDocuments) {
  //       const invoiceDocument = await this.reactor.getDocument(driveId, document.id);
  //       const docInvoiceNo = (invoiceDocument.state.global as any).invoiceNo;
        
  //       if (docInvoiceNo === invoiceNo) {
  //         console.log(
  //           `Changing status of Invoice No: ${invoiceNo} ${(invoiceDocument.state.global as any).status} to PAID`,
  //         );
  //         // this.reactor.addAction(driveId, document.id, invoiceActions.editStatus({
  //         //   status: "PAID",
  //         // }));
  //         return Promise.resolve();
  //       }
  //     }
      
  //     console.error(`Invoice with number ${invoiceNo} not found among ${invoiceDocuments.length} invoices`);
  //     return Promise.reject(new Error(`Invoice with number ${invoiceNo} not found`));
  //   } catch (error) {
  //     console.error(`Error finding document for invoice ${invoiceNo}:`, error);
  //     return Promise.reject(error);
  //   }
  // }
}
