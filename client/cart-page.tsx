import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import MainLayout from "@/components/layout/MainLayout";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Trash2, ShoppingBag, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Helmet } from "react-helmet-async";

// Shipping address schema
const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone is required"),
});

type ShippingAddressValues = z.infer<typeof shippingAddressSchema>;

export default function CartPage() {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Shipping form
  const form = useForm<ShippingAddressValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      phone: "",
    }
  });

  // Fetch products to get details of items in cart
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: cartItems.length > 0,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (shippingAddress: ShippingAddressValues) => {
      const response = await apiRequest("POST", "/api/orders", { shippingAddress });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order placed successfully!",
        description: "You can track your order in your account.",
      });
      setCheckoutOpen(false);
      setLocation("/orders"); // Redirect to orders page
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to place order",
        description: error.message,
      });
    }
  });

  // Get matching products for cart items
  const cartProducts = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { cartItem: item, product };
  }).filter(item => item.product !== undefined);

  // Handle quantity changes
  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.productId);
    } else {
      updateCartItemQuantity(item.productId, newQuantity);
    }
  };

  // Calculate subtotal
  const subtotal = getCartTotal(products);

  // Handle checkout
  const onCheckout = (data: ShippingAddressValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to complete your purchase."
      });
      setLocation("/auth?redirect=cart");
      return;
    }

    createOrderMutation.mutate(data);
  };

  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;

  return (
    <MainLayout>
      <Helmet>
        <title>Shopping Cart | VintoHub</title>
        <meta name="description" content="Review and checkout items in your VintoHub shopping cart." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Your Shopping Cart</h1>
        
        {productsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-md">
                <Skeleton className="h-24 w-24 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-32 mt-2" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          </div>
        ) : isCartEmpty ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <ShoppingBag className="h-full w-full" />
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartProducts.map(({ cartItem, product }) => (
                  <div key={cartItem.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-md bg-white">
                    <div className="h-24 w-24 flex-shrink-0">
                      <img 
                        src={product?.images?.[0] || "https://via.placeholder.com/150"} 
                        alt={product?.title || "Product"} 
                        className="h-full w-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        <Link href={`/products/${product?.id}`}>
                          <a className="hover:text-primary-600 transition">
                            {product?.title}
                          </a>
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {formatCategoryName(product?.category)}
                      </p>
                      
                      {product && product.inventory < cartItem.quantity && (
                        <div className="flex items-center text-amber-500 text-sm mb-2">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          <span>Only {product.inventory} available</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-4 items-center mt-2">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button 
                            onClick={() => handleQuantityChange(cartItem, cartItem.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-4 py-1">{cartItem.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(cartItem, cartItem.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                            disabled={product?.inventory ? cartItem.quantity >= product.inventory : false}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(cartItem.productId)}
                          className="text-red-500 hover:text-red-700 flex items-center text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      {product && formatCurrency((product.price * cartItem.quantity) / 100)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => clearCart()}>
                  Clear Cart
                </Button>
                <Button asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal / 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between border-t pt-4 font-bold">
                    <span>Estimated Total</span>
                    <span>{formatCurrency(subtotal / 100)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => setCheckoutOpen(true)}
                    disabled={isCartEmpty}
                  >
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
        
        {/* Checkout Dialog */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Shipping Information</DialogTitle>
              <DialogDescription>
                Enter your shipping details to complete your order.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCheckout)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main St" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Apt 4B" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="New York" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="NY" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip/Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="10001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="United States" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="(123) 456-7890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCheckoutOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

// Format category name for display
function formatCategoryName(category?: string) {
  if (!category) return "";
  return category.charAt(0).toUpperCase() + category.slice(1).replace('_', '-');
}
