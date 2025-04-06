import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order, Product, OrderItem } from "@shared/schema";
import SellerDashboardLayout from "@/components/sellers/SellerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FileDown, 
  Tag, 
  ShoppingBag,
  Filter,
  ChevronRight,
  Check,
  Truck,
  Package,
  X,
  Clock
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDateToLocal, getStatusColor } from "@/lib/utils";
import OrderTable from "@/components/sellers/OrderTable";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OrderWithItems } from "@/types";

export default function SellerOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState("all");

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/seller/orders"],
  });

  // Fetch products to get details for order items
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get order items for each order
  const getOrderWithItems = (order: Order): OrderWithItems => {
    // In a real app, we would fetch order items from API
    // For this demo, we'll simulate it with random products
    const orderProducts = products.slice(0, Math.floor(Math.random() * 3) + 1);
    
    const items: OrderItem[] = orderProducts.map((product, index) => ({
      id: index + 1,
      orderId: order.id,
      productId: product.id,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: product.price
    }));
    
    return {
      ...order,
      items,
      products: orderProducts
    };
  };

  // Process orders with items
  const ordersWithItems: OrderWithItems[] = orders.map(getOrderWithItems);

  // Filter orders by status and search query
  const filteredOrders = ordersWithItems.filter(order => {
    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    
    // Tab filter
    if (currentTab === "pending" && order.status !== "pending") {
      return false;
    }
    if (currentTab === "processing" && order.status !== "processing") {
      return false;
    }
    if (currentTab === "shipped" && order.status !== "shipped") {
      return false;
    }
    if (currentTab === "delivered" && order.status !== "delivered") {
      return false;
    }
    if (currentTab === "cancelled" && order.status !== "cancelled") {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const orderId = order.id.toString();
      return orderId.includes(searchQuery);
    }
    
    return true;
  });

  // Update order status function
  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/orders"] });
      toast({
        title: "Order updated",
        description: `Order #${orderId} has been marked as ${status}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating order",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  // Order count by status
  const pendingCount = orders.filter(order => order.status === "pending").length;
  const processingCount = orders.filter(order => order.status === "processing").length;
  const shippedCount = orders.filter(order => order.status === "shipped").length;
  const deliveredCount = orders.filter(order => order.status === "delivered").length;
  const cancelledCount = orders.filter(order => order.status === "cancelled").length;

  // Status action buttons
  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case "pending":
        return (
          <>
            <Button 
              size="sm" 
              className="ml-auto"
              onClick={() => updateOrderStatus(order.id, "processing")}
            >
              <Check className="mr-2 h-4 w-4" />
              Process Order
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="ml-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => updateOrderStatus(order.id, "cancelled")}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </>
        );
      case "processing":
        return (
          <Button 
            size="sm" 
            className="ml-auto"
            onClick={() => updateOrderStatus(order.id, "shipped")}
          >
            <Truck className="mr-2 h-4 w-4" />
            Mark as Shipped
          </Button>
        );
      case "shipped":
        return (
          <Button 
            size="sm" 
            className="ml-auto"
            onClick={() => updateOrderStatus(order.id, "delivered")}
          >
            <Package className="mr-2 h-4 w-4" />
            Mark as Delivered
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <SellerDashboardLayout title="Manage Orders">
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="mb-0">
            <TabsTrigger value="all" className="relative">
              All
              <Badge variant="outline" className="ml-1">
                {orders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-600">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing
              {processingCount > 0 && (
                <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-600">
                  {processingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="shipped">
              Shipped
              {shippedCount > 0 && (
                <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-600">
                  {shippedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered
              {deliveredCount > 0 && (
                <Badge variant="outline" className="ml-1 bg-green-50 text-green-600">
                  {deliveredCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
              {cancelledCount > 0 && (
                <Badge variant="outline" className="ml-1 bg-red-50 text-red-600">
                  {cancelledCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-end">
          <div className="w-full sm:w-auto flex-1 sm:max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          {ordersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                <ShoppingBag className="h-full w-full" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No orders found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "No orders match your search criteria. Try a different filter."
                  : "You haven't received any orders yet."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <CardTitle className="text-base">Order #{order.id}</CardTitle>
                        <CardDescription>
                          Placed on {formatDateToLocal(order.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {order.products?.map((product) => (
                          <div key={product.id} className="flex items-center gap-2 border rounded-md p-2">
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                              <img 
                                src={product.images?.[0] || "https://via.placeholder.com/40"} 
                                alt={product.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{product.title}</p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(product.price / 100)} x {
                                  order.items.find(item => item.productId === product.id)?.quantity || 1
                                }
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between pt-2">
                        <div>
                          <p className="text-sm font-medium">Customer Details</p>
                          <p className="text-xs text-gray-500">
                            {typeof order.shippingAddress === 'object' ? 
                              `${order.shippingAddress.fullName}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`
                              : 'Address information unavailable'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Total Amount</p>
                          <p className="text-lg font-bold text-primary-600">
                            {formatCurrency(order.total / 100)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" className="text-primary-600">
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    
                    {getStatusActions(order)}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other tabs content will be identical with filtered data */}
        <TabsContent value="pending" className="m-0">
          {ordersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                <Clock className="h-full w-full" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No pending orders</h3>
              <p className="text-gray-500">
                You don't have any orders waiting to be processed.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <CardTitle className="text-base">Order #{order.id}</CardTitle>
                        <CardDescription>
                          Placed on {formatDateToLocal(order.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {order.products?.map((product) => (
                          <div key={product.id} className="flex items-center gap-2 border rounded-md p-2">
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                              <img 
                                src={product.images?.[0] || "https://via.placeholder.com/40"} 
                                alt={product.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{product.title}</p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(product.price / 100)} x {
                                  order.items.find(item => item.productId === product.id)?.quantity || 1
                                }
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between pt-2">
                        <div>
                          <p className="text-sm font-medium">Customer Details</p>
                          <p className="text-xs text-gray-500">
                            {typeof order.shippingAddress === 'object' ? 
                              `${order.shippingAddress.fullName}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`
                              : 'Address information unavailable'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Total Amount</p>
                          <p className="text-lg font-bold text-primary-600">
                            {formatCurrency(order.total / 100)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" className="text-primary-600">
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    
                    {getStatusActions(order)}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Other tabs would follow the same pattern */}
        <TabsContent value="processing" className="m-0">
          {/* Similar content to "pending" tab but filtered for processing orders */}
          {ordersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <h3 className="mb-1 text-lg font-medium">No processing orders</h3>
              <p className="text-gray-500">
                You don't have any orders currently being processed.
              </p>
            </div>
          ) : (
            <OrderTable 
              orders={filteredOrders} 
              onUpdateStatus={updateOrderStatus} 
            />
          )}
        </TabsContent>

        <TabsContent value="shipped" className="m-0">
          {/* Similar content for shipped orders */}
          {ordersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <h3 className="mb-1 text-lg font-medium">No shipped orders</h3>
              <p className="text-gray-500">
                You don't have any orders currently in transit.
              </p>
            </div>
          ) : (
            <OrderTable 
              orders={filteredOrders} 
              onUpdateStatus={updateOrderStatus} 
            />
          )}
        </TabsContent>

        <TabsContent value="delivered" className="m-0">
          {/* Similar content for delivered orders */}
          {ordersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <h3 className="mb-1 text-lg font-medium">No delivered orders</h3>
              <p className="text-gray-500">
                You don't have any completed deliveries yet.
              </p>
            </div>
          ) : (
            <OrderTable 
              orders={filteredOrders} 
              onUpdateStatus={updateOrderStatus} 
            />
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="m-0">
          {/* Similar content for cancelled orders */}
          {ordersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <h3 className="mb-1 text-lg font-medium">No cancelled orders</h3>
              <p className="text-gray-500">
                You don't have any cancelled orders.
              </p>
            </div>
          ) : (
            <OrderTable 
              orders={filteredOrders} 
              onUpdateStatus={updateOrderStatus} 
            />
          )}
        </TabsContent>
      </Tabs>
    </SellerDashboardLayout>
  );
}
