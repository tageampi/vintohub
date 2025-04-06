import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { WishlistItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type WishlistContextType = {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/wishlist", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist",
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

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist",
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

  const addToWishlist = (productId: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }
    addToWishlistMutation.mutate(productId);
  };

  const removeFromWishlist = (productId: number) => {
    if (!user) return;
    removeFromWishlistMutation.mutate(productId);
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
