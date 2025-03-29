
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import { ProductSubmission } from "@/lib/textExtractor";
import { getBrandCategories } from "@/lib/bulkUpload";

// Colors for charts
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", 
  "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57", 
  "#83a6ed", "#8884d8", "#b5bdc2", "#9fa8da"
];

interface DataChartsProps {
  products: ProductSubmission[];
}

const DataCharts: React.FC<DataChartsProps> = ({ products }) => {
  const [brandLimit, setBrandLimit] = useState("10");
  const [chartType, setChartType] = useState("pie");

  // Get data for visualization
  const brandData = getBrandCategories(products, parseInt(brandLimit));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Distribution</CardTitle>
        <CardDescription>
          Visual breakdown of products by brand
        </CardDescription>
        <div className="flex items-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor="chart-type">Chart Type:</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger id="chart-type" className="w-32">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
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
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No product data available for visualization
          </div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "pie" ? (
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
              ) : (
                <BarChart
                  data={brandData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 120,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="brand"
                    height={100}
                    tickFormatter={(value) => value}
                  >
                    <text 
                      x={0} 
                      y={0} 
                      dy={16} 
                      textAnchor="end" 
                      transform="rotate(-45)"
                    />
                  </XAxis>
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Products">
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataCharts;
