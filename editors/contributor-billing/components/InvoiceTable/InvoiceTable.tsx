import { useState, useMemo, useEffect } from "react";
import { HeaderControls } from "./HeaderControls.js";
import { InvoiceTableSection } from "./InvoiceTableSection.js";
import { InvoiceTableRow } from "./InvoiceTableRow.js";
import { type UiFileNode } from "@powerhousedao/design-system";
import {
  type DriveEditorContext,
  useDriveContext,
} from "@powerhousedao/reactor-browser";
import { type InvoiceState } from "document-models/invoice/index.js";
import { PHDocument } from "document-model";
import { DocumentModelModule } from "document-model";

type Invoice = {
  id: string;
  issuer: string;
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  amount: string;
};

const statusOptions = [
  { label: "Awaiting Approval", value: "AWAITINGAPPROVAL" },
  { label: "Awaiting Payment", value: "AWAITINGPAYMENT" },
  { label: "Payment Received", value: "PAYMENTRECEIVED" },
  { label: "Rejected", value: "REJECTED" },
];

interface InvoiceTableProps {
  files: UiFileNode[];
  state: Record<string, any>;
  setActiveDocumentId: (id: string) => void;
  getDispatch: () => (action: any, onErrorCallback?: any) => void;
  selected: { [id: string]: boolean };
  setSelected: (selected: { [id: string]: boolean } | ((prev: { [id: string]: boolean }) => { [id: string]: boolean })) => void;
  onBatchAction: (action: string) => void;
}

