import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order, Product } from "@shared/schema";
import SellerDashboardLayout from "@/components/sellers/SellerDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Star 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AnalyticsChart from "@/components/sellers/AnalyticsChart";
import { AnalyticsData, PeriodOption, TopProduct } from "@/types";

export default function SellerAnalytics() {
  const [period, setPeriod] = useState<PeriodOption>("month");

  // Fetch shop data
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/seller/orders"],
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Calculate basic analytics
  const totalRevenue = orders.reduce((total, order) => total + order.total, 0);
  const totalOrders = orders.length;
  
  // Generate analytics data based on period
  const generateAnalyticsData = (): AnalyticsData[] => {
    let data: AnalyticsData[] = [];
    
    // In a real app, this would come from an API that provides aggregated data
    // For this demo, we'll generate sample data
    if (period === 'day') {
      // Last 24 hours, hourly data
      for (let i = 0; i < 24; i++) {
        data.push({
          period: `${i}:00`,
          sales: Math.floor(Math.random() * 5),
          revenue: Math.floor(Math.random() * 5000) + 500
        });
      }
    } else if (period === 'week') {
      // Last 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 0; i < 7; i++) {
        data.push({
          period: days[i],
          sales: Math.floor(Math.random() * 10) + 1,
          revenue: Math.floor(Math.random() * 10000) + 1000
        });
      }
    } else if (period === 'month') {
      // Last 30 days, weekly data
      for (let i = 1; i <= 4; i++) {
        data.push({
          period: `Week ${i}`,
          sales: Math.floor(Math.random() * 40) + 5,
          revenue: Math.floor(Math.random() * 50000) + 5000
        });
      }
    } else {
      // Last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        data.push({
          period: months[i],
          sales: Math.floor(Math.random() * 100) + 10,
          revenue: Math.floor(Math.random() * 100000) + 10000
        });
      }
    }
    
    return data;
  };

  // Get top products
  const getTopProducts = (): TopProduct[] => {
    // In a real app, this would come from an API that provides aggregated data
    // For this demo, we'll use the actual products with random sales data
    return products.slice(0, 5).map(product => ({
      id: product.id,
      title: product.title,
      sales: Math.floor(Math.random() * 50) + 5,
      revenue: Math.floor(Math.random() * 100000) + 1000
    }));
  };

  const analyticsData = generateAnalyticsData();
  const topProducts = getTopProducts();

  // Calculate percentage changes (these would normally come from API)
  const getRandomPercentage = (): number => {
    return Math.floor(Math.random() * 30) - 10; // Range from -10% to +20%
  };
  
  const revenueChange = getRandomPercentage();
  const ordersChange = getRandomPercentage();
  const viewsChange = getRandomPercentage();
  const conversionChange = getRandomPercentage();

  return (
    <SellerDashboardLayout title="Analytics & Insights">
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-12 w-40" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalRevenue / 100)}
                  </div>
                  <div className="flex items-center mt-1 text-sm">
                    {revenueChange > 0 ? (
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        {revenueChange}%
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        {Math.abs(revenueChange)}%
                      </div>
                    )}
                    <span className="text-gray-500 ml-1">vs last {period}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-12 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalOrders}
                  </div>
                  <div className="flex items-center mt-1 text-sm">
                    {ordersChange > 0 ? (
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        {ordersChange}%
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        {Math.abs(ordersChange)}%
                      </div>
                    )}
                    <span className="text-gray-500 ml-1">vs last {period}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Views Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Product Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-12 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {Math.floor(Math.random() * 1000) + 100}
                  </div>
                  <div className="flex items-center mt-1 text-sm">
                    {viewsChange > 0 ? (
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        {viewsChange}%
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        {Math.abs(viewsChange)}%
                      </div>
                    )}
                    <span className="text-gray-500 ml-1">vs last {period}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Conversion Rate Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading || productsLoading ? (
                <Skeleton className="h-12 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {(Math.random() * 5 + 1).toFixed(2)}%
                  </div>
                  <div className="flex items-center mt-1 text-sm">
                    {conversionChange > 0 ? (
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        {conversionChange}%
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        {Math.abs(conversionChange)}%
                      </div>
                    )}
                    <span className="text-gray-500 ml-1">vs last {period}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Period selector for chart */}
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sales Overview</h3>
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${period === 'day' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                  onClick={() => setPeriod('day')}
                >
                  Day
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${period === 'week' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                  onClick={() => setPeriod('week')}
                >
                  Week
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${period === 'month' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                  onClick={() => setPeriod('month')}
                >
                  Month
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-md ${period === 'year' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                  onClick={() => setPeriod('year')}
                >
                  Year
                </button>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue & Orders</CardTitle>
              <CardDescription>
                View your sales performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <div className="h-80">
                  <AnalyticsChart data={analyticsData} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>
                Your best performing products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-start space-x-3">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-200 text-gray-700' :
                        index === 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.title}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <ShoppingBag className="mr-1 h-3 w-3" />
                          <span>{product.sales} sold</span>
                          <span className="mx-1">•</span>
                          <span>{formatCurrency(product.revenue / 100)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <TabsContent value="sales" className="mt-6 space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of your sales metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Average Order Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency((totalRevenue / Math.max(totalOrders, 1)) / 100)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Items Sold</p>
                  <p className="text-2xl font-bold">
                    {orders.reduce((total, order) => total + Math.floor(Math.random() * 3) + 1, 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Refund Rate</p>
                  <p className="text-2xl font-bold">
                    {(Math.random() * 2).toFixed(2)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Repeat Purchase Rate</p>
                  <p className="text-2xl font-bold">
                    {(Math.random() * 30 + 10).toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6 space-y-6">
          {/* Product Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>
                Analysis of your product metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Average Rating</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold mr-1">{(Math.random() * 1 + 4).toFixed(1)}</p>
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.inventory === 0).length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Low Inventory</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.inventory > 0 && p.inventory < 5).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="mt-6 space-y-6">
          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>
                Understand your customer behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold">{Math.floor(totalOrders * 0.8)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">New Customers</p>
                  <p className="text-2xl font-bold">{Math.floor(totalOrders * 0.3)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Returning Customers</p>
                  <p className="text-2xl font-bold">{Math.floor(totalOrders * 0.5)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Avg. Customer Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency((totalRevenue / Math.max(Math.floor(totalOrders * 0.8), 1)) / 100)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SellerDashboardLayout>
  );
}
