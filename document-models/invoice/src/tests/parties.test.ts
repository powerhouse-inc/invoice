/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import { generateMock } from "@powerhousedao/codegen";
import { utils as documentModelUtils } from "document-model/document";

import utils from "../../gen/utils";
import {
  z,
  EditIssuerInput,
  EditIssuerBankInput,
  EditIssuerWalletInput,
  EditPayerInput,
  EditPayerBankInput,
  EditPayerWalletInput,
} from "../../gen/schema";
import { reducer } from "../../gen/reducer";
import * as creators from "../../gen/parties/creators";
import { InvoiceDocument } from "../../gen/types";

describe("Parties Operations", () => {
  let document: InvoiceDocument;

  beforeEach(() => {
    document = utils.createDocument();
  });

  it("should handle editIssuer operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: EditIssuerInput = generateMock(z.EditIssuerInputSchema());

    const updatedDocument = reducer(document, creators.editIssuer(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("EDIT_ISSUER");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle editIssuerBank operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: EditIssuerBankInput = generateMock(
      z.EditIssuerBankInputSchema(),
    );

    const updatedDocument = reducer(document, creators.editIssuerBank(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("EDIT_ISSUER_BANK");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle editIssuerWallet operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: EditIssuerWalletInput = generateMock(
      z.EditIssuerWalletInputSchema(),
    );

    const updatedDocument = reducer(document, creators.editIssuerWallet(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe(
      "EDIT_ISSUER_WALLET",
    );
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle editPayer operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: EditPayerInput = generateMock(z.EditPayerInputSchema());

    const updatedDocument = reducer(document, creators.editPayer(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("EDIT_PAYER");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle editPayerBank operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: EditPayerBankInput = generateMock(
      z.EditPayerBankInputSchema(),
    );

    const updatedDocument = reducer(document, creators.editPayerBank(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("EDIT_PAYER_BANK");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
  it("should handle editPayerWallet operation", () => {
    // generate a random id
    // const id = documentModelUtils.hashKey();

    const input: EditPayerWalletInput = generateMock(
      z.EditPayerWalletInputSchema(),
    );

    const updatedDocument = reducer(document, creators.editPayerWallet(input));

    expect(updatedDocument.operations.global).toHaveLength(1);
    expect(updatedDocument.operations.global[0].type).toBe("EDIT_PAYER_WALLET");
    expect(updatedDocument.operations.global[0].input).toStrictEqual(input);
    expect(updatedDocument.operations.global[0].index).toEqual(0);
  });
});
