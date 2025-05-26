/**
 * Utility function to upload a PDF file in chunks
 * @param pdfData Base64 encoded PDF data
 * @param endpoint GraphQL endpoint
 * @param chunkSize Size of each chunk in bytes (default: 500KB)
 * @param onProgress Callback for upload progress
 */

let GRAPHQL_URL = 'http://localhost:4001/graphql/invoice'

if (window.document.baseURI !== 'http://localhost:3000/') {
  GRAPHQL_URL = 'https://switchboard-staging.powerhouse.xyz/graphql/invoice'
}

export async function uploadPdfChunked(
  pdfData: string,
  endpoint: string = GRAPHQL_URL,
  chunkSize: number = 500 * 1024, // 500KB chunks
  onProgress?: (progress: number) => void,
): Promise<any> {
  // Generate a unique session ID for this upload
  const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const fileName = `invoice_${Date.now()}.pdf`;

  // Calculate total chunks
  const totalChunks = Math.ceil(pdfData.length / chunkSize);
  console.log(
    `Splitting file into ${totalChunks} chunks of ${chunkSize} bytes each`,
  );

  // Upload each chunk
  const results = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, pdfData.length);
    const chunk = pdfData.substring(start, end);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation Invoice_uploadInvoicePdfChunk(
            $chunk: String!
            $chunkIndex: Int!
            $totalChunks: Int!
            $fileName: String!
            $sessionId: String!
          ) {
            Invoice_uploadInvoicePdfChunk(
              chunk: $chunk
              chunkIndex: $chunkIndex
              totalChunks: $totalChunks
              fileName: $fileName
              sessionId: $sessionId
            ) {
              success
              data
              error
            }
          }
        `,
        variables: {
          chunk,
          chunkIndex: i,
          totalChunks,
          fileName,
          sessionId,
        },
      }),
    });

    const result = await response.json();
    results.push(result);

    // Call progress callback if provided
    if (onProgress) {
      onProgress(((i + 1) / totalChunks) * 100);
    }

    // If this is the last chunk and it was successful, return the final result
    if (i === totalChunks - 1 && result.data?.Invoice_uploadInvoicePdfChunk?.success) {
      return result.data.Invoice_uploadInvoicePdfChunk;
    }
  }

  // If we get here, something went wrong
  const lastResult = results[results.length - 1];
  return (
    lastResult?.data?.Invoice_uploadInvoicePdfChunk || {
      success: false,
      error: "Failed to upload all chunks",
    }
  );
}
