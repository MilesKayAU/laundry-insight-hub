
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductSubmission } from '@/lib/textExtractor';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define custom colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f97316', '#8b5cf6'];
const STATUS_COLORS = {
  'contains': '#ef4444',
  'verified-free': '#22c55e',
  'needs-verification': '#f59e0b',
  'inconclusive': '#6b7280'
};

// Expanded product types with different variations to improve matching
const PRODUCT_TYPES = [
  'Laundry Sheet',
  'Laundry Pod',
  'Dishwasher Pod',
  'Dishwasher Sheet',
  'Detergent',
  'Tablet',
  'Liquid',
  'Powder',
  'Other'
];

// Mapping of common variant names to our standardized categories
const PRODUCT_TYPE_MAPPINGS = {
  'laundry detergent sheets': 'Laundry Sheet',
  'laundry detergent sheet': 'Laundry Sheet',
  'detergent sheet': 'Laundry Sheet',
  'detergent sheets': 'Laundry Sheet',
  'laundry sheets': 'Laundry Sheet',
  'laundry sheet': 'Laundry Sheet',
  'laundry pods': 'Laundry Pod',
  'laundry pod': 'Laundry Pod',
  'detergent pod': 'Laundry Pod',
  'detergent pods': 'Laundry Pod',
  'laundry capsule': 'Laundry Pod',
  'laundry capsules': 'Laundry Pod',
  'dishwasher sheets': 'Dishwasher Sheet',
  'dishwasher sheet': 'Dishwasher Sheet',
  'dishwasher pods': 'Dishwasher Pod',
  'dishwasher pod': 'Dishwasher Pod',
  'dish soap': 'Liquid',
  'liquid detergent': 'Liquid',
  'powder detergent': 'Powder',
  'laundry detergent powder': 'Powder',
  'laundry tablet': 'Tablet',
  'laundry tablets': 'Tablet',
  'cleaning tablet': 'Tablet',
  'cleaning tablets': 'Tablet'
};

// Improved product type normalization for better categorization
const normalizeProductType = (type: string | undefined): string => {
  if (!type) return 'Other';
  
  // Convert to lowercase for comparison
  const typeLower = type.toLowerCase().trim();
  
  // First check direct mappings
  if (PRODUCT_TYPE_MAPPINGS[typeLower as keyof typeof PRODUCT_TYPE_MAPPINGS]) {
    console.log(`Direct mapping found for "${type}" -> "${PRODUCT_TYPE_MAPPINGS[typeLower as keyof typeof PRODUCT_TYPE_MAPPINGS]}"`);
    return PRODUCT_TYPE_MAPPINGS[typeLower as keyof typeof PRODUCT_TYPE_MAPPINGS];
  }
  
  // Next, check if it contains specific keywords
  if (typeLower.includes('laundry') && (typeLower.includes('sheet') || typeLower.includes('sheets'))) {
    console.log(`Keyword match for "${type}" -> "Laundry Sheet"`);
    return 'Laundry Sheet';
  } else if (typeLower.includes('laundry') && (typeLower.includes('pod') || typeLower.includes('pods') || typeLower.includes('capsule'))) {
    console.log(`Keyword match for "${type}" -> "Laundry Pod"`);
    return 'Laundry Pod';
  } else if (typeLower.includes('dishwasher') && (typeLower.includes('sheet') || typeLower.includes('sheets'))) {
    return 'Dishwasher Sheet';
  } else if (typeLower.includes('dishwasher') && (typeLower.includes('pod') || typeLower.includes('pods') || typeLower.includes('capsule'))) {
    return 'Dishwasher Pod';
  } else if (typeLower.includes('tablet') || typeLower.includes('tablets')) {
    return 'Tablet';
  } else if (typeLower.includes('liquid') || typeLower.includes('solution') || typeLower.includes('dish soap')) {
    return 'Liquid';
  } else if (typeLower.includes('powder')) {
    return 'Powder';
  } else if (typeLower.includes('detergent') && !typeLower.includes('sheet') && !typeLower.includes('pod')) {
    return 'Detergent';
  }
  
  // Check if it exactly matches any of our predefined types
  for (const knownType of PRODUCT_TYPES) {
    if (typeLower === knownType.toLowerCase()) {
      return knownType;
    }
  }
  
  // Return "Other" for any unrecognized types
  console.log(`No match found for "${type}" - categorizing as "Other"`);
  return 'Other';
};

interface DataChartsProps {
  products: ProductSubmission[];
}

