import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type CartContextType = {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: (products: Product[]) => number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity?: number }) => {
      await apiRequest("POST", "/api/cart", { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      await apiRequest("PATCH", `/api/cart/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Product has been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCart = (productId: number, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate({ productId, quantity });
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (!user) return;
    updateCartItemMutation.mutate({ productId, quantity });
  };

  const removeFromCart = (productId: number) => {
    if (!user) return;
    removeFromCartMutation.mutate(productId);
  };

  const clearCart = () => {
    if (!user) return;
    clearCartMutation.mutate();
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = (products: Product[]) => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        getCartItemCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
