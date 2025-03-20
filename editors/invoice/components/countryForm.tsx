import { Form, CountryCodeField } from "@powerhousedao/design-system/scalars";
import { getCountryCodeFromName } from "../utils/utils";

interface CountryFormProps {
  country: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CountryForm = ({
  country,
  handleInputChange,
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
        }}
        // required
        // defaultValue={countryCode}
        value={countryCode}
      />
    </Form>
  );
};
