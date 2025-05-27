import { Form, NumberField } from "@powerhousedao/document-engineering/scalars";

interface NumberFormProps {
  number: number | string;
  precision?: number;
  min?: number;
  max?: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const NumberForm = ({
  number,
  precision,
  min,
  max,
  handleInputChange,
  placeholder,
}: NumberFormProps) => {
  return (
    <Form
      defaultValues={{ number }}
      onSubmit={() => {}}
      resetOnSuccessfulSubmit
    >
      <NumberField
        name="number"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          handleInputChange(e);
        }}
        precision={precision}
        min={min}
        max={max}
        value={Number(number)}
        placeholder={placeholder}
      />
    </Form>
  );
};
