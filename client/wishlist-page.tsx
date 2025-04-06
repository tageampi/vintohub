import { useQuery } from "@tanstack/react-query";
import { WishlistItem, Product } from "@shared/schema";
import MainLayout from "@/components/layout/MainLayout";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Heart, X, HeartOff } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Fetch products to get details of items in wishlist
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: wishlistItems.length > 0,
  });

  // Get matching products for wishlist items
  const wishlistProducts = wishlistItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { wishlistItem: item, product };
  }).filter(item => item.product !== undefined);

  // Handle add to cart button
  const handleAddToCart = (productId: number) => {
    addToCart(productId);
  };

  // Function to generate category badge styling
  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'thrifted':
        return 'bg-blue-100 text-blue-700';
      case 'handcrafted':
        return 'bg-primary-100 text-primary-700';
      case 'artisanal':
        return 'bg-yellow-100 text-yellow-700';
      case 'pre_order':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format category name for display
  const formatCategoryName = (category?: string) => {
    if (!category) return "";
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', '-');
  };

  // Check if wishlist is empty
  const isWishlistEmpty = wishlistItems.length === 0;

  return (
    <MainLayout>
      <Helmet>
        <title>Wishlist | VintoHub</title>
        <meta name="description" content="View and manage your saved items on VintoHub." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Wishlist</h1>
          {!isWishlistEmpty && (
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          )}
        </div>
        
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <div className="relative pb-[100%]">
                  <Skeleton className="absolute inset-0 rounded-t-lg" />
                </div>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isWishlistEmpty ? (
          <div className="text-center py-16">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <HeartOff className="h-full w-full" />
            </div>
            <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love to your wishlist to find them easily later.</p>
            <Button asChild>
              <Link href="/products">Discover Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map(({ wishlistItem, product }) => (
              <Card key={wishlistItem.id} className="overflow-hidden">
                <div className="relative">
                  <Link href={`/products/${product?.id}`}>
                    <a className="block">
                      <div className="relative pb-[100%] overflow-hidden">
                        <img 
                          src={product?.images?.[0] || "https://via.placeholder.com/300"} 
                          alt={product?.title || "Product"} 
                          className="absolute inset-0 h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    </a>
                  </Link>
                  <button 
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition"
                    onClick={() => removeFromWishlist(wishlistItem.productId)}
                    aria-label="Remove from wishlist"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <CardContent className="p-4">
                  {product?.category && (
                    <Badge 
                      variant="outline" 
                      className={`mb-2 ${getCategoryBadgeStyle(product.category)}`}
                    >
                      {formatCategoryName(product.category)}
                    </Badge>
                  )}
                  
                  <Link href={`/products/${product?.id}`}>
                    <a className="block">
                      <h3 className="font-medium mb-1 hover:text-primary-600 transition">
                        {product?.title}
                      </h3>
                    </a>
                  </Link>
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-semibold">
                      {product && formatCurrency(product.price / 100)}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(product?.id || 0)}
                      disabled={!product || product.inventory === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {product?.inventory === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
