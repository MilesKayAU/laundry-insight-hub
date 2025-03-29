
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer, LabelList } from "recharts";
import { ProductSubmission } from "@/lib/textExtractor";
import { getBrandCategories } from "@/lib/bulkUpload";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

// Colors for charts
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", 
  "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57", 
  "#83a6ed", "#8884d8", "#b5bdc2", "#9fa8da"
];

// Colors for PVA status
const unknownValueColor = "#8E9196"; // Gray color for unknown values
const knownValueColor = "#3cca85";
const podKnownValueColor = "#4799ff";

interface DataChartsProps {
  products: ProductSubmission[];
}

interface ChartDataItem {
  brand: string;
  count: number;
  color?: string;
}

interface PvaChartItem {
  name: string;
  PVA: number | null;
  brand: string;
  pvaMissing: string;
  productId: string;
  displayValue: number; // The value to actually display in the chart
  status: "unknown" | "contains" | "free";
}

const DataCharts: React.FC<DataChartsProps> = ({ products }) => {
  const [brandLimit, setBrandLimit] = useState("10");
  const [chartType, setChartType] = useState("pie");

  // Get data for brand visualization
  const brandData = getBrandCategories(products, parseInt(brandLimit));

  // Create PVA data visualization
  const pvaData: PvaChartItem[] = products.map(p => ({
    name: p.name,
    PVA: p.pvaPercentage,
    brand: p.brand,
    pvaMissing: p.pvaPercentage === null ? "Unknown - Awaiting verification" : "",
    productId: p.id,
    displayValue: p.pvaPercentage === null ? 20 : p.pvaPercentage, // Default to 20% for visual representation
    status: p.pvaPercentage === null ? "unknown" : 
            p.pvaPercentage > 0 ? "contains" : "free"
  }));

  // Sort PVA data by percentage (with nulls at the end)
  const sortedPvaData = [...pvaData].sort((a, b) => {
    if (a.PVA === null && b.PVA === null) return 0;
    if (a.PVA === null) return 1;
    if (b.PVA === null) return -1;
    return a.PVA - b.PVA;
  });

  // Limit data to prevent overcrowding (show top 15)
  const limitedPvaData = sortedPvaData.slice(0, 15);

  const renderPvaChart = () => {
    if (products.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No product data available for visualization
        </div>
      );
    }

    return (
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={limitedPvaData}
            margin={{ top: 20, right: 150, left: 30, bottom: 10 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              label={{ value: 'PVA Content (%)', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              dataKey="name"
              type="category"
              width={150}
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload as PvaChartItem;
                  return (
                    <div className="p-3 bg-background border border-border rounded shadow-md">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.brand}</p>
                      <p>
                        {data.PVA === null ? (
                          <span className="text-muted-foreground">PVA: Unknown - Waiting on verification</span>
                        ) : (
                          <span>PVA: {data.PVA}%</span>
                        )}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar 
              dataKey="displayValue" 
              name="PVA Content (%)" 
              barSize={20}
              fill={knownValueColor}
            >
              {limitedPvaData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.PVA === null ? unknownValueColor : 
                        (entry.name.includes("Pod") ? podKnownValueColor : knownValueColor)}
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
                formatter={(value: number | null) => value === null ? "" : `${value}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="text-xs text-gray-500 italic mt-2 text-center">
          Gray bars = Unknown PVA content (shown at estimated 20% for reference), awaiting verification from suppliers
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Distribution</CardTitle>
        <CardDescription>
          Visual breakdown of products by brand and PVA content
        </CardDescription>
        <div className="flex items-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor="chart-type">Chart Type:</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger id="chart-type" className="w-32">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Brand Distribution</SelectItem>
                <SelectItem value="bar">PVA Content</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {chartType === "pie" && (
            <div className="flex items-center gap-2">
              <Label htmlFor="brand-limit">Top Brands:</Label>
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
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartType === "pie" ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandData}
                  dataKey="count"
                  nameKey="brand"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label={({brand, count, percent}) => 
                    `${brand}: ${count} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {brandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          renderPvaChart()
        )}
      </CardContent>
    </Card>
  );
};

export default DataCharts;
