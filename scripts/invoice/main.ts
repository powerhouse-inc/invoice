import { IBaseDocumentDriveServer, IOperationResult } from "document-drive";
import { createReactorAndCreateLocalDrive } from "../utils/drive-actions";
import { Invoice, actions as invoiceActions, InvoiceDocument } from "../../document-models/invoice";

export const updateInvoiceStatus = async (
  invoiceNumber: string,
): Promise<void> => {
  const driveServer = (await createReactorAndCreateLocalDrive(
    "http://localhost:4001/d/powerhouse",
  )) as IBaseDocumentDriveServer;

  const driveIds = await driveServer.getDrives();
  if (!driveIds.length) {
    throw new Error("No drives found");
  }

  const driveId = driveIds[0];
  let drive = await driveServer.getDrive(driveId);

  // Find Invoice Document
  const foundDocument = drive.state.global.nodes.filter(
    (e: any) => e.documentType === "Invoice",
  );

  if (foundDocument.length === 0) {
    throw new Error("Invoice Document not found");
  }

  try {
    foundDocument.forEach(async (document: { id: string }) => {
      const invoiceDocument = (await driveServer.getDocument(
        driveId,
        document.id,
      )) as InvoiceDocument;
      const invoiceNo = (invoiceDocument.state.global as any).invoiceNo;
      if (invoiceNo === invoiceNumber) {
        console.log(
          `Changing status of Invoice No: ${invoiceNo} ${invoiceDocument.state.global.status} to PAID`,
        );

        // @ts-ignore
        const documentStatus = (await setInvoiceStatus(
          driveServer,
          driveId,
          document.id,
        )) as unknown as IOperationResult<Invoice>;
        console.log(
          "Changed Status:",
          documentStatus.document?.state.global.status,
        );
        return Promise.resolve();
      }
    });
  } catch (error: any) {
    console.error("Error updating invoice status:", error.message);
    // return Promise.reject(error);
  }
};

const setInvoiceStatus = async (
  driveServer: IBaseDocumentDriveServer,
  driveId: string,
  documentId: string,
) => {
  return driveServer.addAction(
    driveId,
    documentId,
    invoiceActions.editStatus({
      status: "PAID",
    }),
  );
};
