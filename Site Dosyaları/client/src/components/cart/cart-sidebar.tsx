import { X, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

type CartSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, isLoading, removeCartItem, updateCartItem } = useCart();
  const { user } = useAuth();

  // Calculate totals
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 0 && subtotal < 1000 ? 49.99 : 0;
  const total = subtotal + shipping;

  return (
    <div
      className={`fixed top-0 right-0 w-full md:w-96 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">
            Alışveriş Sepeti ({cart?.items?.length || 0})
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!user ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Sepetinizi görüntülemek için giriş yapmalısınız.
              </p>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  onClose();
                  // Navigate to auth page
                  window.location.href = "/auth";
                }}
              >
                Giriş Yap
              </Button>
            </div>
          ) : isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center border-b pb-4 mb-4">
                <Skeleton className="w-20 h-20 rounded" />
                <div className="ml-4 flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : cart?.items && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center border-b pb-4 mb-4"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <div className="flex items-center mt-1">
                    <button
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateCartItem.mutate({
                            id: item.id,
                            quantity: item.quantity - 1,
                          });
                        }
                      }}
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity} adet</span>
                    <button
                      className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
                      onClick={() => {
                        updateCartItem.mutate({
                          id: item.id,
                          quantity: item.quantity + 1,
                        });
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="font-semibold">
                      {((item.product.discountPrice || item.product.price) *
                        item.quantity).toFixed(2)}
                      ₺
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => removeCartItem.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Sepetinizde ürün bulunmamaktadır.</p>
            </div>
          )}
        </div>

        {user && cart?.items && cart.items.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between mb-4">
              <span>Ara Toplam:</span>
              <span className="font-semibold">{subtotal.toFixed(2)}₺</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Kargo:</span>
              <span className="font-semibold">
                {shipping > 0 ? `${shipping.toFixed(2)}₺` : "Ücretsiz"}
              </span>
            </div>
            <div className="flex justify-between mb-4 text-lg">
              <span className="font-bold">Toplam:</span>
              <span className="font-bold">{total.toFixed(2)}₺</span>
            </div>
            <Link
              href="/checkout"
              className="block bg-accent hover:bg-accent/90 text-white py-3 px-4 rounded-lg font-medium text-center transition duration-300 mb-2"
              onClick={onClose}
            >
              Siparişi Tamamla
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Alışverişe Devam Et
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
