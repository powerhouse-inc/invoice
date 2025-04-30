/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { generateMock } from "@powerhousedao/codegen";
import utils from "../../gen/utils.js";
import {
  z,
  type EditInvoiceInput,
  type EditStatusInput,
  type AddRefInput,
  type EditRefInput,
  type DeleteRefInput,
} from "../../gen/schema/index.js";
import { reducer } from "../../gen/reducer.js";
import * as creators from "../../gen/general/creators.js";
import type { InvoiceDocument } from "../../gen/types.js";

describe("General Operations", () => {
  let document: InvoiceDocument;

  beforeEach(() => {
    document = utils.createDocument();
  });

  it("should handle editInvoice operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: EditInvoiceInput = generateMock(z.EditInvoiceInputSchema());

    const updatedDocument = reducer(document, creators.editInvoice(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("EDIT_INVOICE");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle editStatus operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: EditStatusInput = generateMock(z.EditStatusInputSchema());

    const updatedDocument = reducer(document, creators.editStatus(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("EDIT_STATUS");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle addRef operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: AddRefInput = generateMock(z.AddRefInputSchema());

    const updatedDocument = reducer(document, creators.addRef(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("ADD_REF");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle editRef operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: EditRefInput = generateMock(z.EditRefInputSchema());

    const updatedDocument = reducer(document, creators.editRef(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("EDIT_REF");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle deleteRef operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: DeleteRefInput = generateMock(z.DeleteRefInputSchema());

    const updatedDocument = reducer(document, creators.deleteRef(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("DELETE_REF");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
