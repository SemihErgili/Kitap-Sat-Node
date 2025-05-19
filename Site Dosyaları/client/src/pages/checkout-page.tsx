import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreditCard, MapPin, CheckCircle, Truck, ShieldCheck } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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

// Form validation schema
const checkoutFormSchema = z.object({
  fullName: z.string().min(3, { message: "Ad Soyad en az 3 karakter olmalıdır" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  phone: z.string().min(10, { message: "Geçerli bir telefon numarası giriniz" }),
  address: z.string().min(10, { message: "Adres en az 10 karakter olmalıdır" }),
  city: z.string().min(2, { message: "Şehir bilgisi giriniz" }),
  postalCode: z.string().min(5, { message: "Geçerli bir posta kodu giriniz" }),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "pay_at_door"], {
    required_error: "Bir ödeme yöntemi seçiniz",
  }),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

// Conditional validation for credit card
const checkoutFormWithCardSchema = checkoutFormSchema.superRefine((data, ctx) => {
  if (data.paymentMethod === "credit_card") {
    if (!data.cardNumber || data.cardNumber.replace(/\s/g, "").length !== 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Geçerli bir kart numarası giriniz",
        path: ["cardNumber"],
      });
    }
    
    if (!data.cardName || data.cardName.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kart üzerindeki ismi giriniz",
        path: ["cardName"],
      });
    }
    
    if (!data.cardExpiry || !/^\d{2}\/\d{2}$/.test(data.cardExpiry)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Geçerli bir son kullanma tarihi giriniz (AA/YY)",
        path: ["cardExpiry"],
      });
    }
    
    if (!data.cardCvc || !/^\d{3}$/.test(data.cardCvc)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Geçerli bir CVC kodu giriniz",
        path: ["cardCvc"],
      });
    }
  }
});

