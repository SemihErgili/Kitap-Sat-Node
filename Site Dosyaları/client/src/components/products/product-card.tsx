import { Link } from "wouter";
import { Star, StarHalf, Heart } from "lucide-react";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Giriş yapmalısınız",
        description: "Ürünü sepete eklemek için giriş yapmalısınız.",
        variant: "destructive",
      });
      return;
    }
    
    addToCart.mutate({
      productId: product.id,
      quantity: 1,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Favorilere eklendi",
      description: `${product.name} favorilerinize eklendi.`,
      variant: "default",
    });
  };

  // Mock rating data (in a real app, this would come from the backend)
  const rating = product.id % 5 === 0 ? 5 : product.id % 5;
  const reviewCount = 30 + (product.id * 17) % 200;

  // Helper function to render rating stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex text-yellow-400">
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-current" />}
        {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map(
          (_, index) => (
            <Star key={`empty-${index}`} className="h-4 w-4 text-gray-300" />
          )
        )}
      </div>
    );
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="product-card">
        <div className="product-image-container">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.discountPercentage && (
            <div className="product-badge badge-discount">
              %{product.discountPercentage} İndirim
            </div>
          )}
          {product.isNew && (
            <div className="product-badge badge-new">Yeni</div>
          )}
          {product.isBestseller && (
            <div className="product-badge badge-bestseller">Çok Satan</div>
          )}
          <button 
            className="wishlist-button"
            onClick={handleWishlist}
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">
            {/* Category name would come from backend in a real app */}
            {product.categoryId === 1 ? "Elektronik" : 
             product.categoryId === 2 ? "Giyim" : 
             product.categoryId === 3 ? "Ev & Yaşam" : 
             product.categoryId === 4 ? "Oyun & Hobi" : 
             product.categoryId === 5 ? "Aksesuar" : "Diğer"}
          </p>
          <div className="flex items-center mb-2">
            {renderStars(rating)}
            <span className="text-gray-500 text-xs ml-1">({reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              {product.discountPrice ? (
                <>
                  <span className="line-through text-gray-400 text-sm">
                    {product.price}₺
                  </span>{" "}
                  <span className="font-semibold text-lg">
                    {product.discountPrice}₺
                  </span>
                </>
              ) : (
                <span className="font-semibold text-lg">{product.price}₺</span>
              )}
            </div>
            <Button
              variant="primary"
              className="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
            >
              {addToCart.isPending ? "Ekleniyor..." : "Sepete Ekle"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
