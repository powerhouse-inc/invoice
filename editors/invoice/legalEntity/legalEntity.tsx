/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  EditIssuerBankInput,
  EditIssuerInput,
  EditIssuerWalletInput,
  EditPayerBankInput,
  EditPayerInput,
  EditPayerWalletInput,
  InputMaybe,
  LegalEntity,
  LegalEntityCorporateRegistrationId,
  LegalEntityTaxId,
} from "../../../document-models/invoice/index.js";
import {
  EditIssuerInputSchema,
  EditIssuerWalletInputSchema,
} from "../../../document-models/invoice/gen/schema/zod.js";

import React, { ComponentProps, useEffect, useState } from "react";
import { ComponentPropsWithRef, Ref } from "react";
import { twMerge } from "tailwind-merge";
import { LegalEntityWalletSection } from "./walletSection.js";
import { LegalEntityBankSection } from "./bankSection.js";
import { CountryForm } from "../components/countryForm.js";
import { ValidationResult } from "../validation/validationManager.js";
import { InputField } from "../components/inputField.js";

export type EditLegalEntityWalletInput =
  | EditIssuerWalletInput
  | EditPayerWalletInput;

export type EditLegalEntityBankInput = EditIssuerBankInput | EditPayerBankInput;
export type EditLegalEntityInput = EditIssuerInput | EditPayerInput;