export default function CheckoutPage() {
  const { cart, isLoading: isCartLoading, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Calculate totals
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 0 && subtotal < 1000 ? 49.99 : 0;
  const total = subtotal + shipping;

  // Initialize form with user data if available
  const form = useForm<z.infer<typeof checkoutFormWithCardSchema>>({
    resolver: zodResolver(checkoutFormWithCardSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: "",
      postalCode: "",
      paymentMethod: "credit_card",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof checkoutFormWithCardSchema>) => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast({
        title: "Hata",
        description: "Sepetiniz boş, lütfen sepete ürün ekleyin.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the order
      const orderRes = await apiRequest("POST", "/api/orders", {
        userId: user?.id,
        total: total,
        status: "pending",
        address: `${values.address}, ${values.city} ${values.postalCode}`,
        phone: values.phone,
      });
      
      const orderData = await orderRes.json();
      
      // Clear the cart
      await clearCart.mutateAsync();
      
      // Set order complete state
      setOrderComplete(true);
      setOrderId(orderData.id);
      
      // Reset form
      form.reset();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
    } catch (error) {
      toast({
        title: "Sipariş Hatası",
        description: "Siparişiniz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to cart if empty or not logged in
  if (!isCartLoading && (!cart || !cart.items || cart.items.length === 0) && !orderComplete) {
    navigate("/cart");
    return null;
  }

  // Order Success View
  if (orderComplete) {
    return (
      <>
        <Helmet>
          <title>Sipariş Tamamlandı | ErgiliBookShop</title>
          <meta name="description" content="Siparişiniz başarıyla tamamlandı. Teşekkür ederiz!" />
        </Helmet>
        
        <div className="flex flex-col min-h-screen">
          <Header />
          
          <main className="flex-grow py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h1 className="text-2xl font-bold mb-2">Siparişiniz Tamamlandı!</h1>
                <p className="text-gray-600 mb-6">
                  Siparişiniz başarıyla alındı. Sipariş numaranız: #{orderId}
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Truck className="h-5 w-5 text-primary mr-2" />
                    <p className="font-medium">Sipariş Takibi</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Siparişinizin durumunu "Siparişlerim" sayfasından takip edebilirsiniz.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => navigate("/profile/orders")}
                  >
                    Siparişlerim
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/products")}
                  >
                    Alışverişe Devam Et
                  </Button>
                </div>
              </div>
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
        <title>Ödeme | ErgiliBookShop</title>
        <meta name="description" content="ErgiliBookShop - Siparişinizi tamamlayın ve ödeme yapın." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-6">Ödeme</h1>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Checkout Form */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Teslimat ve Ödeme Bilgileri</h2>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Delivery Information */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Teslimat Bilgileri</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
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
                              control={form.control}
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
                          </div>
                          
                          <FormField
                            control={form.control}
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
                            control={form.control}
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
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Şehir</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Şehir" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Posta Kodu</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Posta Kodu" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {/* Payment Method */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Ödeme Yöntemi</h3>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="credit_card" id="credit_card" />
                                      <Label htmlFor="credit_card">Kredi Kartı</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                                      <Label htmlFor="bank_transfer">Banka Havalesi</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="pay_at_door" id="pay_at_door" />
                                      <Label htmlFor="pay_at_door">Kapıda Ödeme</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Credit Card Information */}
                          {paymentMethod === "credit_card" && (
                            <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                              <FormField
                                control={form.control}
                                name="cardNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Kart Numarası</FormLabel>
                                    <FormControl>
                                      <Input placeholder="1234 5678 9012 3456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cardName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Kart Üzerindeki İsim</FormLabel>
                                    <FormControl>
                                      <Input placeholder="AD SOYAD" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="cardExpiry"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Son Kullanma Tarihi</FormLabel>
                                      <FormControl>
                                        <Input placeholder="AA/YY" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="cardCvc"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>CVC</FormLabel>
                                      <FormControl>
                                        <Input placeholder="123" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Bank Transfer Information */}
                          {paymentMethod === "bank_transfer" && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium mb-2">Banka Hesap Bilgileri</h4>
                              <p className="text-sm mb-2">
                                Aşağıdaki banka hesabına havale yapabilirsiniz:
                              </p>
                              <ul className="text-sm space-y-1">
                                <li><span className="font-medium">Banka:</span> ErgiliBookShop Bank</li>
                                <li><span className="font-medium">Hesap Sahibi:</span> ErgiliBookShop A.Ş.</li>
                                <li><span className="font-medium">IBAN:</span> TR12 3456 7890 1234 5678 9012 34</li>
                                <li><span className="font-medium">Açıklama:</span> Sipariş numaranızı belirtmeyi unutmayın</li>
                              </ul>
                            </div>
                          )}
                          
                          {/* Cash on Delivery Information */}
                          {paymentMethod === "pay_at_door" && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm">
                                Siparişiniz kapıda ödeme ile gönderilecektir. Teslimat sırasında kurye nakit veya kredi kartı ile ödeme alacaktır.
                              </p>
                              <p className="text-sm mt-2 text-yellow-600">
                                Not: Kapıda ödeme seçeneğinde 10₺ ek hizmet bedeli uygulanır.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-accent hover:bg-accent/90"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "İşleniyor..." : "Siparişi Tamamla"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                  <h2 className="font-semibold mb-4">Sipariş Özeti</h2>
                  
                  {cart?.items && cart.items.length > 0 && (
                    <div className="space-y-4 mb-4">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex items-start">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium">{item.product.name}</p>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{item.quantity} adet</span>
                              <span>
                                {((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}₺
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ara Toplam</span>
                      <span>{subtotal.toFixed(2)}₺</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kargo</span>
                      <span>{shipping > 0 ? `${shipping.toFixed(2)}₺` : "Ücretsiz"}</span>
                    </div>
                    {paymentMethod === "pay_at_door" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kapıda Ödeme Bedeli</span>
                        <span>10.00₺</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Toplam</span>
                      <span>
                        {(total + (paymentMethod === "pay_at_door" ? 10 : 0)).toFixed(2)}₺
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Güvenli Ödeme</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Tüm işlemleriniz 256-bit SSL sertifikası ile güvence altındadır. Kredi kartı bilgileriniz kesinlikle saklanmaz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
