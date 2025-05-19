import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Product, InsertProduct, 
  Review, InsertReview, 
  Cart, InsertCart, 
  CartItem, InsertCartItem, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem,
  ProductWithDetails,
  CartWithItems
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getBestsellingProducts(): Promise<Product[]>;
  getNewProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  getProductWithDetails(id: number): Promise<ProductWithDetails | undefined>;
  
  // Review methods
  getReviewsByProduct(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getProductAverageRating(productId: number): Promise<number>;
  
  // Cart methods
  getCartByUserId(userId: number): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  getCartWithItems(cartId: number): Promise<CartWithItems | undefined>;
  addItemToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(cartId: number): Promise<boolean>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderItemsByOrder(orderId: number): Promise<OrderItem[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private reviews: Map<number, Review>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  // Auto-increment IDs
  private userId = 1;
  private categoryId = 1;
  private productId = 1;
  private reviewId = 1;
  private cartId = 1;
  private cartItemId = 1;
  private orderId = 1;
  private orderItemId = 1;
  
  // Session store
  sessionStore: session.SessionStore;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.reviews = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Create sample categories
    const categories = [
      { name: "Roman", icon: "fas fa-book", productCount: 0 },
      { name: "Bilim Kurgu", icon: "fas fa-rocket", productCount: 0 },
      { name: "Tarih", icon: "fas fa-landmark", productCount: 0 },
      { name: "Çocuk Kitapları", icon: "fas fa-child", productCount: 0 },
      { name: "Kişisel Gelişim", icon: "fas fa-brain", productCount: 0 },
      { name: "Akademik", icon: "fas fa-graduation-cap", productCount: 0 }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
    
    // Create sample products
    const products = [
      {
        name: "Suç ve Ceza",
        description: "Fyodor Dostoyevski'nin en ünlü eserlerinden. Sıradan bir öğrenci olan Raskolnikov'un düşüncelerini ve eylemlerini konu alır.",
        price: 89,
        discountPrice: 75,
        categoryId: 1,
        imageUrl: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
        inStock: true,
        isFeatured: true,
        isBestseller: true,
        isNew: false,
        discountPercentage: 15
      },
      {
        name: "Dune",
        description: "Frank Herbert'in kaleme aldığı bilim kurgu klasiği, uzak bir gelecekte geçen epik bir macera.",
        price: 129,
        discountPrice: null,
        categoryId: 2,
        imageUrl: "https://images.pexels.com/photos/2067569/pexels-photo-2067569.jpeg",
        inStock: true,
        isFeatured: true,
        isBestseller: false,
        isNew: true,
        discountPercentage: null
      },
      {
        name: "Kişisel Gelişim ve Motivasyon",
        description: "Hayatınızı değiştirecek en etkili kişisel gelişim teknikleri ve motivasyon stratejileri.",
        price: 75,
        discountPrice: null,
        categoryId: 5,
        imageUrl: "https://images.pexels.com/photos/904616/pexels-photo-904616.jpeg",
        inStock: true,
        isFeatured: true,
        isBestseller: false,
        isNew: false,
        discountPercentage: null
      },
      {
        name: "Osmanlı İmparatorluğu Tarihi",
        description: "Detaylı anlatımlarla Osmanlı İmparatorluğu'nun kuruluşundan yıkılışına kadar olan tarihsel süreci.",
        price: 145,
        discountPrice: 120,
        categoryId: 3,
        imageUrl: "https://images.pexels.com/photos/3747279/pexels-photo-3747279.jpeg",
        inStock: true,
        isFeatured: true,
        isBestseller: false,
        isNew: false,
        discountPercentage: 15
      },
      {
        name: "1984",
        description: "George Orwell'in distopik klasiği, totaliter bir rejim altında yaşayan Winston Smith'in hikayesi.",
        price: 65,
        discountPrice: null,
        categoryId: 1,
        imageUrl: "https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg",
        inStock: true,
        isFeatured: false,
        isBestseller: true,
        isNew: false,
        discountPercentage: null
      },
      {
        name: "Çocuk Masalları Antolojisi",
        description: "Tüm zamanların en sevilen çocuk masallarını içeren renkli resimli kitap.",
        price: 95,
        discountPrice: 75,
        categoryId: 4,
        imageUrl: "https://images.pexels.com/photos/264635/pexels-photo-264635.jpeg",
        inStock: true,
        isFeatured: false,
        isBestseller: true,
        isNew: false,
        discountPercentage: 20
      },
      {
        name: "Python ile Veri Analizi",
        description: "Python programlama dili kullanarak veri analizi ve makine öğrenmesi uygulamaları.",
        price: 175,
        discountPrice: null,
        categoryId: 6,
        imageUrl: "https://images.pexels.com/photos/2170/creative-desk-pens-school.jpg",
        inStock: true,
        isFeatured: false,
        isBestseller: false,
        isNew: true,
        discountPercentage: null
      },
      {
        name: "Hayvan Çiftliği",
        description: "George Orwell'in alegorik romanı, bir çiftlikte yaşanan devrim ve sonrasını anlatır.",
        price: 55,
        discountPrice: 45,
        categoryId: 1,
        imageUrl: "https://images.pexels.com/photos/2099691/pexels-photo-2099691.jpeg",
        inStock: true,
        isFeatured: false,
        isBestseller: true,
        isNew: false,
        discountPercentage: 15
      }
    ];
    
    products.forEach(product => {
      this.createProduct(product);
    });
    
    // Update category product counts
    this.updateCategoryProductCounts();
    
    // Create sample reviews
    const reviews = [
      { productId: 1, userId: 1, rating: 5, comment: "Harika bir roman, Dostoyevski'nin dehasını gösteren bir başyapıt." },
      { productId: 1, userId: 2, rating: 4, comment: "Etkileyici bir hikaye ama biraz ağır bir dil kullanılmış." },
      { productId: 2, userId: 1, rating: 4, comment: "Bilim kurgu türünün başyapıtlarından, kesinlikle okunmalı." },
      { productId: 2, userId: 3, rating: 5, comment: "Muazzam bir hayal gücü ve etkileyici bir dünya yaratımı." },
      { productId: 3, userId: 2, rating: 3, comment: "Bazı teknikleri faydalı ama daha fazla örnek olabilirdi." },
      { productId: 4, userId: 3, rating: 5, comment: "Osmanlı tarihi hakkında çok detaylı bir çalışma, çok beğendim." },
      { productId: 5, userId: 1, rating: 5, comment: "Bugün bile geçerliliğini koruyan, insanı düşündüren bir başyapıt." },
      { productId: 6, userId: 2, rating: 4, comment: "Çocuğum çok sevdi, harika resimler ve eğlenceli hikayeler." },
      { productId: 7, userId: 3, rating: 4, comment: "Python öğrenmek için ideal, örnekler çok açıklayıcı." },
      { productId: 8, userId: 1, rating: 4, comment: "Kısa ama etkili bir kitap, mesajı çok net." }
    ];
    
    // Create demo users
    const users = [
      { username: "ayse_yilmaz", email: "ayse@example.com", password: "password123", fullName: "Ayşe Yılmaz", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
      { username: "mehmet_kaya", email: "mehmet@example.com", password: "password123", fullName: "Mehmet Kaya", avatar: "https://randomuser.me/api/portraits/men/22.jpg" },
      { username: "zeynep_demir", email: "zeynep@example.com", password: "password123", fullName: "Zeynep Demir", avatar: "https://randomuser.me/api/portraits/women/32.jpg" },
      { username: "admin", email: "admin@ergilishop.com", password: "admin123", fullName: "Site Yöneticisi", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
    ];
    
    users.forEach(user => {
      this.createUser(user);
    });
    
    reviews.forEach(review => {
      this.createReview(review);
    });
  }
  
  private updateCategoryProductCounts() {
    const categoryCounts = new Map<number, number>();
    
    // Count products per category
    for (const product of this.products.values()) {
      const categoryId = product.categoryId;
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
    }
    
    // Update category counts
    for (const [categoryId, count] of categoryCounts.entries()) {
      const category = this.categories.get(categoryId);
      if (category) {
        category.productCount = count;
        this.categories.set(categoryId, category);
      }
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === categoryId);
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isFeatured);
  }
  
  async getBestsellingProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isBestseller);
  }
  
  async getNewProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isNew);
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const searchQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(searchQuery) || 
      (product.description && product.description.toLowerCase().includes(searchQuery))
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id, createdAt: new Date() };
    this.products.set(id, newProduct);
    
    // Update category product counts
    this.updateCategoryProductCounts();
    
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    
    // Update category product counts if category changed
    if (productData.categoryId && productData.categoryId !== product.categoryId) {
      this.updateCategoryProductCounts();
    }
    
    return updatedProduct;
  }
  
  async getProductWithDetails(id: number): Promise<ProductWithDetails | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const category = this.categories.get(product.categoryId);
    if (!category) return undefined;
    
    const reviews = await this.getReviewsByProduct(id);
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
      : 0;
    
    return {
      ...product,
      category,
      avgRating,
      reviewCount: reviews.length
    };
  }
  
  // Review methods
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.productId === productId);
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview: Review = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, newReview);
    return newReview;
  }
  
  async getProductAverageRating(productId: number): Promise<number> {
    const reviews = await this.getReviewsByProduct(productId);
    if (reviews.length === 0) return 0;
    
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }
  
  // Cart methods
  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(cart => cart.userId === userId);
  }
  
  async createCart(cart: InsertCart): Promise<Cart> {
    const id = this.cartId++;
    const newCart: Cart = { ...cart, id, createdAt: new Date() };
    this.carts.set(id, newCart);
    return newCart;
  }
  
  async getCartWithItems(cartId: number): Promise<CartWithItems | undefined> {
    const cart = this.carts.get(cartId);
    if (!cart) return undefined;
    
    const cartItems = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId)
      .map(item => {
        const product = this.products.get(item.productId);
        return {
          ...item,
          product: product!
        };
      });
    
    const totalPrice = cartItems.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
    
    return {
      ...cart,
      items: cartItems,
      totalPrice
    };
  }
  
  async addItemToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.cartId === cartItem.cartId && item.productId === cartItem.productId
    );
    
    if (existingItem) {
      // Update quantity instead of adding new item
      const updatedItem = { 
        ...existingItem, 
        quantity: existingItem.quantity + cartItem.quantity 
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    
    const id = this.cartItemId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(cartId: number): Promise<boolean> {
    const itemIds = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId)
      .map(item => item.id);
    
    itemIds.forEach(id => this.cartItems.delete(id));
    return true;
  }
  
  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { ...order, id, createdAt: new Date() };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }
}

export const storage = new MemStorage();
