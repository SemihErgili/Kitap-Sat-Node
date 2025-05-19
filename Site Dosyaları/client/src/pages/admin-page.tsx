import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Book, PlusCircle, Edit, Trash2, Tag, List } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertProductSchema, Product, Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Ürün ekleme validasyon şeması
const productFormSchema = z.object({
  name: z.string().min(2, { message: "Kitap adı en az 2 karakter olmalıdır" }),
  description: z.string().min(10, { message: "Açıklama en az 10 karakter olmalıdır" }),
  price: z.coerce.number().min(0, { message: "Fiyat 0'dan büyük olmalıdır" }),
  discountPrice: z.coerce.number().min(0, { message: "İndirimli fiyat 0'dan büyük olmalıdır" }).optional().nullable(),
  categoryId: z.coerce.number().min(1, { message: "Kategori seçmelisiniz" }),
  imageUrl: z.string().url({ message: "Geçerli bir resim URL'si giriniz" }),
  inStock: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isNew: z.boolean().default(true),
  discountPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
});

// Kategori ekleme validasyon şeması
const categoryFormSchema = z.object({
  name: z.string().min(2, { message: "Kategori adı en az 2 karakter olmalıdır" }),
  icon: z.string().min(2, { message: "İkon kodu giriniz" }),
});

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  
  // Tüm ürünleri getir
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Tüm kategorileri getir
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Yeni ürün ekleme formu
  const addProductForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: null,
      categoryId: 0,
      imageUrl: "",
      inStock: true,
      isFeatured: false,
      isBestseller: false,
      isNew: true,
      discountPercentage: null,
    },
  });
  
  // Ürün düzenleme formu
  const editProductForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: null,
      categoryId: 0,
      imageUrl: "",
      inStock: true,
      isFeatured: false,
      isBestseller: false,
      isNew: true,
      discountPercentage: null,
    },
  });
  
  // Düzenlenecek ürün değiştiğinde formu güncelle
  useState(() => {
    if (editingProduct) {
      editProductForm.reset({
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: editingProduct.price,
        discountPrice: editingProduct.discountPrice,
        categoryId: editingProduct.categoryId,
        imageUrl: editingProduct.imageUrl,
        inStock: editingProduct.inStock || true,
        isFeatured: editingProduct.isFeatured || false,
        isBestseller: editingProduct.isBestseller || false,
        isNew: editingProduct.isNew || false,
        discountPercentage: editingProduct.discountPercentage,
      });
    }
  });
  
  // Kategori ekleme formu
  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      icon: "fas fa-book",
    },
  });
  
  // Yeni ürün ekleme mutation
  const addProductMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productFormSchema>) => {
      const res = await apiRequest("POST", "/api/products", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kitap başarıyla eklendi",
        variant: "default",
      });
      setIsAddProductDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Kitap eklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });
  
  // Ürün düzenleme mutation
  const editProductMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productFormSchema>) => {
      if (!editingProduct) throw new Error("Düzenlenecek ürün bulunamadı");
      
      const res = await apiRequest("PUT", `/api/products/${editingProduct.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kitap başarıyla güncellendi",
        variant: "default",
      });
      setIsEditProductDialogOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Kitap güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });
  
  // Ürün silme mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("DELETE", `/api/products/${productId}`);
      return res.ok;
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kitap başarıyla silindi",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Kitap silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });
  
  // Kategori ekleme mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof categoryFormSchema>) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla eklendi",
        variant: "default",
      });
      categoryForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsAddCategoryDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Kategori eklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });
  
  // Ürün ekleme form submit
  const onAddProductSubmit = (values: z.infer<typeof productFormSchema>) => {
    addProductMutation.mutate(values);
  };
  
  // Ürün düzenleme form submit
  const onEditProductSubmit = (values: z.infer<typeof productFormSchema>) => {
    editProductMutation.mutate(values);
  };
  
  // Kategori ekleme form submit
  const onAddCategorySubmit = (values: z.infer<typeof categoryFormSchema>) => {
    addCategoryMutation.mutate(values);
  };
  
  // Ürünü düzenlemek için hazırla
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    editProductForm.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      discountPrice: product.discountPrice,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      inStock: product.inStock || true,
      isFeatured: product.isFeatured || false,
      isBestseller: product.isBestseller || false,
      isNew: product.isNew || false,
      discountPercentage: product.discountPercentage,
    });
    setIsEditProductDialogOpen(true);
  };
  
  // Ürünü sil
  const handleDeleteProduct = (productId: number) => {
    deleteProductMutation.mutate(productId);
  };
  
  // Admin değilse gösterme
  if (!user || user.username !== "admin") {
    return (
      <>
        <Helmet>
          <title>Yetkisiz Erişim | ErgiliBookShop</title>
        </Helmet>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-red-600 mb-4">Yetkisiz Erişim</h1>
              <p className="text-lg text-gray-600 mb-6">
                Bu sayfaya erişmek için admin yetkilerine sahip olmalısınız.
              </p>
              <Button asChild>
                <a href="/">Ana Sayfaya Dön</a>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Admin Paneli | ErgiliBookShop</title>
        <meta name="description" content="ErgiliBookShop - Kitap ve kategori yönetimi" />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Admin Paneli</h1>
              <div className="flex space-x-2">
                <Button onClick={() => setIsAddProductDialogOpen(true)} noRefresh>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Yeni Kitap Ekle
                </Button>
                <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(true)} noRefresh>
                  <Tag className="mr-2 h-4 w-4" />
                  Yeni Kategori Ekle
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="products" className="flex items-center">
                  <Book className="mr-2 h-4 w-4" />
                  Kitaplar
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  Kategoriler
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Kitap Listesi</CardTitle>
                    <CardDescription>
                      Tüm kitapları görüntüleyin, düzenleyin veya silin.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProducts ? (
                      <div className="text-center py-8">Yükleniyor...</div>
                    ) : products && products.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Kitap Adı</TableHead>
                              <TableHead>Fiyat</TableHead>
                              <TableHead>Kategori</TableHead>
                              <TableHead>Durum</TableHead>
                              <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {product.description && product.description.substring(0, 50)}...
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {product.discountPrice ? (
                                    <div>
                                      <span className="text-sm line-through text-gray-500">{product.price.toFixed(2)}₺</span>
                                      <span className="font-medium text-green-600 ml-2">{product.discountPrice.toFixed(2)}₺</span>
                                    </div>
                                  ) : (
                                    <span>{product.price.toFixed(2)}₺</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {categories?.find(c => c.id === product.categoryId)?.name || "Kategori bulunamadı"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    {product.inStock ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Stokta
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Tükendi
                                      </span>
                                    )}
                                    {product.isFeatured && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Öne Çıkan
                                      </span>
                                    )}
                                    {product.isBestseller && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Çok Satan
                                      </span>
                                    )}
                                    {product.isNew && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Yeni
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleEditProduct(product)} noRefresh>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" noRefresh>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Bu kitabı silmek istediğinizden emin misiniz?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Bu işlem geri alınamaz. Kitap ve ilgili tüm veriler kalıcı olarak silinecektir.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>İptal</AlertDialogCancel>
                                          <AlertDialogAction 
                                            className="bg-red-500 hover:bg-red-700"
                                            onClick={() => handleDeleteProduct(product.id)}
                                          >
                                            Sil
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-lg text-gray-500">Henüz kitap bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Kategori Listesi</CardTitle>
                    <CardDescription>
                      Tüm kategorileri görüntüleyin ve yönetin.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCategories ? (
                      <div className="text-center py-8">Yükleniyor...</div>
                    ) : categories && categories.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Kategori Adı</TableHead>
                              <TableHead>İkon</TableHead>
                              <TableHead>Kitap Sayısı</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categories.map((category) => (
                              <TableRow key={category.id}>
                                <TableCell>{category.id}</TableCell>
                                <TableCell>
                                  <div className="font-medium">{category.name}</div>
                                </TableCell>
                                <TableCell>
                                  <code>{category.icon}</code>
                                </TableCell>
                                <TableCell>
                                  {category.productCount || 0}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-lg text-gray-500">Henüz kategori bulunmuyor</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
      
      {/* Yeni Kitap Ekleme Dialog */}
      <Dialog
        open={isAddProductDialogOpen}
        onOpenChange={(open) => {
          setIsAddProductDialogOpen(open);
          if (!open) {
            setTimeout(() => addProductForm.reset(), 0);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Yeni Kitap Ekle</DialogTitle>
            <DialogDescription>
              Kitap bilgilerini doldurarak yeni bir kitap ekleyin.
            </DialogDescription>
          </DialogHeader>
          <Form {...addProductForm}>
            <form onSubmit={addProductForm.handleSubmit(onAddProductSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={addProductForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kitap Adı</FormLabel>
                      <FormControl>
                        <Input placeholder="Kitap adı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addProductForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addProductForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiyat (₺)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addProductForm.control}
                  name="discountPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İndirimli Fiyat (₺) - Opsiyonel</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addProductForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resim URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/kitap.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addProductForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İndirim Yüzdesi (%) - Opsiyonel</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          placeholder="0" 
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormField
                    control={addProductForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kitap Açıklaması</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Kitap açıklaması"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormField
                    control={addProductForm.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Stokta</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addProductForm.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Öne Çıkan</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addProductForm.control}
                    name="isBestseller"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Çok Satan</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addProductForm.control}
                    name="isNew"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Yeni</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddProductDialogOpen(false)} noRefresh>
                  İptal
                </Button>
                <Button type="submit" disabled={addProductMutation.isPending} noRefresh>
                  {addProductMutation.isPending ? "Ekleniyor..." : "Kitap Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Kategori Ekleme Dialog */}
      <Dialog
        open={isAddCategoryDialogOpen}
        onOpenChange={(open) => {
          setIsAddCategoryDialogOpen(open);
          if (!open) {
            setTimeout(() => categoryForm.reset(), 0);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kategori Ekle</DialogTitle>
            <DialogDescription>
              Kategori bilgilerini doldurarak yeni bir kategori ekleyin.
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onAddCategorySubmit)} className="space-y-6">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Kategori adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={categoryForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İkon Kodu</FormLabel>
                    <FormControl>
                      <Input placeholder="fas fa-book" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)} noRefresh>
                  İptal
                </Button>
                <Button type="submit" disabled={addCategoryMutation.isPending} noRefresh>
                  {addCategoryMutation.isPending ? "Ekleniyor..." : "Kategori Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Ürün Düzenleme Dialog */}
      <Dialog
        open={isEditProductDialogOpen}
        onOpenChange={(open) => {
          setIsEditProductDialogOpen(open);
          if (!open) {
            setTimeout(() => editProductForm.reset(), 0);
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Kitap Düzenle</DialogTitle>
            <DialogDescription>
              Kitap bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <Form {...editProductForm}>
            <form onSubmit={editProductForm.handleSubmit(onEditProductSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={editProductForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kitap Adı</FormLabel>
                      <FormControl>
                        <Input placeholder="Kitap adı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editProductForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editProductForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiyat (₺)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editProductForm.control}
                  name="discountPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İndirimli Fiyat (₺) - Opsiyonel</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editProductForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resim URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/kitap.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editProductForm.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İndirim Yüzdesi (%) - Opsiyonel</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          placeholder="0" 
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormField
                    control={editProductForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kitap Açıklaması</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Kitap açıklaması"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormField
                    control={editProductForm.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Stokta</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editProductForm.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Öne Çıkan</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editProductForm.control}
                    name="isBestseller"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Çok Satan</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editProductForm.control}
                    name="isNew"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Yeni</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditProductDialogOpen(false);
                  setEditingProduct(null);
                }} noRefresh>
                  İptal
                </Button>
                <Button type="submit" disabled={editProductMutation.isPending} noRefresh>
                  {editProductMutation.isPending ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}