// Helper function for pie chart active shape
const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value } = props;
  const sin = Math.sin(-midAngle * Math.PI / 180);
  const cos = Math.cos(-midAngle * Math.PI / 180);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-xs">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">{`${value} item${value !== 1 ? 's' : ''}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const DataCharts: React.FC<DataChartsProps> = ({ products }) => {
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("type"); // Set default to "type" for product types view

  useEffect(() => {
    // Log raw product types for debugging
    console.log("Raw product types:", products.map(p => p.type));
    
    // Log normalized product types to verify categorization
    const normalizedTypes = products.map(p => ({
      original: p.type,
      normalized: normalizeProductType(p.type)
    }));
    console.log("Normalized product types:", normalizedTypes);
    
    // Log type count distribution
    const typeCounts: {[key: string]: number} = {};
    normalizedTypes.forEach(item => {
      const type = item.normalized;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    console.log("Product type distribution:", typeCounts);
  }, [products]);

  // Create data for status chart - use verified-free for all non-contains status for now
  const statusData = [
    { name: 'Contains PVA', value: products.filter(p => p.pvaStatus === 'contains').length },
    { 
      name: 'Verified Free', 
      value: products.filter(p => p.pvaStatus === 'verified-free' || (p.approved && p.pvaStatus !== 'contains')).length 
    },
    { name: 'Needs Verification', value: products.filter(p => p.pvaStatus === 'needs-verification' && !p.approved).length },
    { name: 'Inconclusive', value: products.filter(p => p.pvaStatus === 'inconclusive' && !p.approved).length }
  ].filter(item => item.value > 0);

  // Create improved data for product type chart with normalized types
  const productTypesMap = new Map<string, number>();
  
  // First count the occurrences of each normalized product type
  products.forEach(product => {
    const normalizedType = normalizeProductType(product.type);
    productTypesMap.set(normalizedType, (productTypesMap.get(normalizedType) || 0) + 1);
  });
  
  // Convert to the format needed for charts
  const typeData = Array.from(productTypesMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Create data for brand distribution
  const brandCounts: { [key: string]: number } = {};
  products.forEach(product => {
    const brand = product.brand || 'Unknown';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  // Sort brands by count and prepare data
  const sortedBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1]);
  
  const brandData = sortedBrands.map(([name, value]) => ({ name, value }));

  // Create data for status by type with normalized types
  const statusByTypeData = PRODUCT_TYPES
    .filter(type => {
      // Only include types that actually have products
      const typeProducts = products.filter(p => normalizeProductType(p.type) === type);
      return typeProducts.length > 0;
    })
    .map(type => {
      const typeProducts = products.filter(p => normalizeProductType(p.type) === type);
      
      return {
        name: type,
        'Contains PVA': typeProducts.filter(p => p.pvaStatus === 'contains').length,
        'Verified Free': typeProducts.filter(p => p.pvaStatus === 'verified-free' || (p.approved && p.pvaStatus !== 'contains')).length,
        'Needs Verification': typeProducts.filter(p => p.pvaStatus === 'needs-verification' && !p.approved).length,
        'Inconclusive': typeProducts.filter(p => p.pvaStatus === 'inconclusive' && !p.approved).length
      };
    }).filter(item => 
      item['Contains PVA'] > 0 || 
      item['Verified Free'] > 0 || 
      item['Needs Verification'] > 0 || 
      item['Inconclusive'] > 0
    );

  // Create data for product types bar chart - simplified view
  const productTypesBars = typeData.map(item => ({
    name: item.name,
    value: item.value
  }));

  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index);
  };

  const handlePieClick = () => {
    console.log('Pie segment clicked');
  };

  // Display message if no products available
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Data Overview</CardTitle>
          <CardDescription>No products available to display</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No product data available for analysis
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Data Overview</CardTitle>
        <CardDescription>
          Visual breakdown of products in the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">PVA Status</TabsTrigger>
            <TabsTrigger value="type">Product Types</TabsTrigger>
            <TabsTrigger value="brand">Brands</TabsTrigger>
            <TabsTrigger value="combined">Status by Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="py-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onClick={handlePieClick}
                  >
                    {statusData.map((entry, index) => {
                      const status = entry.name.toLowerCase().replace(' ', '-').replace('verified free', 'verified-free').replace('needs verification', 'needs-verification');
                      const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length];
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="type" className="py-4">
            <div className="h-[300px] w-full">
              {/* Display both Pie Chart and Bar Chart for product types */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        activeIndex={activePieIndex}
                        activeShape={renderActiveShape}
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        onClick={handlePieClick}
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={productTypesBars}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fontSize: 12 }} 
                        width={80} 
                      />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Products" 
                        fill="#0088FE" 
                        radius={[0, 4, 4, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="brand" className="py-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={brandData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    onClick={handlePieClick}
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
          </TabsContent>
          
          <TabsContent value="combined" className="py-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusByTypeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Contains PVA" stackId="a" fill={STATUS_COLORS['contains']} />
                  <Bar dataKey="Verified Free" stackId="a" fill={STATUS_COLORS['verified-free']} />
                  <Bar dataKey="Needs Verification" stackId="a" fill={STATUS_COLORS['needs-verification']} />
                  <Bar dataKey="Inconclusive" stackId="a" fill={STATUS_COLORS['inconclusive']} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataCharts;
