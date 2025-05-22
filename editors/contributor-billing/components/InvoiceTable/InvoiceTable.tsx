import { useState } from "react";
import { HeaderControls } from "./HeaderControls.js";
import { InvoiceTableSection } from "./InvoiceTableSection.js";
import { InvoiceTableRow } from "./InvoiceTableRow.js";

// Dummy data for demonstration
const demoData = {
  awaitingApproval: [
    { id: 1, issuer: "Alice ltd", invoiceNo: "0x43f20...433DE", issueDate: "0x43f20...433DE", dueDate: "0x43f20...433DE", currency: "$", amount: "10,000" },
    { id: 2, issuer: "Willow Company", invoiceNo: "0x43f20...433DE", issueDate: "0x43f20...433DE", dueDate: "0x43f20...433DE", currency: "USDC", amount: "10,000" },
  ],
  paid: [
    { id: 3, issuer: "Alice ltd", invoiceNo: "0x43f20...433DE", issueDate: "0x43f20...433DE", dueDate: "0x43f20...433DE", currency: "$", amount: "10,000" },
    { id: 4, issuer: "Willow Company", invoiceNo: "0x43f20...433DE", issueDate: "0x43f20...433DE", dueDate: "0x43f20...433DE", currency: "USDC", amount: "10,000" },
  ],
};

export const InvoiceTable = () => {
  // Track selected rows by id
  const [selected, setSelected] = useState<{ [id: number]: boolean }>({});

  // Handlers for selects, search, export, batch actions
  // ...

  // Row menu options by section
  const getMenuOptions = (section: string) => {
    if (section === "paid") {
      return [
        { label: "View Invoice", value: "view-invoice" },
        { label: "View Payment Transaction", value: "view-payment" },
      ];
    }
    if (section === "awaitingApproval") {
      return [
        { label: "Approve", value: "approve" },
        { label: "Reject", value: "reject" },
      ];
    }
    return [];
  };

  return (
    <div className="w-full h-full bg-white rounded-lg p-4 border border-gray-200 shadow-md overflow-y-auto max-h-[500px] mt-4">
      <HeaderControls />
      <InvoiceTableSection title="Awaiting Approval" count={demoData.awaitingApproval.length}>
        <table className="w-full text-sm border-separate border-spacing-0">
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
            {demoData.awaitingApproval.map(row => (
              <InvoiceTableRow
                key={row.id}
                row={row}
                isSelected={!!selected[row.id]}
                onSelect={checked => setSelected(s => ({ ...s, [row.id]: checked }))}
                menuOptions={getMenuOptions("awaitingApproval")}
                onMenuAction={action => {}}
              />
            ))}
          </tbody>
        </table>
      </InvoiceTableSection>
      <InvoiceTableSection title="Paid" count={demoData.paid.length} color="bg-green-100 text-green-600">
        <table className="w-full text-sm border-separate border-spacing-0">
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
            {demoData.paid.map(row => (
              <InvoiceTableRow
                key={row.id}
                row={row}
                isSelected={!!selected[row.id]}
                onSelect={checked => setSelected(s => ({ ...s, [row.id]: checked }))}
                menuOptions={getMenuOptions("paid")}
                onMenuAction={action => {}}
              />
            ))}
          </tbody>
        </table>
      </InvoiceTableSection>
    </div>
  );
};