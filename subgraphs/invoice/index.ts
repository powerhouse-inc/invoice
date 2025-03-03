import { Subgraph, Db } from "@powerhousedao/reactor-api";
import { gql } from "graphql-tag";
import { uploadPdfAndGetJson } from "../../scripts/invoice/pdfToDocumentAi";

export class InvoiceSubgraph extends Subgraph {
  name = "invoice";
  resolvers = {
    Mutation: {
      uploadInvoicePdf: {
        resolve: async (parent, args, context, info) => {
          try {
            const { pdfData } = args;
            const result = await uploadPdfAndGetJson(pdfData);
            return { success: true, data: result };
          } catch (error) {
            console.error("Error processing PDF:", error);
            return { 
              success: false, 
              error: error instanceof Error ? error.message : "Unknown error" 
            };
          }
        },
      },
    },
    Query: {
      example: {
        resolve: async (parent, args, context, info) => {
          return "example";
        },
      },
    },
  };

  typeDefs = gql`
    type UploadInvoiceResponse {
      success: Boolean!
      data: JSON
      error: String
    }

    scalar JSON

    type Mutation {
      uploadInvoicePdf(pdfData: String!): UploadInvoiceResponse!
    }

    type Query {
      example(id: ID!): String
    }
  `;

  additionalContextFields = {
    example: "test",
  };

  async onSetup() {
    await this.createOperationalTables();
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
