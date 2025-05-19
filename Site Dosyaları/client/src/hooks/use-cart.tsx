import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { CartWithItems } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./use-auth";

type CartContextType = {
  cart: CartWithItems | null;
  isLoading: boolean;
  error: Error | null;
  addToCart: UseMutationResult<CartWithItems, Error, AddToCartData>;
  updateCartItem: UseMutationResult<CartWithItems, Error, UpdateCartItemData>;
  removeCartItem: UseMutationResult<CartWithItems, Error, number>;
  clearCart: UseMutationResult<CartWithItems, Error, void>;
  getItemCount: () => number;
};

type AddToCartData = {
  productId: number;
  quantity: number;
};

type UpdateCartItemData = {
  id: number;
  quantity: number;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    data: cart,
    error,
    isLoading,
  } = useQuery<CartWithItems>({
    queryKey: ["/api/cart"],
    enabled: !!user, // Only fetch cart if user is logged in
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const addToCart = useMutation({
    mutationFn: async (data: AddToCartData) => {
      const res = await apiRequest("POST", "/api/cart/items", data);
      return await res.json();
    },
    onSuccess: (updatedCart: CartWithItems) => {
      queryClient.setQueryData(["/api/cart"], updatedCart);
      toast({
        title: "Ürün sepete eklendi",
        description: "Ürün başarıyla sepetinize eklendi.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ürün eklenemedi",
        description: error.message || "Ürün sepete eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  const updateCartItem = useMutation({
    mutationFn: async ({ id, quantity }: UpdateCartItemData) => {
      const res = await apiRequest("PUT", `/api/cart/items/${id}`, { quantity });
      return await res.json();
    },
    onSuccess: (updatedCart: CartWithItems) => {
      queryClient.setQueryData(["/api/cart"], updatedCart);
    },
    onError: (error: Error) => {
      toast({
        title: "Sepet güncellenemedi",
        description: error.message || "Sepet güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  const removeCartItem = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/cart/items/${id}`);
      return await res.json();
    },
    onSuccess: (updatedCart: CartWithItems) => {
      queryClient.setQueryData(["/api/cart"], updatedCart);
      toast({
        title: "Ürün sepetten kaldırıldı",
        description: "Ürün başarıyla sepetinizden kaldırıldı.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ürün kaldırılamadı",
        description: error.message || "Ürün sepetten kaldırılırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  const clearCart = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/cart");
      return await res.json();
    },
    onSuccess: (updatedCart: CartWithItems) => {
      queryClient.setQueryData(["/api/cart"], updatedCart);
      toast({
        title: "Sepet temizlendi",
        description: "Sepetiniz başarıyla temizlendi.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sepet temizlenemedi",
        description: error.message || "Sepet temizlenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });
  
  const getItemCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };
  
  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
