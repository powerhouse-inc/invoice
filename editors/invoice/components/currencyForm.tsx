import { Form, CurrencyCodeField } from "@powerhousedao/design-system/scalars";
import { ValidationResult } from "../validation/validationManager.js";

interface CurrencyFormProps {
  currency: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validation?: ValidationResult | null;
}

const currencyList = [
  { ticker: "USD", crypto: false },
  { ticker: "USDS", crypto: true },
  { ticker: "EUR", crypto: false },
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
