/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/button-has-type */
import { RWAButton } from "@powerhousedao/design-system";
import { EditInvoiceInput, DeleteLineItemInput } from "document-models/invoice";
import { forwardRef, useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

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
  const [editedItem, setEditedItem] = useState<Partial<LineItem>>({
    ...item,
    currency,
    quantity: item.quantity ?? 0,
    taxPercent: item.taxPercent ?? 0,
    unitPriceTaxExcl: item.unitPriceTaxExcl ?? 0,
  });

  const calculatedValues = useMemo(() => {
    const quantity = editedItem.quantity ?? 0;
    const unitPriceTaxExcl = editedItem.unitPriceTaxExcl ?? 0;
    const taxPercent = editedItem.taxPercent ?? 0;

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

  function handleInputChange(field: keyof LineItem) {
    return function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const value = event.target.value;
      setEditedItem((prev) => ({
        ...prev,
        [field]:
          field === "description"
            ? value
            : value === ""
              ? 0
              : parseFloat(value) || 0,
      }));
    };
  }

  function handleSave() {
    const completeItem: LineItem = {
      id: editedItem.id ?? uuidv4(),
      currency: editedItem.currency!,
      description: editedItem.description ?? "",
      quantity: editedItem.quantity ?? 0,
      taxPercent: editedItem.taxPercent ?? 0,
      unitPriceTaxExcl: editedItem.unitPriceTaxExcl ?? 0,
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
          step="0.01"
          type="number"
          value={editedItem.unitPriceTaxExcl ?? ""}
        />
      </td>
      <td className="border border-gray-200 p-3">
        <input
          className="w-full rounded border p-1 text-right"
          max="100"
          min="0"
          onChange={handleInputChange("taxPercent")}
          step="0.1"
          type="number"
          value={editedItem.taxPercent ?? ""}
        />
      </td>
      <td className="border border-gray-200 p-3 text-right font-medium">
        {calculatedValues.totalPriceTaxExcl.toFixed(2)}
      </td>
      <td className="border border-gray-200 p-3 text-right font-medium">
        {calculatedValues.totalPriceTaxIncl.toFixed(2)}
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
                    {item.unitPriceTaxExcl.toFixed(2)}
                  </td>
                  <td className="border-b border-gray-200 p-3 text-right">
                    {item.taxPercent.toFixed(1)}%
                  </td>
                  <td className="border-b border-gray-200 p-3 text-right font-medium">
                    {item.totalPriceTaxExcl.toFixed(2)}
                  </td>
                  <td className="border-b border-gray-200 p-3 text-right font-medium">
                    {item.totalPriceTaxIncl.toFixed(2)}
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
