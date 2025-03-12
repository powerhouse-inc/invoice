/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/button-has-type */
import { RWAButton } from "@powerhousedao/design-system";
import { EditInvoiceInput, DeleteLineItemInput } from "document-models/invoice";
import { forwardRef, useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

// Helper function to format numbers with appropriate decimal places
function formatNumber(value: number): string {
  // Check if the value has decimal places
  const hasDecimals = value % 1 !== 0;
  
  // If no decimals or only trailing zeros after 2 decimal places, show 2 decimal places
  if (!hasDecimals || (value.toFixed(5).endsWith('000'))) {
    return value.toFixed(2);
  }
  
  // Otherwise, show actual decimal places up to 5
  const stringValue = value.toString();
  const decimalPart = stringValue.split('.')[1] || '';
  
  // Determine how many decimal places to show (up to 5)
  const decimalPlaces = Math.min(Math.max(2, decimalPart.length), 5);
  return value.toFixed(decimalPlaces);
}

type LineItem = {
  currency: string;
  description: string;
  id: string;
  quantity: number;
  taxPercent: number;
  totalPriceTaxExcl: number;
  totalPriceTaxIncl: number;
  unitPriceTaxExcl: number;
  unitPriceTaxIncl: number;
};

type EditableLineItem = {
  currency: string;
  description: string;
  id: string;
  quantity: number | string;
  taxPercent: number | string;
  totalPriceTaxExcl: number;
  totalPriceTaxIncl: number;
  unitPriceTaxExcl: number | string;
  unitPriceTaxIncl: number;
};

type EditableLineItemProps = {
  readonly item: Partial<LineItem>;
  readonly onSave: (item: LineItem) => void;
  readonly onCancel: () => void;
  readonly currency: string;
};

const EditableLineItem = forwardRef(function EditableLineItem(
  props: EditableLineItemProps,
  ref: React.Ref<HTMLTableRowElement>,
) {
  const { item, onSave, onCancel, currency } = props;
  const [editedItem, setEditedItem] = useState<Partial<EditableLineItem>>({
    ...item,
    currency,
    quantity: item.quantity ?? "",
    taxPercent: item.taxPercent ?? "",
    unitPriceTaxExcl: item.unitPriceTaxExcl ?? "",
  });

  const calculatedValues = useMemo(() => {
    const quantity = typeof editedItem.quantity === 'string' ? 
      (editedItem.quantity === "" ? 0 : Number(editedItem.quantity)) : 
      (editedItem.quantity ?? 0);
      
    const unitPriceTaxExcl = typeof editedItem.unitPriceTaxExcl === 'string' ? 
      (editedItem.unitPriceTaxExcl === "" ? 0 : Number(editedItem.unitPriceTaxExcl)) : 
      (editedItem.unitPriceTaxExcl ?? 0);
      
    const taxPercent = typeof editedItem.taxPercent === 'string' ? 
      (editedItem.taxPercent === "" ? 0 : Number(editedItem.taxPercent)) : 
      (editedItem.taxPercent ?? 0);

    const totalPriceTaxExcl = quantity * unitPriceTaxExcl;
    const taxAmount = totalPriceTaxExcl * (taxPercent / 100);
    const totalPriceTaxIncl = totalPriceTaxExcl + taxAmount;
    const unitPriceTaxIncl = unitPriceTaxExcl * (1 + taxPercent / 100);

    return {
      totalPriceTaxExcl,
      totalPriceTaxIncl,
      unitPriceTaxIncl,
    };
  }, [editedItem.quantity, editedItem.unitPriceTaxExcl, editedItem.taxPercent]);

  function handleInputChange(field: keyof EditableLineItem) {
    return function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const value = event.target.value;
      
      if (field === "description") {
        setEditedItem((prev) => ({ ...prev, [field]: value }));
        return;
      }
      
      // For numeric fields
      if (value === "" || value === "0") {
        setEditedItem((prev) => ({ ...prev, [field]: value }));
        return;
      }
      
      if (field === "quantity") {
        // Allow only integers for quantity
        if (/^\d+$/.test(value)) {
          setEditedItem((prev) => ({ ...prev, [field]: value }));
        }
      } else if (field === "taxPercent") {
        // Allow only integers from 0-100 for tax percent
        if (/^\d+$/.test(value) && parseInt(value, 10) <= 100) {
          setEditedItem((prev) => ({ ...prev, [field]: value }));
        }
      } else if (field === "unitPriceTaxExcl") {
        // For unit price, allow up to 5 decimal places
        if (/^-?\d*\.?\d{0,5}$/.test(value)) {
          setEditedItem((prev) => ({ ...prev, [field]: value }));
        }
      } else {
        // For other decimal fields
        if (/^-?\d*\.?\d*$/.test(value)) {
          setEditedItem((prev) => ({ ...prev, [field]: value }));
        }
      }
    };
  }

  function handleSave() {
    const quantity = typeof editedItem.quantity === 'string' ? 
      (editedItem.quantity === "" ? 0 : Number(editedItem.quantity)) : 
      (editedItem.quantity ?? 0);
      
    const unitPriceTaxExcl = typeof editedItem.unitPriceTaxExcl === 'string' ? 
      (editedItem.unitPriceTaxExcl === "" ? 0 : Number(editedItem.unitPriceTaxExcl)) : 
      (editedItem.unitPriceTaxExcl ?? 0);
      
    const taxPercent = typeof editedItem.taxPercent === 'string' ? 
      (editedItem.taxPercent === "" ? 0 : Number(editedItem.taxPercent)) : 
      (editedItem.taxPercent ?? 0);
      
    const completeItem: LineItem = {
      id: editedItem.id ?? uuidv4(),
      currency: editedItem.currency!,
      description: editedItem.description ?? "",
      quantity: quantity,
      taxPercent: taxPercent,
      unitPriceTaxExcl: unitPriceTaxExcl,
      unitPriceTaxIncl: calculatedValues.unitPriceTaxIncl,
      totalPriceTaxExcl: calculatedValues.totalPriceTaxExcl,
      totalPriceTaxIncl: calculatedValues.totalPriceTaxIncl,
    };
    onSave(completeItem);
  }

  return (
    <tr ref={ref} className="hover:bg-gray-50">
      <td className="border border-gray-200 p-3">
        <input
          className="w-full rounded border p-1"
          onChange={handleInputChange("description")}
          placeholder="Description"
          type="text"
          value={editedItem.description ?? ""}
        />
      </td>
      <td className="border border-gray-200 p-3">
        <input
          className="w-full rounded border p-1 text-right"
          min="0"
          onChange={handleInputChange("quantity")}
          step="1"
          type="number"
          value={editedItem.quantity ?? ""}
        />
      </td>
      <td className="border border-gray-200 p-3">
        <input
          className="w-full rounded border p-1 text-right"
          min="0"
          onChange={handleInputChange("unitPriceTaxExcl")}
          step="0.00001"
          type="number"
          value={editedItem.unitPriceTaxExcl === 0 ? "" : editedItem.unitPriceTaxExcl ?? ""}
        />
      </td>
      <td className="border border-gray-200 p-3">
        <input
          className="w-full rounded border p-1 text-right"
          max="100"
          min="0"
          onChange={handleInputChange("taxPercent")}
          step="1"
          type="number"
          value={editedItem.taxPercent === 0 ? "" : editedItem.taxPercent ?? ""}
        />
      </td>
      <td className="border border-gray-200 p-3 text-right font-medium">
        {formatNumber(calculatedValues.totalPriceTaxExcl)}
      </td>
      <td className="border border-gray-200 p-3 text-right font-medium">
        {formatNumber(calculatedValues.totalPriceTaxIncl)}
      </td>
      <td className="border border-gray-200 p-3">
        <div className="flex space-x-2">
          <button
            style={{ backgroundColor: "blue" }}
            className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
});

type LineItemsTableProps = {
  readonly lineItems: LineItem[];
  readonly currency: string;
  readonly onAddItem: (item: LineItem) => void;
  readonly onUpdateItem: (item: LineItem) => void;
  readonly onDeleteItem: (input: DeleteLineItemInput) => void;
  readonly onUpdateCurrency: (input: EditInvoiceInput) => void;
};

export function LineItemsTable({
  lineItems,
  currency,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateCurrency,
}: LineItemsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  function handleAddClick() {
    setIsAddingNew(true);
  }

  function handleSaveNewItem(item: LineItem) {
    onAddItem(item);
    setIsAddingNew(false);
  }

  function handleCancelNewItem() {
    setIsAddingNew(false);
  }

  function handleCurrencyChange(event: React.ChangeEvent<HTMLSelectElement>) {
    onUpdateCurrency({ currency: event.target.value });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h4 className="text-xl font-semibold text-gray-900">Line Items</h4>
          <div className="flex items-center gap-2">
            <select
              id="currency"
              className="rounded border border-gray-200 px-2 py-1"
              value={currency}
              onChange={handleCurrencyChange}
            >
              <option value="USD">USD</option>
              <option value="USDS">USDS</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CNY">CNY</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
        </div>

        <RWAButton
          className="mb-2"
          disabled={isAddingNew}
          onClick={handleAddClick}
        >
          Add Line Item
        </RWAButton>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b border-gray-200 p-3 text-left">
                Description
              </th>
              <th className="border-b border-gray-200 p-3 text-right">
                Quantity
              </th>
              <th className="border-b border-gray-200 p-3 text-right">
                Unit Price (excl. tax)
              </th>
              <th className="border-b border-gray-200 p-3 text-right">Tax %</th>
              <th className="border-b border-gray-200 p-3 text-right">
                Total (excl. tax)
              </th>
              <th className="border-b border-gray-200 p-3 text-right">
                Total (incl. tax)
              </th>
              <th className="border-b border-gray-200 p-3 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) =>
              editingId === item.id ? (
                <EditableLineItem
                  currency={currency}
                  item={item}
                  key={item.id}
                  onCancel={() => setEditingId(null)}
                  onSave={(updatedItem) => {
                    onUpdateItem(updatedItem);
                    setEditingId(null);
                  }}
                />
              ) : (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border-b border-gray-200 p-3">
                    {item.description}
                  </td>
                  <td className="border-b border-gray-200 p-3 text-right">
                    {item.quantity}
                  </td>
                  <td className="border-b border-gray-200 p-3 text-right">
                    {formatNumber(item.unitPriceTaxExcl)}
                  </td>
                  <td className="border-b border-gray-200 p-3 text-right">
                    {typeof item.taxPercent === 'number' ? Math.round(item.taxPercent) : 0}%
                  </td>
                  <td className="border-b border-gray-200 p-3 text-right font-medium">
                    {formatNumber(item.totalPriceTaxExcl)}
                  </td>
                  <td className="border-b border-gray-200 p-3 text-right font-medium">
                    {formatNumber(item.totalPriceTaxIncl)}
                  </td>
                  <td className="border-b border-gray-200 p-3">
                    <div className="flex justify-center space-x-2">
                      <button
                        style={{ backgroundColor: "lightblue" }}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                        onClick={() => setEditingId(item.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        onClick={() => onDeleteItem({ id: item.id })}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
            {isAddingNew ? (
              <EditableLineItem
                currency={currency}
                item={{}}
                onCancel={handleCancelNewItem}
                onSave={handleSaveNewItem}
              />
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
