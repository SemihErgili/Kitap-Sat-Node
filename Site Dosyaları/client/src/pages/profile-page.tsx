import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User, Package, Settings, LogOut, ShoppingBag } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Order, OrderItem, Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

// Profile form validation schema
const profileFormSchema = z.object({
  fullName: z.string().min(3, { message: "Ad Soyad en az 3 karakter olmalıdır" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
});

// Password change validation schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Mevcut şifre en az 6 karakter olmalıdır" }),
  newPassword: z.string().min(6, { message: "Yeni şifre en az 6 karakter olmalıdır" }),
  confirmPassword: z.string().min(6, { message: "Şifre tekrarı en az 6 karakter olmalıdır" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

// Order with items type
type OrderWithItems = Order & {
  items: (OrderItem & { product?: Product })[];
};

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      avatar: user?.avatar || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Fetch user orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Fetch order details when expanded
  const fetchOrderDetails = async (orderId: number): Promise<OrderWithItems> => {
    const res = await fetch(`/api/orders/${orderId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Sipariş detayları yüklenemedi");
    return res.json();
  };
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      if (!user) throw new Error("Kullanıcı oturumu bulunamadı");
      
      const res = await apiRequest("PUT", `/api/users/${user.id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Update user data in the auth context
      queryClient.setQueryData(["/api/user"], data);
      
      toast({
        title: "Profil güncellendi",
        description: "Profiliniz başarıyla güncellendi.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordFormSchema>) => {
      if (!user) throw new Error("Kullanıcı oturumu bulunamadı");
      
      const res = await apiRequest("POST", `/api/users/${user.id}/change-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Şifre değiştirildi",
        description: "Şifreniz başarıyla değiştirildi.",
        variant: "default",
      });
      
      // Reset password form
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Şifre değiştirilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(values);
  };
  
  // Handle password form submission
  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    changePasswordMutation.mutate(values);
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  if (!user) {
    return null; // Will be handled by ProtectedRoute
  }
  
  return (
    <>
      <Helmet>
        <title>Hesabım | ErgiliBookShop</title>
        <meta name="description" content="ErgiliBookShop - Kitap koleksiyonunuzu yönetin ve siparişlerinizi takip edin." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <h2 className="font-bold text-lg">{user.fullName || user.username}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-4">
                    <div className="space-y-1">
                      <Button
                        variant={activeTab === "profile" ? "default" : "ghost"}
                        className={`w-full justify-start ${activeTab === "profile" ? "bg-primary hover:bg-primary/90" : ""}`}
                        onClick={() => setActiveTab("profile")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profilim
                      </Button>
                      
                      <Button
                        variant={activeTab === "orders" ? "default" : "ghost"}
                        className={`w-full justify-start ${activeTab === "orders" ? "bg-primary hover:bg-primary/90" : ""}`}
                        onClick={() => setActiveTab("orders")}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Siparişlerim
                      </Button>
                      
                      <Button
                        variant={activeTab === "settings" ? "default" : "ghost"}
                        className={`w-full justify-start ${activeTab === "settings" ? "bg-primary hover:bg-primary/90" : ""}`}
                        onClick={() => setActiveTab("settings")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Hesap Ayarları
                      </Button>
                      
                      <Separator className="my-2" />
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıkış Yap
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="md:col-span-3">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Profil Bilgileri</CardTitle>
                      <CardDescription>
                        Kişisel bilgilerinizi güncelleyin ve profilinizi yönetin.
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ad Soyad</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ad Soyad" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>E-posta</FormLabel>
                                <FormControl>
                                  <Input placeholder="E-posta" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefon</FormLabel>
                                <FormControl>
                                  <Input placeholder="Telefon" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Adres</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Adres" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="avatar"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profil Resmi URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="Profil resmi URL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary/90"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Güncelleniyor..." : "Profili Güncelle"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
                
                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Siparişlerim</CardTitle>
                      <CardDescription>
                        Geçmiş siparişlerinizi görüntüleyin ve takip edin.
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {isLoadingOrders ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-center mb-4">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-24" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="flex justify-between">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-4 w-20" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : orders && orders.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          {orders.map((order) => (
                            <AccordionItem key={order.id} value={`order-${order.id}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left">
                                  <div>
                                    <span className="font-semibold">Sipariş #{order.id}</span>
                                    <span className="block sm:inline sm:ml-2 text-sm text-gray-500">
                                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                                    </span>
                                  </div>
                                  <div className="mt-1 sm:mt-0">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      order.status === "completed" 
                                        ? "bg-green-100 text-green-800" 
                                        : order.status === "processing" 
                                        ? "bg-blue-100 text-blue-800" 
                                        : order.status === "cancelled" 
                                        ? "bg-red-100 text-red-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                      {order.status === "pending" ? "Beklemede" : 
                                        order.status === "processing" ? "İşleniyor" : 
                                        order.status === "completed" ? "Tamamlandı" : 
                                        order.status === "cancelled" ? "İptal Edildi" : 
                                        order.status}
                                    </span>
                                    <span className="ml-2 font-medium">{order.total.toFixed(2)}₺</span>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              
                              <AccordionContent>
                                <OrderDetail orderId={order.id} />
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900">Henüz kitap siparişiniz bulunmuyor</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Kitap siparişleriniz ve satın aldığınız tüm kitaplar burada görüntülenecektir.
                          </p>
                          <Button className="mt-6 bg-primary hover:bg-primary/90" asChild>
                            <a href="/products">Kitap Kataloğuna Göz At</a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Settings Tab */}
                {activeTab === "settings" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hesap Ayarları</CardTitle>
                      <CardDescription>
                        Şifrenizi değiştirin ve hesap ayarlarınızı yönetin.
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Şifre Değiştir</h3>
                          <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                              <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Mevcut Şifre</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Yeni Şifre</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Şifre Tekrar</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button 
                                type="submit" 
                                className="bg-primary hover:bg-primary/90"
                                disabled={changePasswordMutation.isPending}
                              >
                                {changePasswordMutation.isPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                              </Button>
                            </form>
                          </Form>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Hesap Ayarları</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">E-posta Bildirimleri</h4>
                                <p className="text-sm text-gray-500">Kampanya ve indirimlerden haberdar olun</p>
                              </div>
                              <Button variant="outline">Düzenle</Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-red-600">Hesabı Sil</h4>
                                <p className="text-sm text-gray-500">Hesabınız ve tüm verileriniz kalıcı olarak silinecektir</p>
                              </div>
                              <Button variant="destructive">Hesabı Sil</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// Order Detail Component
function OrderDetail({ orderId }: { orderId: number }) {
  const { data: orderDetails, isLoading } = useQuery<OrderWithItems>({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: () => fetch(`/api/orders/${orderId}`, { credentials: "include" }).then(res => {
      if (!res.ok) throw new Error("Sipariş detayları yüklenemedi");
      return res.json();
    }),
  });
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  
  if (!orderDetails) {
    return <p className="p-4 text-red-500">Sipariş detayları yüklenemedi.</p>;
  }
  
  return (
    <div className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-sm text-gray-500">Teslimat Adresi</h4>
          <p className="mt-1">{orderDetails.address}</p>
        </div>
        <div>
          <h4 className="font-medium text-sm text-gray-500">İletişim</h4>
          <p className="mt-1">{orderDetails.phone}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Sipariş Edilen Kitaplar</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kitap</TableHead>
                <TableHead className="text-right">Fiyat</TableHead>
                <TableHead className="text-right">Adet</TableHead>
                <TableHead className="text-right">Toplam</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderDetails.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product?.name || `Kitap #${item.productId}`}
                    {item.product?.description && (
                      <span className="block text-xs text-gray-500 mt-1">
                        {item.product.description.substring(0, 60)}...
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.price.toFixed(2)}₺</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {(item.price * item.quantity).toFixed(2)}₺
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Toplam Tutar
                </TableCell>
                <TableCell className="text-right font-bold">
                  {orderDetails.total.toFixed(2)}₺
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
