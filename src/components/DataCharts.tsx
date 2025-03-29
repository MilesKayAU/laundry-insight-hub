
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, LabelList } from "recharts";
import { ProductSubmission } from "@/lib/textExtractor";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

// Colors for PVA status
const unknownValueColor = "#8E9196"; // Gray color for unknown values
const knownValueColor = "#3cca85";
const podKnownValueColor = "#4799ff";

interface DataChartsProps {
  products: ProductSubmission[];
}

interface PvaChartItem {
  brand: string;
  PVA: number | null;
  productCount: number;
  pvaMissing: string;
  displayValue: number; // The value to actually display in the chart
  status: "unknown" | "contains" | "free";
}

const DataCharts: React.FC<DataChartsProps> = ({ products }) => {
  const [brandLimit, setBrandLimit] = useState("15");
  const navigate = useNavigate();

  // Create brand-based PVA data
  const createBrandPvaData = () => {
    const brandMap = new Map<string, { 
      count: number, 
      pvaTotal: number, 
      pvaCount: number, 
      hasVerifiedFree: boolean 
    }>();
    
    // Group products by brand and calculate PVA
    products.forEach(product => {
      const brand = product.brand;
      if (!brandMap.has(brand)) {
        brandMap.set(brand, { 
          count: 0, 
          pvaTotal: 0, 
          pvaCount: 0, 
          hasVerifiedFree: false 
        });
      }
      
      const brandData = brandMap.get(brand)!;
      brandData.count += 1;
      
      if (product.pvaStatus === 'verified-free') {
        brandData.hasVerifiedFree = true;
        brandData.pvaTotal += 0;
        brandData.pvaCount += 1;
      } else if (product.pvaPercentage !== null && product.pvaPercentage !== undefined) {
        // Make sure we're storing valid numbers
        const pvaValue = parseFloat(String(product.pvaPercentage));
        if (!isNaN(pvaValue) && isFinite(pvaValue)) {
          brandData.pvaTotal += pvaValue;
          brandData.pvaCount += 1;
        }
      }
    });
    
    // Convert map to array and calculate average PVA
    let brandPvaData: PvaChartItem[] = Array.from(brandMap.entries()).map(([brand, data]) => {
      const avgPva = data.pvaCount > 0 ? data.pvaTotal / data.pvaCount : null;
      return {
        brand,
        PVA: avgPva,
        productCount: data.count,
        pvaMissing: avgPva === null ? "Unknown - Awaiting verification" : "",
        displayValue: avgPva === null ? 20 : avgPva, // Default to 20% for visual representation
        status: data.hasVerifiedFree ? "free" : 
                avgPva === null ? "unknown" : 
                avgPva > 0 ? "contains" : "free"
      };
    });
    
    // Sort by PVA value (with nulls at the end)
    brandPvaData.sort((a, b) => {
      if (a.PVA === null && b.PVA === null) return 0;
      if (a.PVA === null) return 1;
      if (b.PVA === null) return -1;
      return a.PVA - b.PVA;
    });
    
    // Limit to the specified number of brands
    return brandPvaData.slice(0, parseInt(brandLimit));
  };
  
  const brandPvaData = createBrandPvaData();

  const handleBrandClick = (brand: string) => {
    navigate(`/brand/${brand}`);
  };

  const renderPvaChart = () => {
    if (products.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No product data available for visualization
        </div>
      );
    }

    return (
      <div className="h-[500px] w-full">
        <BarChart
          width={1000}
          height={500}
          data={brandPvaData}
          margin={{ top: 20, right: 180, left: 30, bottom: 20 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            label={{ value: 'PVA Content (%)', position: 'insideBottom', offset: -5 }}
            domain={[0, 'dataMax']}
            tickCount={6}
          />
          <YAxis 
            dataKey="brand"
            type="category"
            width={180}
            tick={{ 
              fontSize: 11,
              cursor: 'pointer',
              fill: '#2563eb',
              textDecoration: 'underline'
            }}
            tickFormatter={(value) => value}
            onClick={(data) => {
              if (data && data.value) {
                handleBrandClick(data.value);
              }
            }}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload as PvaChartItem;
                return (
                  <div className="p-3 bg-background border border-border rounded shadow-md">
                    <p className="font-medium">{data.brand}</p>
                    <p>Product Count: {data.productCount}</p>
                    <p>
                      {data.PVA === null ? (
                        <span className="text-muted-foreground">PVA: Unknown - Waiting on verification</span>
                      ) : (
                        <span>Avg. PVA: {parseFloat(String(data.PVA)).toFixed(1)}%</span>
                      )}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">Click to view brand profile</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />
          <Bar 
            dataKey="displayValue" 
            name="PVA Content (%)" 
            barSize={20}
            fill={knownValueColor}
            cursor="pointer"
            onClick={(data) => handleBrandClick(data.brand)}
          >
            {brandPvaData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.PVA === null ? unknownValueColor : 
                      (entry.brand.toLowerCase().includes("pod") ? podKnownValueColor : knownValueColor)}
              />
            ))}
            <LabelList 
              dataKey="pvaMissing"
              position="right"
              formatter={(value: string) => value}
              fill="#666"
            />
            <LabelList 
              dataKey="PVA"
              position="right"
              formatter={(value: number | null) => value === null ? "" : `${value.toFixed(1)}%`}
            />
          </Bar>
        </BarChart>
        <div className="text-xs text-gray-500 italic mt-2 text-center">
          Gray bars = Unknown PVA content (shown at estimated 20% for reference), awaiting verification from suppliers.
          <span className="ml-1 text-blue-500">Click on any brand name to see detailed profile.</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-32"> {/* Increased bottom margin to prevent footer overlap */}
      <CardHeader>
        <CardTitle>PVA Content by Brand</CardTitle>
        <CardDescription>
          Average PVA content in products grouped by brand. Click on any brand name to view its profile.
        </CardDescription>
        <div className="flex items-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor="brand-limit">Brands shown:</Label>
            <Select value={brandLimit} onValueChange={setBrandLimit}>
              <SelectTrigger id="brand-limit" className="w-20">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderPvaChart()}
      </CardContent>
    </Card>
  );
};

export default DataCharts;
