import { Form, CountryCodeField } from "@powerhousedao/design-system/scalars";

interface CountryFormProps {
  country: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CountryForm = ({
  country,
  handleInputChange,
}: CountryFormProps) => {
  return (
    <Form
      defaultValues={{ country: country || "" }}
      onSubmit={() => {}}
      resetOnSuccessfulSubmit
    >
      <CountryCodeField
        enableSearch
        name="country"
        placeholder="Country"
        onChange={(value: string) => {
          const syntheticEvent = {
            target: {
              value: value,
            },
          } as React.ChangeEvent<HTMLInputElement>;

          handleInputChange(syntheticEvent);
        }}
        // required
        defaultValue={country}
      />
    </Form>
  );
};
