import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Star, StarHalf, Heart, Minus, Plus, ShoppingCart, Share2 } from "lucide-react";
import { ProductWithDetails, Review } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Rating stars component
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex text-yellow-400">
      {Array.from({ length: fullStars }).map((_, index) => (
        <Star key={index} className="fill-current" />
      ))}
      {hasHalfStar && <StarHalf className="fill-current" />}
      {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map(
        (_, index) => (
          <Star key={`empty-${index}`} className="text-gray-300" />
        )
      )}
    </div>
  );
};

// Review form schema
const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, { message: "Yorum en az 10 karakter olmalıdır" }),
});

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.productId ? parseInt(params.productId) : 0;
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch product details
  const { data: product, isLoading: isLoadingProduct } = useQuery<ProductWithDetails>({
    queryKey: [`/api/products/${productId}`],
    enabled: productId > 0,
  });
  
  // Fetch product reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<(Review & { user?: { id: number, username: string, fullName?: string, avatar?: string } })[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: productId > 0,
  });
  
  // Review form
  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });
  
  const [selectedRating, setSelectedRating] = useState(5);
  
  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Giriş yapmalısınız",
        description: "Ürünü sepete eklemek için giriş yapmalısınız.",
        variant: "destructive",
      });
      return;
    }
    
    addToCart.mutate({
      productId: productId,
      quantity: quantity,
    });
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  
  const handleWishlist = () => {
    toast({
      title: "Favorilere eklendi",
      description: `${product?.name} favorilerinize eklendi.`,
      variant: "default",
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Bağlantı kopyalandı",
          description: "Ürün bağlantısı panoya kopyalandı.",
          variant: "default",
        });
      });
    }
  };
  
  const onSubmitReview = async (values: z.infer<typeof reviewFormSchema>) => {
    if (!user) {
      toast({
        title: "Giriş yapmalısınız",
        description: "Yorum yapabilmek için giriş yapmalısınız.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest("POST", `/api/products/${productId}/reviews`, {
        rating: selectedRating,
        comment: values.comment,
      });
      
      // Invalidate reviews query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      
      toast({
        title: "Yorum eklendi",
        description: "Yorumunuz başarıyla eklendi.",
        variant: "default",
      });
      
      // Reset form
      form.reset();
      setSelectedRating(5);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Yorum eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoadingProduct) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <Skeleton className="aspect-square rounded-lg" />
              </div>
              
              <div className="md:w-1/2 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-10 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Ürün bulunamadı</h1>
            <p className="mb-6">Aradığınız ürün bulunamadı veya kaldırılmış olabilir.</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90">
                Ürünlere Dön
              </Button>
            </Link>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{product.name} | ErgiliBookShop</title>
        <meta name="description" content={product.description || `${product.name} - ErgiliBookShop'te uygun fiyatlarla`} />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-6">
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Ana Sayfa</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Ürünler</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/products/category/${product.categoryId}`}>
                  {product.category?.name || "Kategori"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{product.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
            
            <div className="flex flex-col md:flex-row gap-8 mb-12">
              {/* Product Image */}
              <div className="md:w-1/2">
                <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  
                  {product.discountPercentage && (
                    <div className="absolute top-4 left-4 bg-accent text-white text-sm font-bold px-2 py-1 rounded">
                      %{product.discountPercentage} İndirim
                    </div>
                  )}
                  
                  {product.isNew && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-bold px-2 py-1 rounded">
                      Yeni
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product Details */}
              <div className="md:w-1/2">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <RatingStars rating={product.avgRating || 0} />
                    <span className="ml-2 text-sm text-gray-500">
                      ({product.reviewCount || 0} değerlendirme)
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  {product.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-500">{product.price.toFixed(2)}₺</span>
                      <span className="text-2xl font-bold text-accent">{product.discountPrice.toFixed(2)}₺</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold">{product.price.toFixed(2)}₺</span>
                  )}
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700">{product.description}</p>
                </div>
                
                <div className="flex items-center mb-6">
                  <span className="mr-2">Adet:</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {addToCart.isPending ? "Ekleniyor..." : "Sepete Ekle"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleWishlist}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Favorilere Ekle
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Paylaş
                </Button>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">
                      {product.inStock ? "Stokta var" : "Stokta yok"}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <span>Kategori: </span>
                    <Link href={`/products/category/${product.categoryId}`} className="text-primary hover:underline">
                      {product.category?.name || "Kategori"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="description">Açıklama</TabsTrigger>
                <TabsTrigger value="reviews">
                  Değerlendirmeler ({product.reviewCount || 0})
                </TabsTrigger>
                <TabsTrigger value="shipping">Kargo & İade</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Ürün Açıklaması</h2>
                  <p className="text-gray-700">{product.description || "Bu ürün için detaylı açıklama bulunmamaktadır."}</p>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Özellikler</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Yüksek kaliteli malzemeler</li>
                      <li>Dayanıklı ve uzun ömürlü</li>
                      <li>Modern tasarım</li>
                      <li>Kolay kullanım</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Müşteri Değerlendirmeleri</h2>
                  
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <RatingStars rating={product.avgRating || 0} />
                      <span className="ml-2 font-semibold">
                        {product.avgRating?.toFixed(1) || "0.0"} / 5.0
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({product.reviewCount || 0} değerlendirme)
                      </span>
                    </div>
                    
                    {/* Rating Bars */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews?.filter(r => Math.round(r.rating) === star).length || 0;
                        const percentage = product.reviewCount ? (count / product.reviewCount) * 100 : 0;
                        
                        return (
                          <div key={star} className="flex items-center">
                            <span className="w-10 text-sm text-gray-600">{star} yıldız</span>
                            <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-10 text-sm text-gray-600 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Review Form */}
                  {user ? (
                    <div className="mb-8 border-t pt-6">
                      <h3 className="font-semibold mb-4">Ürünü değerlendirin</h3>
                      
                      <div className="mb-4">
                        <div className="flex items-center">
                          <span className="mr-2">Puanınız:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setSelectedRating(rating)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    rating <= selectedRating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Yorumunuz</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Bu ürün hakkındaki düşüncelerinizi paylaşın..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="bg-primary hover:bg-primary/90">
                            Değerlendirme Gönder
                          </Button>
                        </form>
                      </Form>
                    </div>
                  ) : (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                      <p className="mb-2">Değerlendirme yapmak için giriş yapmalısınız.</p>
                      <Link href="/auth">
                        <Button className="bg-primary hover:bg-primary/90">
                          Giriş Yap
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {/* Reviews List */}
                  {isLoadingReviews ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="border-b pb-4">
                          <div className="flex items-center mb-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="ml-3">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24 mt-1" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-20 mb-2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full mt-1" />
                          <Skeleton className="h-4 w-2/3 mt-1" />
                        </div>
                      ))}
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4">
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {review.user?.avatar ? (
                                <img
                                  src={review.user.avatar}
                                  alt={review.user.username}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-500 text-sm font-semibold">
                                  {review.user?.username?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">
                                {review.user?.fullName || review.user?.username || "Anonim"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString("tr-TR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <RatingStars rating={review.rating} />
                          </div>
                          
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Bu ürün için henüz değerlendirme bulunmamaktadır.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="shipping" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Kargo ve İade Bilgileri</h2>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Kargo Bilgileri</h3>
                    <p className="mb-2">
                      Siparişiniz, ödemenin onaylanmasından sonra en geç 2 iş günü içerisinde kargoya verilir.
                    </p>
                    <p className="mb-2">
                      1000₺ ve üzeri alışverişlerinizde kargo ücretsizdir.
                    </p>
                    <p>
                      Teslimat süresi, bulunduğunuz bölgeye göre 1-3 iş günü arasında değişiklik gösterebilir.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">İade ve Değişim</h3>
                    <p className="mb-2">
                      Ürünü teslim aldığınız tarihten itibaren 14 gün içerisinde iade edebilirsiniz.
                    </p>
                    <p className="mb-2">
                      İade etmek istediğiniz ürün kullanılmamış, yıpranmamış ve orijinal ambalajında olmalıdır.
                    </p>
                    <p>
                      İade ve değişim süreçleri hakkında daha fazla bilgi için 
                      <Link href="/returns" className="text-primary hover:underline ml-1">
                        İade Politikamız
                      </Link>
                      'ı inceleyebilirsiniz.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
