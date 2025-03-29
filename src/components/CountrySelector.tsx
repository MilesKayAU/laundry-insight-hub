
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, MapPin } from "lucide-react";

interface CountrySelectorProps {
  selectedCountry: string;
  countries: string[];
  onCountrySelect: (country: string) => void;
  onSubmit: () => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  countries,
  onCountrySelect,
  onSubmit
}) => {
  // Ensure all countries are properly lowercase for consistent comparison
  const normalizedCountries = countries.map(country => 
    typeof country === 'string' ? country.trim() : country
  );

  // Check if Australia exists in the normalized countries array
  const hasAustralia = normalizedCountries.some(
    country => country.toLowerCase() === 'australia'
  );

  // If Australia doesn't exist in the list but it's the selected country,
  // we need to add it to ensure it can be selected
  const displayCountries = hasAustralia ? 
    normalizedCountries : 
    [...normalizedCountries, 'Australia'];

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
          <Select value={selectedCountry} onValueChange={onCountrySelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Global">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Global (All Products)
                </div>
              </SelectItem>
              {displayCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {country}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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
