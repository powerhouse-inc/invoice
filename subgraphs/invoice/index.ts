import { Subgraph, Db, Context } from "@powerhousedao/reactor-api";
import { gql } from "graphql-tag";
import { uploadPdfAndGetJson } from "../../scripts/invoice/pdfToDocumentAi";
import { requestDirectPayment } from "./requestFinance";
interface UploadInvoicePdfArgs {
  pdfData: string;
}

interface CreateDirectPaymentArgs {
  paymentData: any; // Will be replaced with a more specific type once API details are known
}

export class InvoiceSubgraph extends Subgraph {
  name = "invoice";
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
      createDirectPayment(paymentData: JSON!): DirectPaymentResponse!
    }

    type Query {
      example(id: ID!): String
    }
  `;

  additionalContextFields = {
    example: "test",
  };

  async onSetup() {
    // await this.createOperationalTables();
  }

  async createOperationalTables() {
    await this.operationalStore.schema.createTableIfNotExists(
      "example",
      (table) => {
        table.string("id").primary();
        table.string("name");
      },
    );
  }

  async onDisconnect() {}
}
