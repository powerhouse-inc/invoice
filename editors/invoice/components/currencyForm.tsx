import { Form, CurrencyCodeField } from "@powerhousedao/document-engineering/scalars";
import { ValidationResult } from "../validation/validationManager.js";

interface CurrencyFormProps {
  currency: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validation?: ValidationResult | null;
}

export const currencyList = [
  { ticker: "USDS", crypto: true },
  { ticker: "DAI", crypto: true },
  { ticker: "USD", crypto: false },
  { ticker: "EUR", crypto: false },
  { ticker: "DKK", crypto: false },
  { ticker: "GBP", crypto: false },
  { ticker: "JPY", crypto: false },
  { ticker: "CNY", crypto: false },
  { ticker: "CHF", crypto: false },
];

export const CurrencyForm = ({
  currency,
  handleInputChange,
  validation,
}: CurrencyFormProps) => {
  const warnings =
    validation && !validation.isValid ? [validation.message] : undefined;
  return (
    <Form
      defaultValues={{ currency }}
      onSubmit={() => {}}
      resetOnSuccessfulSubmit
    >
      <CurrencyCodeField
        style={{
          width: "100px",
        }}
        name="currency"
        placeholder="Currency"
        currencies={currencyList}
        searchable={false}
        value={currency}
        onChange={(value: string | string[]) => {
          const syntheticEvent = {
            target: {
              value: value,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          handleInputChange(syntheticEvent);
        }}
        warnings={warnings}
      />
    </Form>
  );
};
