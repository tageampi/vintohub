import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { insertProductSchema } from "@shared/schema";

// Extended schema for the form
const productFormSchema = insertProductSchema.extend({
  imageUrls: z.array(z.string().url()).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface AddProductFormProps {
  onSuccess: () => void;
  shopId: number | undefined;
}

export default function AddProductForm({ onSuccess, shopId }: AddProductFormProps) {
  const { toast } = useToast();
  const [productTags, setProductTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const productData = {
        ...data,
        shopId: shopId, // Ensure shop ID is included
        price: parseInt((parseFloat(data.price.toString()) * 100).toString()), // Convert to cents
        images: data.imageUrls || [], // Handle images
        tags: productTags,
      };
      
      delete productData.imageUrls; // Remove temporary field
      
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "Your product has been successfully created.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error creating product",
        description: error.message || "There was an error creating your product.",
      });
    },
  });

  // Setup form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "handcrafted",
      inventory: 1,
      imageUrls: [],
    },
  });

  // Form submission handler
  const onSubmit = (data: ProductFormValues) => {
    if (!shopId) {
      toast({
        variant: "destructive",
        title: "Shop required",
        description: "Please create a shop before adding products.",
      });
      return;
    }
    
    createProductMutation.mutate({
      ...data,
      imageUrls: imageUrls,
    });
  };

  // Add tag to product
  const addTag = () => {
    if (tagInput.trim() && !productTags.includes(tagInput.trim())) {
      setProductTags(prev => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag from product
  const removeTag = (tag: string) => {
    setProductTags(prev => prev.filter(t => t !== tag));
  };

  // Add image URL
  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  // Remove image URL
  const removeImageUrl = (url: string) => {
    setImageUrls(prev => prev.filter(u => u !== url));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Title</FormLabel>
              <FormControl>
                <Input placeholder="Handcrafted Ceramic Mug" {...field} />
              </FormControl>
              <FormDescription>
                A clear, descriptive title for your product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your product in detail..." 
                  rows={5}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide detailed information about your product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    placeholder="29.99" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Set the price in USD.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inventory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="1" 
                    placeholder="10" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  How many items are available.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="thrifted">Thrifted</SelectItem>
                  <SelectItem value="handcrafted">Handcrafted</SelectItem>
                  <SelectItem value="artisanal">Artisanal</SelectItem>
                  <SelectItem value="pre_order">Pre-order / Made-to-order</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the category that best fits your product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Product Tags */}
        <div>
          <FormLabel>Tags</FormLabel>
          <div className="flex mt-1.5 mb-1.5">
            <Input
              placeholder="Add tags (e.g., vintage, handmade)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="mr-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <FormDescription>
            Add tags to help buyers find your product.
          </FormDescription>
          {productTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {productTags.map((tag, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                >
                  <span>#{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Images */}
        <div>
          <FormLabel htmlFor="image-urls">Product Images</FormLabel>
          <div className="flex mt-1.5 mb-1.5">
            <Input
              id="image-urls"
              placeholder="Add image URL"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="mr-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
            />
            <Button type="button" onClick={addImageUrl} variant="outline">
              <Upload className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <FormDescription>
            Add image URLs for your product. First image will be the primary image.
          </FormDescription>
          
          {imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`Product image ${index + 1}`} 
                    className="rounded-md h-24 w-full object-cover border"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImageUrl(url)}
                    className="absolute top-1 right-1 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 p-8 border rounded-md border-dashed text-center">
              <p className="text-gray-500 text-sm">No images added yet</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={() => onSuccess()}>
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Product
          </Button>
        </div>
      </form>
    </Form>
  );
}
