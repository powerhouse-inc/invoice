import { Form, StringField } from "@powerhousedao/design-system/scalars";
import { ValidationResult } from "../validation/validationManager.js";
import { twMerge } from "tailwind-merge";

interface InputFieldProps {
  input?: string;
  value?: string;
  label?: string;
  placeholder?: string;
  onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  validation?: ValidationResult | null;
  className?: string;
}

export const InputField = (props: InputFieldProps) => {
  const {
    input,
    value,
    label,
    placeholder,
    onBlur,
    handleInputChange,
    validation,
    className,
  } = props;

  const warnings =
    validation && !validation.isValid ? [validation.message] : undefined;

  return (
    <Form
      defaultValues={{
        input: input,
      }}
      onSubmit={() => {}}
      resetOnSuccessfulSubmit={true}
    >
      <StringField
        style={{
          color: "black",
        }}
        label={label}
        placeholder={placeholder}
        name="input"
        value={value}
        onBlur={onBlur}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          handleInputChange(e);
        }}
        warnings={warnings}
        className={twMerge(className)}
      />
    </Form>
  );
};
