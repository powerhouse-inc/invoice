/**
 * This is a scaffold file meant for customization:
 * - modify it by implementing the reducer functions
 * - delete the file and run the code generator again to have it reset
 */

import type { InvoiceItemsOperations } from "../../gen/items/operations.js";
import type { InvoiceLineItem, InvoiceState, InvoiceLineItemTag } from "../../gen/types.js";

export const reducer: InvoiceItemsOperations = {
  addLineItemOperation(state, action, dispatch) {
    try {
      const item: InvoiceLineItem = {
        ...action.input,
        lineItemTag: [],
      };

      if (state.lineItems.find((x) => x.id === item.id))
        throw new Error("Duplicate input.id");

      validatePrices(item as InvoiceLineItem);
      state.lineItems.push(item as InvoiceLineItem);
      updateTotals(state);
    } catch (e) {
      console.error(e);
    }
  },

  editLineItemOperation(state, action, dispatch) {
    try {
      const stateItem = state.lineItems.find((x) => x.id === action.input.id);
      if (!stateItem) throw new Error("Item matching input.id not found");

      const sanitizedInput = Object.fromEntries(
        Object.entries(action.input).filter(([, value]) => value !== null),
      ) as Partial<InvoiceLineItem>;

      // Ensure lineItemTag is always an array if provided
      if ('lineItemTag' in action.input) {
        sanitizedInput.lineItemTag = (action.input.lineItemTag ?? []) as any;
      }

      const nextItem: InvoiceLineItem = {
        ...stateItem,
        ...sanitizedInput,
      };

      validatePrices(nextItem);
      Object.assign(stateItem, nextItem);
      updateTotals(state);
    } catch (e) {
      console.error(e);
    }
  },

  deleteLineItemOperation(state, action, dispatch) {
    try {
      state.lineItems = state.lineItems.filter((x) => x.id !== action.input.id);
      updateTotals(state);
    } catch (e) {
      console.error(e);
    }
  },

  setLineItemTagOperation(state, action, dispatch) {
    try {
      const stateItem = state.lineItems.find((x) => x.id === action.input.id);
      if (!stateItem) throw new Error("Item matching input.id not found");

      const newTag: InvoiceLineItemTag = {
        dimension: action.input.dimension,
        value: action.input.value,
        label: action.input.label || null,
      };

      // Remove existing tag with same dimension if it exists
      stateItem.lineItemTag = stateItem.lineItemTag.filter(
        (tag) => tag.dimension !== action.input.dimension
      );

      // Add the new tag
      stateItem.lineItemTag.push(newTag);
    } catch (e) {
      console.error(e);
    }
  },
};


function updateTotals(state: InvoiceState) {
  state.totalPriceTaxExcl = state.lineItems.reduce((total, lineItem) => {
    return total + lineItem.quantity * lineItem.unitPriceTaxExcl;
  }, 0.0);

  state.totalPriceTaxIncl = state.lineItems.reduce((total, lineItem) => {
    return total + lineItem.quantity * lineItem.unitPriceTaxIncl;
  }, 0.0);
}

function validatePrices(item: InvoiceLineItem) {
  const EPSILON = 0.00001; // Small value for floating point comparisons
  
  // Calculate total prices from unit prices and quantity
  const calcPriceIncl = item.quantity * item.unitPriceTaxIncl;
  const calcPriceExcl = item.quantity * item.unitPriceTaxExcl;

  // Convert tax percentage to decimal rate
  const taxRate = item.taxPercent / 100;

  // Helper function to compare floating point numbers
  const isClose = (a: number, b: number) => Math.abs(a - b) < EPSILON;

  // Validate unit prices (tax-exclusive should equal tax-inclusive / (1 + taxRate))
  const expectedUnitPriceExcl = item.unitPriceTaxIncl / (1 + taxRate);
  if (!isClose(item.unitPriceTaxExcl, expectedUnitPriceExcl)) {
    throw new Error("Tax inclusive/exclusive unit prices failed comparison.");
  }

  // Validate total prices
  if (!isClose(calcPriceIncl, item.totalPriceTaxIncl)) {
    throw new Error("Calculated unitPriceTaxIncl does not match input total");
  }

  if (!isClose(calcPriceExcl, item.totalPriceTaxExcl)) {
    throw new Error("Calculated unitPriceTaxExcl does not match input total");
  }

  // Validate total prices using the tax rate
  const expectedTotalPriceExcl = calcPriceIncl / (1 + taxRate);
  if (!isClose(calcPriceExcl, expectedTotalPriceExcl)) {
    throw new Error("Tax inclusive/exclusive totals failed comparison.");
  }
}