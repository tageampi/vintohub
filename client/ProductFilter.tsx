import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, SlidersHorizontal, X } from "lucide-react";

const categories = [
  { id: "thrifted", label: "Thrifted" },
  { id: "handcrafted", label: "Handcrafted" },
  { id: "artisanal", label: "Artisanal" },
  { id: "pre_order", label: "Pre-order" },
];

const tags = [
  { id: "fashion", label: "Fashion" },
  { id: "home", label: "Home Decor" },
  { id: "jewelry", label: "Jewelry" },
  { id: "art", label: "Art" },
  { id: "vintage", label: "Vintage" },
  { id: "accessories", label: "Accessories" },
];

type FilterState = {
  categories: string[];
  tags: string[];
  priceRange: [number, number];
  sortBy: string;
}

export default function ProductFilter() {
  const [location, setLocation] = useLocation();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Parse current URL to extract filter parameters
  const params = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  const categoryParam = params.get('category') || '';
  const tagsParam = params.get('tags') || '';
  const minPrice = parseInt(params.get('minPrice') || '0');
  const maxPrice = parseInt(params.get('maxPrice') || '10000');
  const sortBy = params.get('sortBy') || 'newest';
  
  // Set initial filter state based on URL parameters
  const [filters, setFilters] = useState<FilterState>({
    categories: categoryParam ? [categoryParam] : [],
    tags: tagsParam ? tagsParam.split(',') : [],
    priceRange: [minPrice, maxPrice],
    sortBy: sortBy,
  });

  // Apply filters and update URL
  const applyFilters = () => {
    const newParams = new URLSearchParams();
    
    if (filters.categories.length === 1) {
      newParams.set('category', filters.categories[0]);
    }
    
    if (filters.tags.length > 0) {
      newParams.set('tags', filters.tags.join(','));
    }
    
    if (filters.priceRange[0] > 0) {
      newParams.set('minPrice', filters.priceRange[0].toString());
    }
    
    if (filters.priceRange[1] < 10000) {
      newParams.set('maxPrice', filters.priceRange[1].toString());
    }
    
    if (filters.sortBy) {
      newParams.set('sortBy', filters.sortBy);
    }
    
    // Preserve search parameter if it exists
    if (params.has('search')) {
      newParams.set('search', params.get('search')!);
    }
    
    // Base path without query parameters
    const basePath = location.includes('?') ? location.split('?')[0] : location;
    const paramsString = newParams.toString();
    
    setLocation(`${basePath}${paramsString ? '?' + paramsString : ''}`);
    setShowMobileFilters(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      categories: [],
      tags: [],
      priceRange: [0, 10000],
      sortBy: 'newest',
    });
  };

  // Handle category toggle
  const toggleCategory = (categoryId: string) => {
    if (filters.categories.includes(categoryId)) {
      setFilters({
        ...filters,
        categories: filters.categories.filter(id => id !== categoryId)
      });
    } else {
      // In this interface we're allowing only one category selection
      setFilters({
        ...filters,
        categories: [categoryId]
      });
    }
  };

  // Handle tag toggle
  const toggleTag = (tagId: string) => {
    if (filters.tags.includes(tagId)) {
      setFilters({
        ...filters,
        tags: filters.tags.filter(id => id !== tagId)
      });
    } else {
      setFilters({
        ...filters,
        tags: [...filters.tags, tagId]
      });
    }
  };

  // For the price slider
  const handlePriceChange = (values: number[]) => {
    setFilters({
      ...filters,
      priceRange: [values[0], values[1]]
    });
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return `$${price}`;
  };

  return (
    <>
      {/* Mobile filter toggle button */}
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setShowMobileFilters(true)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter Products
        </Button>
      </div>

      {/* Mobile filter sidebar */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-200 ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-200 ${showMobileFilters ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium">Filters</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMobileFilters(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="p-4 overflow-y-auto h-[calc(100%-8rem)]">
            <div className="space-y-6">
              {/* Mobile Categories */}
              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox 
                        id={`mobile-cat-${category.id}`} 
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label 
                        htmlFor={`mobile-cat-${category.id}`} 
                        className="ml-2 text-sm font-normal"
                      >
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Tags */}
              <div>
                <h3 className="font-medium mb-3">Tags</h3>
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center">
                      <Checkbox 
                        id={`mobile-tag-${tag.id}`} 
                        checked={filters.tags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <Label 
                        htmlFor={`mobile-tag-${tag.id}`} 
                        className="ml-2 text-sm font-normal"
                      >
                        {tag.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Price Range */}
              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="pt-2 px-2">
                  <Slider
                    value={[filters.priceRange[0], filters.priceRange[1]]}
                    min={0}
                    max={10000}
                    step={10}
                    onValueChange={handlePriceChange}
                    className="my-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Mobile Sort Options */}
              <div>
                <h3 className="font-medium mb-3">Sort By</h3>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                >
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex space-x-2">
            <Button variant="outline" className="flex-1" onClick={resetFilters}>
              Reset
            </Button>
            <Button className="flex-1" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop filters */}
      <div className="hidden md:block w-60 flex-shrink-0">
        <div className="sticky top-24 pr-4 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>

          <Accordion type="multiple" defaultValue={["categories", "tags", "price"]} className="w-full">
            <AccordionItem value="categories">
              <AccordionTrigger>Categories</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox 
                        id={`cat-${category.id}`} 
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label 
                        htmlFor={`cat-${category.id}`} 
                        className="ml-2 text-sm font-normal"
                      >
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tags">
              <AccordionTrigger>Tags</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center">
                      <Checkbox 
                        id={`tag-${tag.id}`} 
                        checked={filters.tags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <Label 
                        htmlFor={`tag-${tag.id}`} 
                        className="ml-2 text-sm font-normal"
                      >
                        {tag.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price">
              <AccordionTrigger>Price Range</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 px-2">
                  <Slider
                    value={[filters.priceRange[0], filters.priceRange[1]]}
                    min={0}
                    max={10000}
                    step={10}
                    onValueChange={handlePriceChange}
                    className="my-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div>
            <h3 className="font-medium mb-3">Sort By</h3>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <Button className="w-full" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
}
