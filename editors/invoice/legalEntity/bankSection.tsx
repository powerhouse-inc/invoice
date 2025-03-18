import {
  ComponentProps,
  ComponentPropsWithRef,
  forwardRef,
  Ref,
  useCallback,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import {
  EditLegalEntityBankInput,
  EditLegalEntityWalletInput,
} from "./legalEntity";
import { CountryForm } from "../components/countryForm";

const FieldLabel = ({ children }: { readonly children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700">{children}</label>
);

const TextInput = forwardRef(function TextInput(
  props: ComponentPropsWithRef<"input">,
  ref: Ref<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={twMerge(
        "h-10 w-full rounded-md border border-gray-200 bg-white px-3 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:p-0",
        props.className,
      )}
      ref={ref}
      type="text"
    />
  );
});

const ACCOUNT_TYPES = ["CHECKING", "SAVINGS", "TRUST"] as const;

const AccountTypeSelect = forwardRef(function AccountTypeSelect(
  props: ComponentPropsWithRef<"select">,
  ref: Ref<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={twMerge(
        "h-10 w-full rounded-md border border-gray-200 bg-white px-3 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:p-0",
        props.className,
      )}
      ref={ref}
    >
      <option value="">Select Account Type</option>
      {ACCOUNT_TYPES.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  );
});

export type LegalEntityBankSectionProps = Omit<
  ComponentPropsWithRef<"div">,
  "children"
> & {
  readonly value: EditLegalEntityBankInput;
  readonly onChange: (value: EditLegalEntityBankInput) => void;
  readonly disabled?: boolean;
};

export const LegalEntityBankSection = forwardRef(
  function LegalEntityBankSection(
    props: LegalEntityBankSectionProps,
    ref: Ref<HTMLDivElement>,
  ) {
    const { value, onChange, disabled, ...divProps } = props;
    const [showIntermediary, setShowIntermediary] = useState(false);

    const handleInputChange = useCallback(
      function handleInputChange(
        field: keyof EditLegalEntityBankInput,
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      ) {
        onChange({
          ...value,
          [field]: event.target.value,
        });
      },
      [onChange, value],
    );

    const handleIntermediaryToggle = useCallback(
      function handleIntermediaryToggle(
        event: React.ChangeEvent<HTMLInputElement>,
      ) {
        setShowIntermediary(event.target.checked);
      },
      [],
    );

    function createInputHandler(field: keyof EditLegalEntityBankInput) {
      return function handleFieldChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      ) {
        handleInputChange(field, event);
      };
    }

    return (
      <div
        {...divProps}
        className={twMerge(
          "rounded-lg border border-gray-200 bg-white p-6",
          props.className,
        )}
        ref={ref}
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Banking Information
        </h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>Account Number</FieldLabel>
              <TextInput
                disabled={disabled}
                onChange={createInputHandler("accountNum")}
                placeholder="Account Number"
                value={value.accountNum ?? ""}
              />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Account Details</FieldLabel>
                  <AccountTypeSelect
                    disabled={disabled}
                    onChange={createInputHandler("accountType")}
                    value={value.accountType ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>ABA/BIC/SWIFT No.</FieldLabel>

                  <TextInput
                    disabled={disabled}
                    onChange={createInputHandler("BIC")}
                    placeholder="ABA/BIC/SWIFT No."
                    value={(value.ABA || value.BIC || value.SWIFT) ?? ""}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <FieldLabel>Beneficiary Information</FieldLabel>
            <TextInput
              disabled={disabled}
              onChange={createInputHandler("beneficiary")}
              placeholder="Beneficiary Name"
              value={value.beneficiary ?? ""}
            />
          </div>

          <div className="space-y-4">
            <FieldLabel>Bank Details</FieldLabel>
            <TextInput
              disabled={disabled}
              onChange={createInputHandler("name")}
              placeholder="Bank Name"
              value={value.name ?? ""}
            />
          </div>

          <div className="space-y-4">
            <FieldLabel>Bank Address</FieldLabel>
            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
              <TextInput
                disabled={disabled}
                onChange={createInputHandler("streetAddress")}
                placeholder="Street Address"
                value={value.streetAddress ?? ""}
              />
              <TextInput
                disabled={disabled}
                onChange={createInputHandler("extendedAddress")}
                placeholder="Extended Address"
                value={value.extendedAddress ?? ""}
              />
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  disabled={disabled}
                  onChange={createInputHandler("city")}
                  placeholder="City"
                  value={value.city ?? ""}
                />
                <TextInput
                  disabled={disabled}
                  onChange={createInputHandler("stateProvince")}
                  placeholder="State/Province"
                  value={value.stateProvince ?? ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  disabled={disabled}
                  onChange={createInputHandler("postalCode")}
                  placeholder="Postal Code"
                  value={value.postalCode ?? ""}
                />
                {/* <TextInput
                  disabled={disabled}
                  onChange={createInputHandler("country")}
                  placeholder="Country"
                  value={value.country ?? ""}
                /> */}
                <CountryForm
                  country={value.country ?? ""}
                  handleInputChange={createInputHandler("country")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Memo</FieldLabel>
            <TextInput
              disabled={disabled}
              onChange={createInputHandler("memo")}
              placeholder="Memo"
              value={value.memo ?? ""}
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center space-x-2">
              <input
                checked={showIntermediary}
                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                id="showIntermediary"
                onChange={handleIntermediaryToggle}
                type="checkbox"
              />
              <span className="text-sm font-medium text-gray-700">
                Include Intermediary Bank
              </span>
            </label>
          </div>

          {showIntermediary ? (
            <div className="bg-blue-50 mt-4 space-y-6 rounded-lg border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Intermediary Bank Details
              </h3>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Account Number
                    </label>
                    <TextInput
                      disabled={disabled}
                      onChange={createInputHandler("accountNumIntermediary")}
                      placeholder="Intermediary Account Number"
                      value={value.accountNumIntermediary ?? ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FieldLabel>Account Details</FieldLabel>
                        <AccountTypeSelect
                          disabled={disabled}
                          onChange={createInputHandler(
                            "accountTypeIntermediary",
                          )}
                          value={value.accountTypeIntermediary ?? ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>ABA/BIC/SWIFT No.</FieldLabel>

                        <TextInput
                          disabled={disabled}
                          onChange={createInputHandler("BICIntermediary")}
                          placeholder="ABA/BIC/SWIFT No."
                          value={
                            (value.ABAIntermediary ||
                              value.BICIntermediary ||
                              value.SWIFTIntermediary) ??
                            ""
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Beneficiary Information
                  </label>
                  <TextInput
                    disabled={disabled}
                    onChange={createInputHandler("beneficiaryIntermediary")}
                    placeholder="Intermediary Beneficiary Name"
                    value={value.beneficiaryIntermediary ?? ""}
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Details
                  </label>
                  <TextInput
                    disabled={disabled}
                    onChange={createInputHandler("nameIntermediary")}
                    placeholder="Intermediary Bank Name"
                    value={value.nameIntermediary ?? ""}
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Address
                  </label>
                  <div className="space-y-4 rounded-lg bg-gray-100 p-4">
                    <TextInput
                      disabled={disabled}
                      onChange={createInputHandler("streetAddressIntermediary")}
                      placeholder="Street Address"
                      value={value.streetAddressIntermediary ?? ""}
                    />
                    <TextInput
                      disabled={disabled}
                      onChange={createInputHandler(
                        "extendedAddressIntermediary",
                      )}
                      placeholder="Extended Address"
                      value={value.extendedAddressIntermediary ?? ""}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <TextInput
                        disabled={disabled}
                        onChange={createInputHandler("cityIntermediary")}
                        placeholder="City"
                        value={value.cityIntermediary ?? ""}
                      />
                      <TextInput
                        disabled={disabled}
                        onChange={createInputHandler(
                          "stateProvinceIntermediary",
                        )}
                        placeholder="State/Province"
                        value={value.stateProvinceIntermediary ?? ""}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TextInput
                        disabled={disabled}
                        onChange={createInputHandler("postalCodeIntermediary")}
                        placeholder="Postal Code"
                        value={value.postalCodeIntermediary ?? ""}
                      />
                      <TextInput
                        disabled={disabled}
                        onChange={createInputHandler("countryIntermediary")}
                        placeholder="Country"
                        value={value.countryIntermediary ?? ""}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Memo
                  </label>
                  <TextInput
                    disabled={disabled}
                    onChange={createInputHandler("memoIntermediary")}
                    placeholder="Memo"
                    value={value.memoIntermediary ?? ""}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);
