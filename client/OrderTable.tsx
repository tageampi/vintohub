import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Truck, Package, X, ChevronRight, Eye } from "lucide-react";
import { formatCurrency, formatDateToLocal, getStatusColor } from "@/lib/utils";
import { OrderWithItems } from "@/types";
import { Link } from "wouter";

interface OrderTableProps {
  orders: OrderWithItems[];
  onUpdateStatus: (orderId: number, status: string) => void;
}

export default function OrderTable({ orders, onUpdateStatus }: OrderTableProps) {
  // Get status actions for an order
  const getStatusActions = (order: OrderWithItems) => {
    switch (order.status) {
      case "pending":
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onUpdateStatus(order.id, "processing")}
            >
              <Check className="mr-2 h-4 w-4" />
              Process
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onUpdateStatus(order.id, "cancelled")}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        );
      case "processing":
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onUpdateStatus(order.id, "shipped")}
          >
            <Truck className="mr-2 h-4 w-4" />
            Mark Shipped
          </Button>
        );
      case "shipped":
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onUpdateStatus(order.id, "delivered")}
          >
            <Package className="mr-2 h-4 w-4" />
            Mark Delivered
          </Button>
        );
      default:
        return (
          <Button 
            size="sm" 
            variant="ghost"
            className="text-primary-600"
            asChild
          >
            <Link href={`/seller/orders/${order.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>{formatDateToLocal(order.createdAt)}</TableCell>
              <TableCell>
                {typeof order.shippingAddress === 'object' ? 
                  order.shippingAddress.fullName : 
                  `Customer #${order.userId}`
                }
              </TableCell>
              <TableCell>{formatCurrency(order.total / 100)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {getStatusActions(order)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
