
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, MapPin, Flag } from "lucide-react";

interface CountrySelectorProps {
  selectedCountry: string;
  countries: string[];
  onCountrySelect: (country: string) => void;
  onSubmit: () => void;
  allowCustomCountry?: boolean;
  customCountryInput?: React.ReactNode;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  countries,
  onCountrySelect,
  onSubmit,
  allowCustomCountry = false,
  customCountryInput
}) => {
  // Standardize country names and ensure they're all trimmed
  const normalizedCountries = countries.map(country => 
    typeof country === 'string' ? country.trim() : country
  );

  // Create a case-insensitive check for Australia
  const hasAustralia = normalizedCountries.some(
    country => country.toLowerCase() === 'australia'
  );

  // If Australia doesn't exist in the list but it's the selected country,
  // we need to add it to ensure it can be selected
  const displayCountries = hasAustralia ? 
    normalizedCountries : 
    [...normalizedCountries, 'Australia'];

  // Add well-known country names and ensure standard naming
  const standardCountryNames = {
    'usa': 'United States',
    'us': 'United States',
    'united states of america': 'United States',
    'uk': 'United Kingdom',
    'great britain': 'United Kingdom',
    'nz': 'New Zealand'
  };

  // Add common countries if they don't exist, using standard naming
  const commonCountries = ['United States', 'United Kingdom', 'Canada', 'New Zealand'];
  commonCountries.forEach(country => {
    if (!displayCountries.some(c => c.toLowerCase() === country.toLowerCase())) {
      displayCountries.push(country);
    }
  });

  // Sort alphabetically except for Global which should be first
  const sortedCountries = displayCountries.sort((a, b) => {
    if (a === 'Global') return -1;
    if (b === 'Global') return 1;
    return a.localeCompare(b);
  });

  const handleCountryChange = (value: string) => {
    // Standardize the country name if it's a well-known variant
    const standardizedCountry = standardCountryNames[value.toLowerCase()] || value;
    console.log("Selected country:", value, "Standardized to:", standardizedCountry);
    onCountrySelect(standardizedCountry);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Select Region</CardTitle>
        <CardDescription>
          Choose a country or region to view product data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="Global">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Global (All Products)
                </div>
              </SelectItem>
              {sortedCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  <div className="flex items-center">
                    <Flag className="w-4 h-4 mr-2" />
                    {country}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {allowCustomCountry && customCountryInput}
        
        <Button 
          onClick={onSubmit} 
          className="w-full"
        >
          View Products
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Viewing data for products available in {selectedCountry === "Global" ? "all regions" : selectedCountry}
        </p>
      </CardContent>
    </Card>
  );
};

export default CountrySelector;
