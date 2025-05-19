import { useState } from "react";
import { Link } from "wouter";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";

export default function CartPage() {
  const { cart, isLoading, removeCartItem, updateCartItem, clearCart } = useCart();
  const { user } = useAuth();
  const [isClearing, setIsClearing] = useState(false);

  // Calculate totals
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 0 && subtotal < 1000 ? 49.99 : 0;
  const total = subtotal + shipping;

  const handleClearCart = () => {
    setIsClearing(true);
    clearCart.mutate(undefined, {
      onSettled: () => {
        setIsClearing(false);
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>Alışveriş Sepeti | ErgiliBookShop</title>
        <meta name="description" content="ErgiliBookShop - Alışveriş sepetinizi görüntüleyin ve siparişinizi tamamlayın." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-6">Alışveriş Sepeti</h1>
            
            {!user ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2">Sepetinizi görüntülemek için giriş yapın</h2>
                <p className="text-gray-600 mb-6">
                  Sepetinizi görüntülemek ve alışverişinizi tamamlamak için lütfen giriş yapın.
                </p>
                <Link href="/auth">
                  <Button className="bg-primary hover:bg-primary/90">
                    Giriş Yap
                  </Button>
                </Link>
              </div>
            ) : isLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b">
                      <Skeleton className="h-6 w-48" />
                    </div>
                    
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="p-4 border-b flex flex-col sm:flex-row items-center gap-4">
                        <Skeleton className="w-24 h-24 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-4" />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full mt-4" />
                  </div>
                </div>
              </div>
            ) : cart?.items && cart.items.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h2 className="font-semibold">Sepetinizdeki Ürünler ({cart.items.length})</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-500"
                        onClick={handleClearCart}
                        disabled={isClearing}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sepeti Temizle
                      </Button>
                    </div>
                    
                    {cart.items.map((item) => (
                      <div key={item.id} className="p-4 border-b flex flex-col sm:flex-row items-center gap-4">
                        <Link href={`/products/${item.product.id}`}>
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded"
                          />
                        </Link>
                        
                        <div className="flex-1">
                          <Link href={`/products/${item.product.id}`}>
                            <h3 className="font-medium hover:text-primary">{item.product.name}</h3>
                          </Link>
                          
                          <div className="flex flex-wrap justify-between items-center mt-3">
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateCartItem.mutate({
                                      id: item.id,
                                      quantity: item.quantity - 1,
                                    });
                                  }
                                }}
                                disabled={updateCartItem.isPending}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-3">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => {
                                  updateCartItem.mutate({
                                    id: item.id,
                                    quantity: item.quantity + 1,
                                  });
                                }}
                                disabled={updateCartItem.isPending}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center mt-2 sm:mt-0">
                              <div className="font-semibold mr-3">
                                {((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}₺
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => removeCartItem.mutate(item.id)}
                                disabled={removeCartItem.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
                    <h2 className="font-semibold mb-4">Sipariş Özeti</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ara Toplam</span>
                        <span>{subtotal.toFixed(2)}₺</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kargo</span>
                        <span>{shipping > 0 ? `${shipping.toFixed(2)}₺` : "Ücretsiz"}</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Toplam</span>
                          <span>{total.toFixed(2)}₺</span>
                        </div>
                        {shipping === 0 && subtotal > 0 && (
                          <p className="text-green-600 text-sm mt-1">
                            Kargo bedava!
                          </p>
                        )}
                        {shipping > 0 && (
                          <p className="text-gray-500 text-sm mt-1">
                            1000₺ ve üzeri alışverişlerde kargo bedava
                          </p>
                        )}
                      </div>
                    </div>
                    <Link href="/checkout">
                      <Button className="w-full mt-4 bg-accent hover:bg-accent/90">
                        Siparişi Tamamla
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" className="w-full mt-2">
                        Alışverişe Devam Et
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">Sepetiniz Boş</h2>
                <p className="text-gray-600 mb-6">
                  Sepetinizde henüz ürün bulunmamaktadır. Alışverişe başlamak için ürünleri keşfedin.
                </p>
                <Link href="/products">
                  <Button className="bg-primary hover:bg-primary/90">
                    Alışverişe Başla
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
