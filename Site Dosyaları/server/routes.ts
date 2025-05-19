import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertReviewSchema, 
  insertCartItemSchema, 
  insertOrderSchema, 
  insertOrderItemSchema,
  insertProductSchema,
  insertCategorySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Kategoriler yüklenirken bir hata oluştu" });
    }
  });
  
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz kategori ID" });
      }
      
      const category = await storage.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Kategori bulunamadı" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Kategori yüklenirken bir hata oluştu" });
    }
  });
  
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const search = req.query.search as string | undefined;
      
      let products;
      
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId);
      } else if (search) {
        products = await storage.searchProducts(search);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Ürünler yüklenirken bir hata oluştu" });
    }
  });
  
  app.get("/api/products/featured", async (_req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Öne çıkan ürünler yüklenirken bir hata oluştu" });
    }
  });
  
  app.get("/api/products/bestselling", async (_req, res) => {
    try {
      const products = await storage.getBestsellingProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Çok satan ürünler yüklenirken bir hata oluştu" });
    }
  });
  
  app.get("/api/products/new", async (_req, res) => {
    try {
      const products = await storage.getNewProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Yeni ürünler yüklenirken bir hata oluştu" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz ürün ID" });
      }
      
      const product = await storage.getProductWithDetails(id);
      if (!product) {
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Ürün yüklenirken bir hata oluştu" });
    }
  });
  
  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Geçersiz ürün ID" });
      }
      
      const reviews = await storage.getReviewsByProduct(productId);
      
      // Retrieve user information for each review
      const reviewsWithUser = await Promise.all(reviews.map(async (review) => {
        const user = await storage.getUser(review.userId);
        return {
          ...review,
          user: user ? {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar
          } : undefined
        };
      }));
      
      res.json(reviewsWithUser);
    } catch (error) {
      res.status(500).json({ message: "Yorumlar yüklenirken bir hata oluştu" });
    }
  });
  
  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Geçersiz ürün ID" });
      }
      
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }
      
      // Validate review data
      const validatedData = insertReviewSchema.safeParse({
        ...req.body,
        productId,
        userId: req.user.id
      });
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Geçersiz yorum verisi", errors: validatedData.error.format() });
      }
      
      const review = await storage.createReview(validatedData.data);
      
      // Add user information to response
      const user = await storage.getUser(review.userId);
      const reviewWithUser = {
        ...review,
        user: user ? {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar
        } : undefined
      };
      
      res.status(201).json(reviewWithUser);
    } catch (error) {
      res.status(500).json({ message: "Yorum eklenirken bir hata oluştu" });
    }
  });
  
  // Cart endpoints
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      // Get user's cart or create one if it doesn't exist
      let cart = await storage.getCartByUserId(req.user.id);
      
      if (!cart) {
        cart = await storage.createCart({ userId: req.user.id });
      }
      
      // Get cart with items
      const cartWithItems = await storage.getCartWithItems(cart.id);
      
      res.json(cartWithItems);
    } catch (error) {
      res.status(500).json({ message: "Sepet yüklenirken bir hata oluştu" });
    }
  });
  
  app.post("/api/cart/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      // Get user's cart or create one if it doesn't exist
      let cart = await storage.getCartByUserId(req.user.id);
      
      if (!cart) {
        cart = await storage.createCart({ userId: req.user.id });
      }
      
      // Validate cart item data
      const validatedData = insertCartItemSchema.safeParse({
        ...req.body,
        cartId: cart.id
      });
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Geçersiz sepet öğesi verisi", errors: validatedData.error.format() });
      }
      
      // Check if product exists
      const product = await storage.getProductById(validatedData.data.productId);
      if (!product) {
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }
      
      // Add item to cart
      await storage.addItemToCart(validatedData.data);
      
      // Get updated cart
      const updatedCart = await storage.getCartWithItems(cart.id);
      
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: "Ürün sepete eklenirken bir hata oluştu" });
    }
  });
  
  app.put("/api/cart/items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz sepet öğesi ID" });
      }
      
      const { quantity } = req.body;
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: "Geçersiz miktar" });
      }
      
      // Get user's cart
      const cart = await storage.getCartByUserId(req.user.id);
      if (!cart) {
        return res.status(404).json({ message: "Sepet bulunamadı" });
      }
      
      // Update cart item quantity
      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Sepet öğesi bulunamadı" });
      }
      
      // Get updated cart
      const updatedCart = await storage.getCartWithItems(cart.id);
      
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: "Sepet güncellenirken bir hata oluştu" });
    }
  });
  
  app.delete("/api/cart/items/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz sepet öğesi ID" });
      }
      
      // Get user's cart
      const cart = await storage.getCartByUserId(req.user.id);
      if (!cart) {
        return res.status(404).json({ message: "Sepet bulunamadı" });
      }
      
      // Remove cart item
      const removed = await storage.removeCartItem(id);
      if (!removed) {
        return res.status(404).json({ message: "Sepet öğesi bulunamadı" });
      }
      
      // Get updated cart
      const updatedCart = await storage.getCartWithItems(cart.id);
      
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: "Ürün sepetten silinirken bir hata oluştu" });
    }
  });
  
  app.delete("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      // Get user's cart
      const cart = await storage.getCartByUserId(req.user.id);
      if (!cart) {
        return res.status(404).json({ message: "Sepet bulunamadı" });
      }
      
      // Clear cart
      await storage.clearCart(cart.id);
      
      // Get updated empty cart
      const updatedCart = await storage.getCartWithItems(cart.id);
      
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: "Sepet temizlenirken bir hata oluştu" });
    }
  });
  
  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      // Get user's cart
      const cart = await storage.getCartByUserId(req.user.id);
      if (!cart) {
        return res.status(404).json({ message: "Sepet bulunamadı" });
      }
      
      const cartWithItems = await storage.getCartWithItems(cart.id);
      if (!cartWithItems || cartWithItems.items.length === 0) {
        return res.status(400).json({ message: "Sepetiniz boş" });
      }
      
      // Validate order data
      const orderSchema = insertOrderSchema.extend({
        address: z.string().min(5, "Adres en az 5 karakter olmalıdır"),
        phone: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
      });
      
      const validatedData = orderSchema.safeParse({
        ...req.body,
        userId: req.user.id,
        total: cartWithItems.totalPrice
      });
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Geçersiz sipariş verisi", errors: validatedData.error.format() });
      }
      
      // Create order
      const order = await storage.createOrder(validatedData.data);
      
      // Add order items
      for (const item of cartWithItems.items) {
        const price = item.product.discountPrice || item.product.price;
        await storage.addOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price
        });
      }
      
      // Clear the cart after order is created
      await storage.clearCart(cart.id);
      
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Sipariş oluşturulurken bir hata oluştu" });
    }
  });
  
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      const orders = await storage.getOrdersByUser(req.user.id);
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Siparişler yüklenirken bir hata oluştu" });
    }
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz sipariş ID" });
      }
      
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Sipariş bulunamadı" });
      }
      
      // Check if order belongs to user
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Bu siparişe erişim izniniz yok" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItemsByOrder(id);
      
      // Get product details for each order item
      const itemsWithProducts = await Promise.all(orderItems.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      res.status(500).json({ message: "Sipariş detayları yüklenirken bir hata oluştu" });
    }
  });
  
  // Admin - Ürün Yönetimi
  app.post("/api/products", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      // Admin kontrolü
      if (req.user.username !== "admin") {
        return res.status(403).json({ message: "Bu işlem için admin yetkisine sahip olmalısınız" });
      }
      
      // Validate product data
      const validatedData = insertProductSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Geçersiz kitap verisi", errors: validatedData.error.format() });
      }
      
      // Create product
      const product = await storage.createProduct(validatedData.data);
      
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Kitap eklenirken bir hata oluştu" });
    }
  });
  
  app.put("/api/products/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      // Admin kontrolü
      if (req.user.username !== "admin") {
        return res.status(403).json({ message: "Bu işlem için admin yetkisine sahip olmalısınız" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz kitap ID" });
      }
      
      // Check if product exists
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Kitap bulunamadı" });
      }
      
      // Validate product data
      const validatedData = insertProductSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Geçersiz kitap verisi", errors: validatedData.error.format() });
      }
      
      // Update product
      const updatedProduct = await storage.updateProduct(id, validatedData.data);
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Kitap güncellenirken bir hata oluştu" });
    }
  });
  
  app.delete("/api/products/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      // Admin kontrolü
      if (req.user.username !== "admin") {
        return res.status(403).json({ message: "Bu işlem için admin yetkisine sahip olmalısınız" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz kitap ID" });
      }
      
      // Check if product exists
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Kitap bulunamadı" });
      }
      
      // Delete product
      // In a real application, we would need to implement a delete method in the storage
      // For now, we can simulate this by updating the product status (e.g. set isActive to false)
      // or by removing it from related collections (e.g. featured products)
      const updatedProduct = await storage.updateProduct(id, { 
        ...product,
        inStock: false
      });
      
      res.json({ success: true, message: "Kitap başarıyla silindi" });
    } catch (error) {
      res.status(500).json({ message: "Kitap silinirken bir hata oluştu" });
    }
  });
  
  // Admin - Kategori Yönetimi
  app.post("/api/categories", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      // Admin kontrolü
      if (req.user.username !== "admin") {
        return res.status(403).json({ message: "Bu işlem için admin yetkisine sahip olmalısınız" });
      }
      
      // Validate category data
      const validatedData = insertCategorySchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Geçersiz kategori verisi", errors: validatedData.error.format() });
      }
      
      // Create category
      const category = await storage.createCategory(validatedData.data);
      
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Kategori eklenirken bir hata oluştu" });
    }
  });

  // User Profile Update
  app.put("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Bu işlem için giriş yapmalısınız" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Geçersiz kullanıcı ID" });
      }
      
      // Users can only update their own profile, or admin can update any profile
      if (id !== req.user.id && req.user.username !== "admin") {
        return res.status(403).json({ message: "Başka bir kullanıcının profilini düzenleme yetkiniz yok" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(id, {
        fullName: req.body.fullName,
        phone: req.body.phone,
        address: req.body.address,
        avatar: req.body.avatar
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Kullanıcı güncellenirken bir hata oluştu" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
