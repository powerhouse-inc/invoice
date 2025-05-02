import { Form, CountryCodeField } from "@powerhousedao/design-system/scalars";
import { getCountryCodeFromName } from "../utils/utils.js";
import { twMerge } from "tailwind-merge";
interface CountryFormProps {
  country: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
}

export const CountryForm = ({
  country,
  handleInputChange,
  handleBlur,
  className,
  label,
}: CountryFormProps) => {
  // Convert country name to country code if needed
  const countryCode = getCountryCodeFromName(country);
  return (
    <Form
      defaultValues={{ country: countryCode || "" }}
      onSubmit={() => {}}
      resetOnSuccessfulSubmit
    >
      <CountryCodeField
        enableSearch
        name="country"
        placeholder="Country"
        onChange={(value: string | string[]) => {
          const syntheticEvent = {
            target: {
              value: value,
            },
          } as React.ChangeEvent<HTMLInputElement>;

          handleInputChange(syntheticEvent);
          if (handleBlur) {
            const blurEvent = {
              target: {
                value: value,
              },
            } as React.FocusEvent<HTMLInputElement>;
            handleBlur(blurEvent);
          }
        }}
        // required
        // defaultValue={countryCode}
        value={countryCode}
        className={twMerge(className)}
        label={label}
      />
    </Form>
  );
};
