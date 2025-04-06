import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, Shop } from "@shared/schema";
import SellerDashboardLayout from "@/components/sellers/SellerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreVertical,
  Box, 
  Tag,
  DollarSign,
  PackageCheck,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateToLocal, getCategoryColor, formatCategoryName } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AddProductForm from "@/components/products/AddProductForm";
import EditProductForm from "@/components/products/EditProductForm";

export default function SellerProducts() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Fetch shop data
  const { data: shop } = useQuery<Shop>({
    queryKey: ["/api/user/shop"],
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { shopId: shop?.id }],
    enabled: !!shop?.id,
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "Your product has been successfully deleted.",
      });
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete product. Please try again.",
      });
    },
  });

  // Filter products by search query
  const filteredProducts = searchQuery 
    ? products.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : products;

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Handle actual delete
  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  // Get product to edit
  const productToEdit = products.find(p => p.id === editProductId);

  return (
    <SellerDashboardLayout title="Manage Products">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setAddProductOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {productsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
            <Box className="h-full w-full" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No products found</h3>
          {searchQuery ? (
            <p className="text-gray-500 mb-4">
              No products match your search query. Try a different search or clear the filter.
            </p>
          ) : (
            <p className="text-gray-500 mb-4">
              You haven't added any products yet. Add your first product to start selling.
            </p>
          )}
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
          ) : (
            <Button onClick={() => setAddProductOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.title} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.title}</p>
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="text-xs text-gray-500">
                                #{tag}
                              </span>
                            ))}
                            {product.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{product.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(product.category)}>
                      {formatCategoryName(product.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(product.price / 100)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge variant={product.inventory > 0 ? "outline" : "destructive"} className="font-mono">
                        {product.inventory}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDateToLocal(product.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setEditProductId(product.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => handleDeleteClick(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Product Dialog */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product to sell in your shop.
            </DialogDescription>
          </DialogHeader>
          
          <AddProductForm 
            onSuccess={() => {
              setAddProductOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            }} 
            shopId={shop?.id}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog 
        open={!!editProductId} 
        onOpenChange={(open) => {
          if (!open) setEditProductId(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update your product information.
            </DialogDescription>
          </DialogHeader>
          
          {productToEdit && (
            <EditProductForm 
              product={productToEdit}
              onSuccess={() => {
                setEditProductId(null);
                queryClient.invalidateQueries({ queryKey: ["/api/products"] });
              }}
              shopId={shop?.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SellerDashboardLayout>
  );
}