export const InvoiceTable = ({
  files,
  state,
  setActiveDocumentId,
  getDispatch,
  selected,
  setSelected,
  onBatchAction,
}: InvoiceTableProps) => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const getMenuOptions = () => {
    return [
      { label: "View Invoice", value: "view-invoice" },
      // { label: "View Payment Transaction", value: "view-payment" },
    ];
  };

  const handleStatusChange = (value: string | string[]) => {
    setSelectedStatuses(Array.isArray(value) ? value : [value]);
  };

  const shouldShowSection = (status: string) => {
    return selectedStatuses.length === 0 || selectedStatuses.includes(status);
  };

  const getInvoicesByStatus = (status: string) => {
    return Object.entries(state)
      .filter(
        ([_, doc]) =>
          doc.documentType === "powerhouse/invoice" &&
          doc.global.status === status
      )
      .map(([id, doc]) => ({
        id,
        issuer: doc.global.issuer?.name || "Unknown",
        invoiceNo: doc.global.invoiceNo,
        issueDate: doc.global.dateIssued,
        dueDate: doc.global.dateDue,
        currency: doc.global.currency,
        amount: doc.global.totalPriceTaxIncl?.toString() ?? "",
      }));
  };

  const awaitingApproval = getInvoicesByStatus("ISSUED");
  const awaitingPayment = getInvoicesByStatus("AWAITINGPAYMENT");
  const paid = getInvoicesByStatus("PAYMENTRECEIVED");
  const rejected = getInvoicesByStatus("REJECTED");

  return (
    <div className="w-full h-full bg-white rounded-lg p-4 border border-gray-200 shadow-md overflow-y-auto max-h-[500px] mt-4">
      <HeaderControls
        statusOptions={statusOptions}
        onStatusChange={handleStatusChange}
        onBatchAction={onBatchAction}
      />
      {shouldShowSection("AWAITINGAPPROVAL") && (
        <InvoiceTableSection
          title="Awaiting Approval"
          count={awaitingApproval.length}
        >
          <table className="w-full text-sm border-separate border-spacing-0 border border-gray-400">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 w-8"></th>
                <th className="px-2 py-2 text-left">Issuer</th>
                <th className="px-2 py-2 text-left">Invoice No.</th>
                <th className="px-2 py-2 text-left">Issue Date</th>
                <th className="px-2 py-2 text-left">Due Date</th>
                <th className="px-2 py-2 text-left">Currency</th>
                <th className="px-2 py-2 text-left">Amount</th>
                <th className="px-2 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {awaitingApproval.map((row) => (
                <InvoiceTableRow
                  key={row.id}
                  row={row}
                  isSelected={!!selected[row.id]}
                  onSelect={(checked) =>
                    setSelected((prev: { [id: string]: boolean }) => ({ ...prev, [row.id]: checked }))
                  }
                  menuOptions={getMenuOptions()}
                  onMenuAction={(action) => {}}
                  setActiveDocumentId={setActiveDocumentId}
                />
              ))}
            </tbody>
          </table>
        </InvoiceTableSection>
      )}
      {shouldShowSection("AWAITINGPAYMENT") && (
        <InvoiceTableSection
          title="Awaiting Payment"
          count={awaitingPayment.length}
          color="bg-yellow-100 text-yellow-600"
        >
          <table className="w-full text-sm border-separate border-spacing-0 border border-gray-400">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 w-8"></th>
                <th className="px-2 py-2 text-left">Issuer</th>
                <th className="px-2 py-2 text-left">Invoice No.</th>
                <th className="px-2 py-2 text-left">Issue Date</th>
                <th className="px-2 py-2 text-left">Due Date</th>
                <th className="px-2 py-2 text-left">Currency</th>
                <th className="px-2 py-2 text-left">Amount</th>
                <th className="px-2 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {awaitingPayment.map((row) => (
                <InvoiceTableRow
                  key={row.id}
                  row={row}
                  isSelected={!!selected[row.id]}
                  onSelect={(checked) =>
                    setSelected((prev: { [id: string]: boolean }) => ({ ...prev, [row.id]: checked }))
                  }
                  menuOptions={getMenuOptions()}
                  onMenuAction={(action) => {}}
                  setActiveDocumentId={setActiveDocumentId}
                />
              ))}
            </tbody>
          </table>
        </InvoiceTableSection>
      )}
      {shouldShowSection("PAYMENTRECEIVED") && (
        <InvoiceTableSection
          title="Payment Received"
          count={paid.length}
          color="bg-green-100 text-green-600"
        >
          <table className="w-full text-sm border-separate border-spacing-0 border border-gray-400">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 w-8"></th>
                <th className="px-2 py-2 text-left">Issuer</th>
                <th className="px-2 py-2 text-left">Invoice No.</th>
                <th className="px-2 py-2 text-left">Issue Date</th>
                <th className="px-2 py-2 text-left">Due Date</th>
                <th className="px-2 py-2 text-left">Currency</th>
                <th className="px-2 py-2 text-left">Amount</th>
                <th className="px-2 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {paid.map((row) => (
                <InvoiceTableRow
                  key={row.id}
                  row={row}
                  isSelected={!!selected[row.id]}
                  onSelect={(checked) =>
                    setSelected((prev: { [id: string]: boolean }) => ({ ...prev, [row.id]: checked }))
                  }
                  menuOptions={getMenuOptions()}
                  onMenuAction={(action) => {}}
                  setActiveDocumentId={setActiveDocumentId}
                />
              ))}
            </tbody>
          </table>
        </InvoiceTableSection>
      )}
      {shouldShowSection("REJECTED") && (
        <InvoiceTableSection
          title="Rejected"
          count={rejected.length}
          color="bg-red-500 text-black-600"
        >
          <table className="w-full text-sm border-separate border-spacing-0 border border-gray-400">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 w-8"></th>
                <th className="px-2 py-2 text-left">Issuer</th>
                <th className="px-2 py-2 text-left">Invoice No.</th>
                <th className="px-2 py-2 text-left">Issue Date</th>
                <th className="px-2 py-2 text-left">Due Date</th>
                <th className="px-2 py-2 text-left">Currency</th>
                <th className="px-2 py-2 text-left">Amount</th>
                <th className="px-2 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rejected.map((row) => (
                <InvoiceTableRow
                  key={row.id}
                  row={row}
                  isSelected={!!selected[row.id]}
                  onSelect={(checked) =>
                    setSelected((prev: { [id: string]: boolean }) => ({ ...prev, [row.id]: checked }))
                  }
                  menuOptions={getMenuOptions()}
                  onMenuAction={(action) => {}}
                  setActiveDocumentId={setActiveDocumentId}
                />
              ))}
            </tbody>
          </table>
        </InvoiceTableSection>
      )}
    </div>
  );
};