const FieldLabel = ({ children }: { readonly children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700">{children}</label>
);

export type LegalEntityMainSectionProps = Omit<
  ComponentPropsWithRef<"div">,
  "children"
> & {
  readonly value: EditLegalEntityInput;
  readonly onChange: (value: EditLegalEntityInput) => void;
  readonly disabled?: boolean;
  readonly countryvalidation?: ValidationResult | null;
  readonly streetaddressvalidation?: ValidationResult | null;
  readonly cityvalidation?: ValidationResult | null;
  readonly postalcodevalidation?: ValidationResult | null;
  readonly payeremailvalidation?: ValidationResult | null;
};

export const LegalEntityMainSection = (props: LegalEntityMainSectionProps) => {
  const { value, onChange, disabled, countryvalidation, streetaddressvalidation, cityvalidation, postalcodevalidation, payeremailvalidation, ...divProps } = props;

  const handleInputChange =
    (field: keyof EditLegalEntityInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // No-op
    };

  const handleBlur =
    (field: keyof EditLegalEntityInput) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (e.target.value !== value[field]) {
        onChange({ [field]: e.target.value });
      }
    };

  const handleTextareaChange =
    (field: keyof EditLegalEntityInput) =>
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // No-op
    };

  const handleTextareaBlur =
    (field: keyof EditLegalEntityInput) =>
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (e.target.value !== value[field]) {
        onChange({ [field]: e.target.value });
      }
    };

  return (
    <div
      {...divProps}
      className={twMerge(
        "rounded-lg border border-gray-200 bg-white p-6 mb-2",
        props.className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Basic Information
      </h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <InputField
            value={value.name ?? ""}
            label="Name"
            placeholder="Legal Entity Name"
            onBlur={handleTextareaBlur("name")}
            handleInputChange={handleTextareaChange("name")}
            className="h-10 w-full text-md mb-2"
          />
        </div>

        <div className="space-y-2">
          <InputField
            value={value.id ?? ""}
            label="Tax ID / Corp. Reg"
            placeholder="332..."
            onBlur={handleTextareaBlur("id")}
            handleInputChange={handleTextareaChange("id")}
            className="h-10 w-full text-md mb-2"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <InputField
              value={value.streetAddress ?? ""}
              label="Address"
              placeholder="Street Address"
              onBlur={handleTextareaBlur("streetAddress")}
              handleInputChange={handleTextareaChange("streetAddress")}
              className="h-10 w-full text-md mb-2"
              validation={streetaddressvalidation}
            />
            <InputField
              value={value.extendedAddress ?? ""}
              placeholder="Extended Address"
              onBlur={handleTextareaBlur("extendedAddress")}
              handleInputChange={handleTextareaChange("extendedAddress")}
              className="h-10 w-full text-md mb-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <InputField
                value={value.city ?? ""}
                label="City"
                placeholder="City"
                onBlur={handleTextareaBlur("city")}
                handleInputChange={handleTextareaChange("city")}
                className="h-10 w-full text-md mb-2"
                validation={cityvalidation}
              />
            </div>
            <div className="space-y-2">
              <InputField
                value={value.stateProvince ?? ""}
                label="State/Province"
                placeholder="State/Province"
                onBlur={handleTextareaBlur("stateProvince")}
                handleInputChange={handleTextareaChange("stateProvince")}
                className="h-10 w-full text-md mb-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <InputField
                value={value.postalCode ?? ""}
                label="Postal Code"
                placeholder="Postal Code"
                onBlur={handleTextareaBlur("postalCode")}
                handleInputChange={handleTextareaChange("postalCode")}
                className="h-10 w-full text-md mb-2"
                validation={postalcodevalidation}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Country</FieldLabel>
              <CountryForm
                country={value.country ?? ""}
                handleInputChange={handleInputChange("country")}
                handleBlur={handleBlur("country")}
                className="h-10 w-full text-md mb-2"
                validation={countryvalidation}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <InputField
              value={value.email ?? ""}
              label="Email"
              placeholder="Email"
              onBlur={handleTextareaBlur("email")}
              handleInputChange={handleTextareaChange("email")}
              className="h-10 w-full text-md mb-2"
              validation={payeremailvalidation}
            />
          </div>
          <div className="space-y-2">
            <InputField
              value={value.tel ?? ""}
              label="Telephone"
              placeholder="Telephone"
              onBlur={handleTextareaBlur("tel")}
              handleInputChange={handleTextareaChange("tel")}
              className="h-10 w-full text-md mb-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type LegalEntityFormProps = {
  readonly legalEntity: LegalEntity;
  readonly onChangeInfo?: (info: EditLegalEntityInput) => void;
  readonly onChangeBank?: (bank: EditLegalEntityBankInput) => void;
  readonly onChangeWallet?: (wallet: EditLegalEntityWalletInput) => void;
  readonly basicInfoDisabled?: boolean;
  readonly bankDisabled?: boolean;
  readonly walletDisabled?: boolean;
  readonly currency: string;
  readonly status: string;
  readonly walletvalidation?: ValidationResult | null;
  readonly countryvalidation?: ValidationResult | null;
  readonly ibanvalidation?: ValidationResult | null;
  readonly bicvalidation?: ValidationResult | null;
  readonly banknamevalidation?: ValidationResult | null;
  readonly streetaddressvalidation?: ValidationResult | null;
  readonly cityvalidation?: ValidationResult | null;
  readonly postalcodevalidation?: ValidationResult | null;
  readonly payeremailvalidation?: ValidationResult | null;
};

// Helper to flatten LegalEntity to EditLegalEntityInput
function flattenLegalEntityToEditInput(
  legalEntity: LegalEntity
): EditLegalEntityInput {
  let id = "";
  if (typeof legalEntity.id === "string") {
    id = legalEntity.id;
  } else if (legalEntity.id && typeof legalEntity.id === "object") {
    if (legalEntity.id && typeof legalEntity.id === "object") {
      id =
        "taxId" in legalEntity.id
          ? legalEntity.id.taxId
          : legalEntity.id.corpRegId;
    }
  }
  return {
    id,
    name: legalEntity.name ?? "",
    streetAddress: legalEntity.address?.streetAddress ?? "",
    extendedAddress: legalEntity.address?.extendedAddress ?? "",
    city: legalEntity.address?.city ?? "",
    postalCode: legalEntity.address?.postalCode ?? "",
    country: legalEntity.address?.country ?? "",
    stateProvince: legalEntity.address?.stateProvince ?? "",
    tel: legalEntity.contactInfo?.tel ?? "",
    email: legalEntity.contactInfo?.email ?? "",
  };
}

export function LegalEntityForm({
  legalEntity,
  onChangeInfo,
  onChangeBank,
  onChangeWallet,
  basicInfoDisabled,
  bankDisabled,
  walletDisabled,
  currency,
  status,
  walletvalidation,
  countryvalidation,
  ibanvalidation,
  bicvalidation,
  banknamevalidation,
  streetaddressvalidation,
  cityvalidation,
  postalcodevalidation,
  payeremailvalidation
}: LegalEntityFormProps) {
  // Handler for main info section
  const handleChangeInfo = (update: Partial<EditLegalEntityInput>) => {
    if (!onChangeInfo) return;
    onChangeInfo(update);
  };

  return (
    <div className="space-y-8">
      {!basicInfoDisabled && !!onChangeInfo && (
        <LegalEntityMainSection
          onChange={handleChangeInfo}
          value={flattenLegalEntityToEditInput(legalEntity)}
          countryvalidation={countryvalidation}
          streetaddressvalidation={streetaddressvalidation}
          cityvalidation={cityvalidation}
          postalcodevalidation={postalcodevalidation}
          payeremailvalidation={payeremailvalidation}
        />
      )}
      {!walletDisabled && !!onChangeWallet && (
        <LegalEntityWalletSection
          onChange={onChangeWallet}
          value={legalEntity.paymentRouting?.wallet || {}}
          currency={currency}
          status={status}
          walletvalidation={walletvalidation}
        />
      )}
      {!bankDisabled && !!onChangeBank && (
        <LegalEntityBankSection
          onChange={onChangeBank}
          value={legalEntity.paymentRouting?.bank || {}}
          countryvalidation={countryvalidation}
          ibanvalidation={ibanvalidation}
          bicvalidation={bicvalidation}
          banknamevalidation={banknamevalidation}
        />
      )}
    </div>
  );
}
