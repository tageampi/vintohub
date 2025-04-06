import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart } from 'recharts';
import { AnalyticsData } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

interface AnalyticsChartProps {
  data: AnalyticsData[];
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary-600">
            Revenue: {formatCurrency(payload[0].value / 100)}
          </p>
          <p className="text-sm text-blue-600">
            Orders: {payload[1].value}
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-end mb-4">
        <Tabs 
          value={chartType} 
          onValueChange={(value) => setChartType(value as 'area' | 'bar')}
          className="w-auto"
        >
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'area' ? (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              yAxisId="left"
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              name="Orders" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorSales)"
              yAxisId="right"
            />
          </AreaChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              name="Revenue" 
              fill="#8b5cf6" 
              yAxisId="left" 
            />
            <Bar 
              dataKey="sales" 
              name="Orders" 
              fill="#3b82f6" 
              yAxisId="right" 
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
