
import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductSubmission } from '@/lib/textExtractor';

// Define custom colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];
const STATUS_COLORS = {
  'contains': '#ef4444',
  'verified-free': '#22c55e',
  'needs-verification': '#f59e0b',
  'inconclusive': '#6b7280'
};

const PRODUCT_TYPES = [
  'Laundry Sheet',
  'Laundry Pod',
  'Dishwasher Pod',
  'Dishwasher Sheet',
  'Tablet',
  'Other'
];

// Case-insensitive product type normalization
const normalizeProductType = (type: string | undefined): string => {
  if (!type) return 'Other';
  
  // Normalize to lowercase for comparison
  const typeLower = type.toLowerCase().trim();
  
  // Check if it matches any known type (case-insensitive)
  for (const knownType of PRODUCT_TYPES) {
    if (typeLower === knownType.toLowerCase() || 
        // Handle variations like "laundry sheets" vs "laundry sheet"
        (typeLower.includes('laundry') && typeLower.includes('sheet')) ||
        (typeLower === 'laundry sheets')) {
      return knownType;
    }
  }
  
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
  const [activeTab, setActiveTab] = useState("status");

  // Log product data to debug
  console.log("Charting products:", products.map(p => ({
    name: p.name,
    type: p.type,
    normalizedType: normalizeProductType(p.type),
    pvaStatus: p.pvaStatus
  })));

  // Create data for status chart - use verified-free for all non-contains status for now
  const statusData = [
    { name: 'Contains PVA', value: products.filter(p => p.pvaStatus === 'contains').length },
    { 
      name: 'Verified Free', 
      // Count approved products as verified free unless explicitly marked as containing PVA
      value: products.filter(p => p.pvaStatus === 'verified-free' || (p.approved && p.pvaStatus !== 'contains')).length 
    },
    { name: 'Needs Verification', value: products.filter(p => p.pvaStatus === 'needs-verification' && !p.approved).length },
    { name: 'Inconclusive', value: products.filter(p => p.pvaStatus === 'inconclusive' && !p.approved).length }
  ].filter(item => item.value > 0);

  // Create data for product type chart - using normalized types
  const typeData = PRODUCT_TYPES.map(type => ({
    name: type,
    value: products.filter(p => normalizeProductType(p.type) === type).length
  })).filter(item => item.value > 0);

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
  const statusByTypeData = PRODUCT_TYPES.map(type => {
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

  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index);
  };

  const handlePieClick = () => {
    console.log('Pie segment clicked');
  };

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
