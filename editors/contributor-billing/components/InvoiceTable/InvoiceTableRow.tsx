import { useState, useRef } from "react";
import { RowActionMenu } from "./RowActionMenu.js";
import { UiFileNode } from "@powerhousedao/design-system";

export const InvoiceTableRow = ({
  row,
  isSelected,
  onSelect,
  menuOptions,
  onMenuAction,
  setActiveDocumentId
}: {
  row: any;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  menuOptions: { label: string; value: string }[];
  onMenuAction: (action: string) => void;
  setActiveDocumentId: (id: string) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLTableCellElement>(null);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-2 py-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={e => onSelect(e.target.checked)}
          className="size-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="px-2 py-2">{row.issuer}</td>
      <td className="px-2 py-2">{row.invoiceNo}</td>
      <td className="px-2 py-2">{row.issueDate}</td>
      <td className="px-2 py-2">{row.dueDate}</td>
      <td className="px-2 py-2">{row.currency}</td>
      <td className="px-2 py-2">{row.amount}</td>
      <td className="px-2 py-2 text-right relative" ref={menuRef}>
        <div className="relative inline-block">
          <button
            className="px-2 py-1 hover:bg-gray-200 rounded"
            onClick={() => setMenuOpen(v => !v)}
          >
            &#x2026;
          </button>
          {menuOpen && (
            <>
              {/* Overlay to catch outside clicks */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <RowActionMenu
                options={menuOptions}
                onAction={action => {
                  onMenuAction(action);
                  setMenuOpen(false);
                  setActiveDocumentId(row.id);
                }}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );
}; 