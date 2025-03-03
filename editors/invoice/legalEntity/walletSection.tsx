import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import { EditLegalEntityWalletInput } from "./legalEntity";
import { TextInput, FieldLabel } from "./common";

export type LegalEntityWalletSectionProps = Omit<
  ComponentProps<"div">,
  "children" | "onChange"
> & {
  readonly value: EditLegalEntityWalletInput;
  readonly onChange: (value: EditLegalEntityWalletInput) => void;
  readonly disabled?: boolean;
};

export const LegalEntityWalletSection = (
  props: LegalEntityWalletSectionProps,
) => {
  const { value, onChange, disabled, ...divProps } = props;

  const handleInputChange = (
    field: keyof EditLegalEntityWalletInput,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onChange({
      ...value,
      [field]: event.target.value,
    });
  };

  const CHAIN_PRESETS = [
    {
      chainName: "Base",
      chainId: "8453",
    },
    {
      chainName: "Ethereum",
      chainId: "1",
    },
    {
      chainName: "Arbitrum One",
      chainId: "42161",
    },
    {
      chainName: "Gnosis",
      chainId: "100",
    },
  ];

  const renderPresets = () => {
    const activePreset = CHAIN_PRESETS.find(
      (p) => p.chainName == value.chainName,
    );

    const handleSelectPreset = (e: { target: { value: string } }) => {
      const preset = CHAIN_PRESETS.find(
        (p) => p.chainName == e.target.value && p.chainId !== "0",
      );
      if (preset) {
        onChange({
          chainId: preset.chainId,
          chainName: preset.chainName,
        });
      }
    };

    return (
      <div className={"px-4 py-2"}>
        <select
          className={
            "px-4 py-2 rounded-full font-semibold text-sm bg-gray-200 text-gray-800"
          }
          onBlur={handleSelectPreset}
          onChange={handleSelectPreset}
        >
          {activePreset ? (
            <option key={activePreset.chainId} value={activePreset.chainName}>
              {activePreset.chainName}
            </option>
          ) : (
            <option key={0} value={0}>
              Select Chain
            </option>
          )}
          {CHAIN_PRESETS.filter((p) => p.chainId !== activePreset?.chainId).map(
            (preset) => (
              <option key={preset.chainId} value={preset.chainName}>
                {preset.chainName}
              </option>
            ),
          )}
        </select>
        {value.chainName !== "Base" && (
          <div className="space-y-4" style={{ color: "red" }}>
            Unsupported Chain
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      {...divProps}
      className={twMerge(
        "rounded-lg border border-gray-200 bg-white p-6",
        props.className,
      )}
    >
      <div className="grid grid-cols-2 gap-4 items-center">
        <h3 className="mb-4 text-lg font-semibold text-gray-200">
          Wallet Information
        </h3>

        {renderPresets()}
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <FieldLabel>Wallet Address</FieldLabel>
          <TextInput
            disabled={disabled}
            onChange={(e) => handleInputChange("address", e)}
            placeholder="0x..."
            value={value.address ?? ""}
          />
        </div>
      </div>
    </div>
  );
};
