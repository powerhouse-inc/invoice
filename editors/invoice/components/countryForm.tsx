import { Form, CountryCodeField } from "@powerhousedao/design-system/scalars";
import countries from "world-countries";

interface CountryFormProps {
  country: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Function to convert country name to country code
const getCountryCodeFromName = (countryName: string | undefined | null): string => {
  if (!countryName) return "";
  
  // Special case handling for common abbreviations and alternative names
  const specialCases: Record<string, string> = {
    'uk': 'GB',
    'united kingdom': 'GB',
    'england': 'GB',
    'britain': 'GB',
    'deutschland': 'DE',
    'germany': 'DE',
    'usa': 'US',
    'united states of america': 'US',
    'america': 'US'
  };
  
  const lowerCountryName = countryName.toLowerCase().trim();
  
  // Check special cases first
  if (specialCases[lowerCountryName]) {
    return specialCases[lowerCountryName];
  }
  
  // Check if input is already a valid country code (2-letter code)
  if (countryName.length === 2 && /^[A-Z]{2}$/.test(countryName)) {
    const isValidCode = countries.some(c => c.cca2 === countryName);
    if (isValidCode) return countryName;
  }
  
  // Try exact match first (case-insensitive)
  const exactMatch = countries.find(
    c => c.name.common.toLowerCase() === lowerCountryName
  );
  if (exactMatch) return exactMatch.cca2;
  
  // Try official name match
  const officialMatch = countries.find(
    c => c.name.official.toLowerCase() === lowerCountryName
  );
  if (officialMatch) return officialMatch.cca2;
  
  // Try native name matches
  const nativeMatch = countries.find(c => {
    if (!c.name.native) return false;
    return Object.values(c.name.native).some(
      n => n.common.toLowerCase() === lowerCountryName || 
           n.official.toLowerCase() === lowerCountryName
    );
  });
  if (nativeMatch) return nativeMatch.cca2;
  
  // Try partial match if no exact match found
  const partialMatch = countries.find(
    c => c.name.common.toLowerCase().includes(lowerCountryName) ||
         lowerCountryName.includes(c.name.common.toLowerCase())
  );
  if (partialMatch) return partialMatch.cca2;
  
  // If no match found, return original value
  return countryName;
};

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
        onChange={(value: string) => {
          const syntheticEvent = {
            target: {
              value: value,
            },
          } as React.ChangeEvent<HTMLInputElement>;

          handleInputChange(syntheticEvent);
        }}
        // required
        defaultValue={countryCode}
      />
    </Form>
  );
};
