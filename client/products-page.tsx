import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import MainLayout from "@/components/layout/MainLayout";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilter from "@/components/products/ProductFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";

export default function ProductsPage() {
  const [location] = useLocation();
  const [title, setTitle] = useState("All Products");
  
  // Parse current URL to extract parameters
  const params = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  const category = params.get('category');
  const tags = params.get('tags');
  const search = params.get('search');
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  const sortBy = params.get('sortBy');
  
  // Construct API query parameters
  const queryParams = new URLSearchParams();
  if (category) queryParams.set('category', category);
  if (tags) queryParams.set('tags', tags);
  if (search) queryParams.set('search', search);
  // We're not sending price filtering to backend in this example, but we would normally do so

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: [`/api/products?${queryParams.toString()}`],
  });

  // Update title based on parameters
  useEffect(() => {
    if (category) {
      setTitle(`${category.charAt(0).toUpperCase() + category.slice(1).replace('_', '-')} Products`);
    } else if (tags) {
      setTitle(`${tags.charAt(0).toUpperCase() + tags.slice(1)} Products`);
    } else if (search) {
      setTitle(`Search Results: "${search}"`);
    } else {
      setTitle("All Products");
    }
  }, [category, tags, search]);

  // Apply client-side filtering for price if parameters are provided
  const filteredProducts = products.filter(product => {
    if (minPrice && product.price < parseInt(minPrice) * 100) return false;
    if (maxPrice && product.price > parseInt(maxPrice) * 100) return false;
    return true;
  });

  // Apply client-side sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    // For 'popular' we would need data on popularity, using 'newest' as default
    return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
  });

  return (
    <MainLayout>
      <Helmet>
        <title>{title} | VintoHub</title>
        <meta name="description" content={`Browse ${title.toLowerCase()} on VintoHub - Thrift. Craft. Repeat.`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600">
            {isLoading 
              ? 'Loading products...' 
              : `${sortedProducts.length} ${sortedProducts.length === 1 ? 'product' : 'products'} available`
            }
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <ProductFilter />
          
          {/* Products */}
          <div className="flex-1">
            <ProductGrid products={sortedProducts} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
