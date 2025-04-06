import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Shop, Review } from "@shared/schema";
import MainLayout from "@/components/layout/MainLayout";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Store, MessageCircle, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Helmet } from "react-helmet-async";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Fetch shop details when product is loaded
  const { data: shop, isLoading: shopLoading } = useQuery<Shop>({
    queryKey: [`/api/shops/${product?.shopId}`],
    enabled: !!product?.shopId,
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });

  // Handle wishlist toggle
  const handleToggleWishlist = () => {
    if (!user) return;
    
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(productId, quantity);
  };

  // Format category name for display
  const formatCategoryName = (category?: string) => {
    if (!category) return "";
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', '-');
  };

  // Placeholder image
  const defaultImage = "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";

  // Calculate average rating
  const averageRating = reviews.length 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  // Previous and next image buttons
  const prevImage = () => {
    if (!product?.images?.length) return;
    setActiveImageIndex(prev => 
      prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
    );
  };

  const nextImage = () => {
    if (!product?.images?.length) return;
    setActiveImageIndex(prev => 
      prev === (product.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  // Loading state
  if (productLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/3" />
              <div className="space-y-2 pt-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Check if product exists
  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Alert variant="destructive" className="max-w-lg mx-auto">
            <AlertTitle>Product Not Found</AlertTitle>
            <AlertDescription>
              The product you are looking for does not exist or has been removed.
            </AlertDescription>
          </Alert>
          <Button className="mt-6" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>{product.title} | VintoHub</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white aspect-square">
              <img 
                src={product.images?.[activeImageIndex] || defaultImage} 
                alt={product.title} 
                className="w-full h-full object-contain"
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative border-2 rounded overflow-hidden w-16 h-16 flex-shrink-0 
                      ${activeImageIndex === idx ? 'border-primary-500' : 'border-gray-200'}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} - view ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-4">
              <Badge variant="outline" className={
                product.category === 'thrifted' ? 'bg-blue-100 text-blue-700' :
                product.category === 'handcrafted' ? 'bg-primary-100 text-primary-700' :
                product.category === 'artisanal' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }>
                {formatCategoryName(product.category)}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            <div className="text-2xl font-bold mb-4 text-primary-600">
              {formatCurrency(product.price / 100)}
            </div>

            <div className="mb-6">
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Seller info */}
            {shop && (
              <div className="flex items-center p-4 border border-gray-200 rounded-lg mb-6 bg-gray-50">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={shop.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=6b46c1&color=fff`} 
                    alt={shop.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{shop.name}</p>
                  <p className="text-sm text-gray-500">
                    {shop.verified ? 'Verified Seller ✓' : 'Seller'}
                  </p>
                </div>
                <Link href={`/shops/${shop.id}`}>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Store className="mr-2 h-4 w-4" />
                    Visit Shop
                  </Button>
                </Link>
              </div>
            )}

            {/* Stock / Availability */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-1">Availability:</p>
              {product.inventory > 0 ? (
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  In Stock - {product.inventory} available
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-700">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Quantity selector */}
            {product.inventory > 0 && (
              <div className="flex items-center mb-6">
                <span className="text-sm font-medium mr-4">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.inventory, prev + 1))}
                    className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1" 
                onClick={handleAddToCart} 
                disabled={product.inventory === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleToggleWishlist}
                className={isInWishlist(productId) ? 'text-primary-600 border-primary-600' : ''}
              >
                <Heart className={`mr-2 h-4 w-4 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
                {isInWishlist(productId) ? 'Saved' : 'Save'}
              </Button>
              
              {user && shop && (
                <Link href={`/messages/${shop.userId}`}>
                  <Button variant="outline">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message Seller
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Product tabs - Details, Reviews, etc. */}
        <div className="mt-12">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-4 border rounded-md mt-4">
              <div className="prose max-w-none">
                <h3>Product Description</h3>
                <p>{product.description}</p>
                
                {product.tags && product.tags.length > 0 && (
                  <>
                    <h4>Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-4 border rounded-md mt-4">
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                          <span className="text-primary-700 font-medium text-sm">
                            {review.userId.toString().charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">User #{review.userId}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="flex items-center text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : ''}`} />
                              ))}
                            </div>
                            <span className="ml-2">
                              {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet</p>
                  {user && (
                    <Button className="mt-4" asChild>
                      <Link href={`/products/${productId}/review`}>Write a Review</Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shipping" className="p-4 border rounded-md mt-4">
              <div className="prose max-w-none">
                <h3>Shipping Information</h3>
                <p>Standard shipping takes 3-5 business days.</p>
                
                <h3 className="mt-4">Return Policy</h3>
                <p>Items can be returned within 14 days of delivery. Please contact the seller for return instructions.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
