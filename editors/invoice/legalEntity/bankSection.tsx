import {
  ComponentPropsWithRef,
  forwardRef,
  Ref,
  useCallback,
  useState,
  useEffect,
} from "react";
import { twMerge } from "tailwind-merge";
import { EditLegalEntityBankInput } from "./legalEntity.js";
import { CountryForm } from "../components/countryForm.js";

const FieldLabel = ({ children }: { readonly children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700">{children}</label>
);

const TextInput = forwardRef(function TextInput(
  props: ComponentPropsWithRef<"input">,
  ref: Ref<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={twMerge(
        "h-10 w-full rounded-md border border-gray-200 bg-white px-3 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:p-0",
        props.className
      )}
      ref={ref}
      type="text"
    />
  );
});

const ACCOUNT_TYPES = ["CHECKING", "SAVINGS", "TRUST"] as const;

const AccountTypeSelect = forwardRef(function AccountTypeSelect(
  props: ComponentPropsWithRef<"select">,
  ref: Ref<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      className={twMerge(
        "h-10 w-full rounded-md border border-gray-200 bg-white px-3 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:p-0",
        props.className
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
    ref: Ref<HTMLDivElement>
  ) {
    const { value, onChange, disabled, ...divProps } = props;
    const [showIntermediary, setShowIntermediary] = useState(false);
    const [localState, setLocalState] = useState(value);

    useEffect(() => {
      setLocalState(value);
    }, [value]);

    const handleInputChange = useCallback(
      function handleInputChange(
        field: keyof EditLegalEntityBankInput,
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      ) {
        setLocalState({
          ...localState,
          [field]: event.target.value,
        });
      },
      [localState]
    );

    const handleBlur = useCallback(
      function handleBlur(
        field: keyof EditLegalEntityBankInput,
        event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
      ) {
        onChange({
          [field]: event.target.value,
        } as Partial<EditLegalEntityBankInput>);
      },
      [onChange]
    );

    const handleIntermediaryToggle = useCallback(
      function handleIntermediaryToggle(
        event: React.ChangeEvent<HTMLInputElement>
      ) {
        setShowIntermediary(event.target.checked);
      },
      []
    );

    function createInputHandler(field: keyof EditLegalEntityBankInput) {
      return function handleFieldChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      ) {
        handleInputChange(field, event);
      };
    }

    function createBlurHandler(field: keyof EditLegalEntityBankInput) {
      return function handleFieldBlur(
        event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
      ) {
        handleBlur(field, event);
      };
    }

    return (
      <div
        {...divProps}
        className={twMerge(
          "rounded-lg border border-gray-200 bg-white p-6",
          props.className
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
                onBlur={createBlurHandler("accountNum")}
                placeholder="Account Number"
                value={localState.accountNum ?? ""}
              />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Account Details</FieldLabel>
                  <AccountTypeSelect
                    disabled={disabled}
                    onChange={createInputHandler("accountType")}
                    onBlur={createBlurHandler("accountType")}
                    value={localState.accountType ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>ABA/BIC/SWIFT No.</FieldLabel>
                  <TextInput
                    disabled={disabled}
                    onChange={createInputHandler("BIC")}
                    onBlur={createBlurHandler("BIC")}
                    placeholder="ABA/BIC/SWIFT No."
                    value={
                      (localState.ABA || localState.BIC || localState.SWIFT) ??
                      ""
                    }
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
              onBlur={createBlurHandler("beneficiary")}
              placeholder="Beneficiary Name"
              value={localState.beneficiary ?? ""}
            />
          </div>

          <div className="space-y-4">
            <FieldLabel>Bank Details</FieldLabel>
            <TextInput
              disabled={disabled}
              onChange={createInputHandler("name")}
              onBlur={createBlurHandler("name")}
              placeholder="Bank Name"
              value={localState.name ?? ""}
            />
          </div>

          <div className="space-y-4">
            <FieldLabel>Bank Address</FieldLabel>
            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
              <TextInput
                disabled={disabled}
                onChange={createInputHandler("streetAddress")}
                onBlur={createBlurHandler("streetAddress")}
                placeholder="Street Address"
                value={localState.streetAddress ?? ""}
              />
              <TextInput
                disabled={disabled}
                onChange={createInputHandler("extendedAddress")}
                onBlur={createBlurHandler("extendedAddress")}
                placeholder="Extended Address"
                value={localState.extendedAddress ?? ""}
              />
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  disabled={disabled}
                  onChange={createInputHandler("city")}
                  onBlur={createBlurHandler("city")}
                  placeholder="City"
                  value={localState.city ?? ""}
                />
                <TextInput
                  disabled={disabled}
                  onChange={createInputHandler("stateProvince")}
                  onBlur={createBlurHandler("stateProvince")}
                  placeholder="State/Province"
                  value={localState.stateProvince ?? ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  disabled={disabled}
                  onChange={createInputHandler("postalCode")}
                  onBlur={createBlurHandler("postalCode")}
                  placeholder="Postal Code"
                  value={localState.postalCode ?? ""}
                />
                <CountryForm
                  country={localState.country ?? ""}
                  handleInputChange={createInputHandler("country")}
                  handleBlur={createBlurHandler("country")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Memo</FieldLabel>
            <TextInput
              disabled={disabled}
              onChange={createInputHandler("memo")}
              onBlur={createBlurHandler("memo")}
              placeholder="Memo"
              value={localState.memo ?? ""}
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
                      onBlur={createBlurHandler("accountNumIntermediary")}
                      placeholder="Intermediary Account Number"
                      value={localState.accountNumIntermediary ?? ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FieldLabel>Account Details</FieldLabel>
                        <AccountTypeSelect
                          disabled={disabled}
                          onChange={createInputHandler(
                            "accountTypeIntermediary"
                          )}
                          onBlur={createBlurHandler("accountTypeIntermediary")}
                          value={localState.accountTypeIntermediary ?? ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>ABA/BIC/SWIFT No.</FieldLabel>
                        <TextInput
                          disabled={disabled}
                          onChange={createInputHandler("BICIntermediary")}
                          onBlur={createBlurHandler("BICIntermediary")}
                          placeholder="ABA/BIC/SWIFT No."
                          value={
                            (localState.ABAIntermediary ||
                              localState.BICIntermediary ||
                              localState.SWIFTIntermediary) ??
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
                    onBlur={createBlurHandler("beneficiaryIntermediary")}
                    placeholder="Intermediary Beneficiary Name"
                    value={localState.beneficiaryIntermediary ?? ""}
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Details
                  </label>
                  <TextInput
                    disabled={disabled}
                    onChange={createInputHandler("nameIntermediary")}
                    onBlur={createBlurHandler("nameIntermediary")}
                    placeholder="Intermediary Bank Name"
                    value={localState.nameIntermediary ?? ""}
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
                      onBlur={createBlurHandler("streetAddressIntermediary")}
                      placeholder="Street Address"
                      value={localState.streetAddressIntermediary ?? ""}
                    />
                    <TextInput
                      disabled={disabled}
                      onChange={createInputHandler(
                        "extendedAddressIntermediary"
                      )}
                      onBlur={createBlurHandler("extendedAddressIntermediary")}
                      placeholder="Extended Address"
                      value={localState.extendedAddressIntermediary ?? ""}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <TextInput
                        disabled={disabled}
                        onChange={createInputHandler("cityIntermediary")}
                        onBlur={createBlurHandler("cityIntermediary")}
                        placeholder="City"
                        value={localState.cityIntermediary ?? ""}
                      />
                      <TextInput
                        disabled={disabled}
                        onChange={createInputHandler(
                          "stateProvinceIntermediary"
                        )}
                        onBlur={createBlurHandler("stateProvinceIntermediary")}
                        placeholder="State/Province"
                        value={localState.stateProvinceIntermediary ?? ""}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TextInput
                        disabled={disabled}
                        onChange={createInputHandler("postalCodeIntermediary")}
                        onBlur={createBlurHandler("postalCodeIntermediary")}
                        placeholder="Postal Code"
                        value={localState.postalCodeIntermediary ?? ""}
                      />
                      <CountryForm
                        country={localState.countryIntermediary ?? ""}
                        handleInputChange={createInputHandler("countryIntermediary")}
                        handleBlur={createBlurHandler("countryIntermediary")}
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
                    onBlur={createBlurHandler("memoIntermediary")}
                    placeholder="Memo"
                    value={localState.memoIntermediary ?? ""}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);
