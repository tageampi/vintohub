import { useQuery } from "@tanstack/react-query";
import { Product, Order, Shop } from "@shared/schema";
import SellerDashboardLayout from "@/components/sellers/SellerDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Package, 
  ArrowRight, 
  Clock 
} from "lucide-react";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function SellerDashboard() {
  // Fetch shop data
  const { data: shop, isLoading: shopLoading } = useQuery<Shop>({
    queryKey: ["/api/user/shop"],
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", shop?.id ? { shopId: shop.id } : null],
    enabled: !!shop?.id,
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/seller/orders"],
    enabled: !!shop?.id,
  });

  // Calculate stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  
  const totalRevenue = orders.reduce((total, order) => total + order.total, 0);
  
  // Get recent orders (limit to 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <SellerDashboardLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-100 rounded-full">
                <DollarSign className="h-6 w-6 text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                {ordersLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue / 100)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                {ordersLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{totalOrders}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                {ordersLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Products</p>
                {productsLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-bold">{totalProducts}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/seller/orders">
                <Button variant="ghost" className="text-sm h-8">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Your latest orders</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-1/5" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No orders yet</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={
                        order.status === 'pending' ? 'outline' :
                        order.status === 'processing' ? 'secondary' :
                        order.status === 'shipped' ? 'default' :
                        order.status === 'delivered' ? 'success' : 'destructive'
                      }>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="font-medium">{formatCurrency(order.total / 100)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Products</CardTitle>
              <Link href="/seller/products">
                <Button variant="ghost" className="text-sm h-8">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Your latest product listings</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-2/3 mb-1" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No products yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/seller/products/new">Add Product</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <li key={product.id} className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                      <img 
                        src={product.images?.[0] || "https://via.placeholder.com/40"} 
                        alt={product.title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.title}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(product.price / 100)}</p>
                    </div>
                    <Badge variant={product.inventory > 0 ? 'outline' : 'destructive'}>
                      {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </SellerDashboardLayout>
  );
}
