import { DatePickerField, Form } from "@powerhousedao/design-system/scalars";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
interface DatePickerProps {
  name: string;
  input?: string;
  value: string;
  label?: string;
  placeholder?: string;
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DatePicker = (props: DatePickerProps) => {
  const [formValue, setFormValue] = useState(props.value);

  useEffect(() => {
    setFormValue(props.value);
  }, [props.value]);

  return (
    <Form
      defaultValues={{
        input: formValue,
      }}
      onSubmit={() => {}}
      resetOnSuccessfulSubmit={false}
      className={twMerge(props.className)}
    >
      <DatePickerField
        name={props.name}
        value={formValue}
        label={props.label}
        placeholder={props.placeholder}
        onChange={props.onChange}
        dateFormat={"YYYY-MM-DD"}
      />
    </Form>
  );
};
