import { 
  users, type User, type InsertUser,
  shops, type Shop, type InsertShop,
  products, type Product, type InsertProduct,
  reviews, type Review, type InsertReview,
  wishlistItems, type WishlistItem, type InsertWishlistItem,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  messages, type Message, type InsertMessage
} from "@shared/schema";
import session from "express-session";

import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Shop operations
  getShop(id: number): Promise<Shop | undefined>;
  getShopByUserId(userId: number): Promise<Shop | undefined>;
  getShops(): Promise<Shop[]>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: number, shopData: Partial<InsertShop>): Promise<Shop | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(filter?: {
    category?: string;
    shopId?: number;
    search?: string;
  }): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Review operations
  getReviewsByProduct(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Wishlist operations
  getWishlistByUser(userId: number): Promise<WishlistItem[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: number, productId: number): Promise<boolean>;
  
  // Cart operations
  getCartByUser(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(userId: number, productId: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(userId: number, productId: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByShop(shopId: number): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Message operations
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  getUserConversations(userId: number): Promise<{
    userId: number;
    username: string;
    lastMessage: Message;
  }[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(senderId: number, receiverId: number): Promise<boolean>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private shops: Map<number, Shop>;
  private products: Map<number, Product>;
  private reviews: Map<number, Review>;
  private wishlistItems: Map<number, WishlistItem>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private messages: Map<number, Message>;
  private currentIds: {
    user: number;
    shop: number;
    product: number;
    review: number;
    wishlistItem: number;
    cartItem: number;
    order: number;
    orderItem: number;
    message: number;
  };
  
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.shops = new Map();
    this.products = new Map();
    this.reviews = new Map();
    this.wishlistItems = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.messages = new Map();
    
    this.currentIds = {
      user: 1,
      shop: 1,
      product: 1,
      review: 1,
      wishlistItem: 1,
      cartItem: 1,
      order: 1,
      orderItem: 1,
      message: 1
    };

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Shop operations
  async getShop(id: number): Promise<Shop | undefined> {
    return this.shops.get(id);
  }

  async getShopByUserId(userId: number): Promise<Shop | undefined> {
    return Array.from(this.shops.values()).find(
      (shop) => shop.userId === userId
    );
  }

  async getShops(): Promise<Shop[]> {
    return Array.from(this.shops.values());
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const id = this.currentIds.shop++;
    const now = new Date();
    const shop: Shop = { ...insertShop, id, createdAt: now };
    this.shops.set(id, shop);
    return shop;
  }

  async updateShop(id: number, shopData: Partial<InsertShop>): Promise<Shop | undefined> {
    const shop = this.shops.get(id);
    if (!shop) return undefined;
    
    const updatedShop = { ...shop, ...shopData };
    this.shops.set(id, updatedShop);
    return updatedShop;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(filter?: {
    category?: string;
    shopId?: number;
    search?: string;
  }): Promise<Product[]> {
    let filteredProducts = Array.from(this.products.values());
    
    if (filter) {
      if (filter.category) {
        filteredProducts = filteredProducts.filter(
          (product) => product.category === filter.category
        );
      }
      
      if (filter.shopId) {
        filteredProducts = filteredProducts.filter(
          (product) => product.shopId === filter.shopId
        );
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (product) => 
            product.title.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
        );
      }
    }
    
    return filteredProducts;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentIds.product++;
    const now = new Date();
    const product: Product = { ...insertProduct, id, createdAt: now };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Review operations
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentIds.review++;
    const now = new Date();
    const review: Review = { ...insertReview, id, createdAt: now };
    this.reviews.set(id, review);
    return review;
  }

  // Wishlist operations
  async getWishlistByUser(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addToWishlist(insertWishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    // Check if already exists
    const existing = Array.from(this.wishlistItems.values()).find(
      (item) => item.userId === insertWishlistItem.userId && item.productId === insertWishlistItem.productId
    );
    
    if (existing) return existing;
    
    const id = this.currentIds.wishlistItem++;
    const now = new Date();
    const wishlistItem: WishlistItem = { ...insertWishlistItem, id, createdAt: now };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<boolean> {
    const itemToRemove = Array.from(this.wishlistItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
    
    if (!itemToRemove) return false;
    return this.wishlistItems.delete(itemToRemove.id);
  }

  // Cart operations
  async getCartByUser(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if already exists
    const existing = Array.from(this.cartItems.values()).find(
      (item) => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );
    
    if (existing) {
      // Update quantity instead
      const updatedItem = { 
        ...existing, 
        quantity: existing.quantity + (insertCartItem.quantity || 1) 
      };
      this.cartItems.set(existing.id, updatedItem);
      return updatedItem;
    }
    
    const id = this.currentIds.cartItem++;
    const now = new Date();
    const cartItem: CartItem = { 
      ...insertCartItem, 
      id, 
      createdAt: now, 
      quantity: insertCartItem.quantity || 1 
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(userId: number, productId: number, quantity: number): Promise<CartItem | undefined> {
    const item = Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
    
    if (!item) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(item.id);
      return undefined;
    }
    
    const updatedItem = { ...item, quantity };
    this.cartItems.set(item.id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(userId: number, productId: number): Promise<boolean> {
    const itemToRemove = Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId
    );
    
    if (!itemToRemove) return false;
    return this.cartItems.delete(itemToRemove.id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const itemsToRemove = Array.from(this.cartItems.values())
      .filter((item) => item.userId === userId)
      .map((item) => item.id);
    
    itemsToRemove.forEach((id) => this.cartItems.delete(id));
    return true;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async getOrdersByShop(shopId: number): Promise<Order[]> {
    // Get all products from this shop
    const shopProducts = Array.from(this.products.values())
      .filter((product) => product.shopId === shopId)
      .map((product) => product.id);
    
    // Get all order items containing these products
    const relevantOrderItems = Array.from(this.orderItems.values())
      .filter((item) => shopProducts.includes(item.productId));
    
    // Get unique order IDs
    const orderIds = [...new Set(relevantOrderItems.map((item) => item.orderId))];
    
    // Return these orders
    return Array.from(this.orders.values())
      .filter((order) => orderIds.includes(order.id));
  }

  async createOrder(insertOrder: InsertOrder, insertItems: InsertOrderItem[]): Promise<Order> {
    const id = this.currentIds.order++;
    const now = new Date();
    const order: Order = { ...insertOrder, id, createdAt: now };
    this.orders.set(id, order);
    
    // Add order items
    insertItems.forEach((insertItem) => {
      const itemId = this.currentIds.orderItem++;
      const orderItem: OrderItem = { ...insertItem, id, orderId: id };
      this.orderItems.set(itemId, orderItem);
    });
    
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Message operations
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUserConversations(userId: number): Promise<{
    userId: number;
    username: string;
    lastMessage: Message;
  }[]> {
    // Get all messages sent by or to this user
    const userMessages = Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
    
    // Group by conversation partner
    const conversationsByUser = new Map<number, Message[]>();
    
    userMessages.forEach((message) => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversationsByUser.has(partnerId)) {
        conversationsByUser.set(partnerId, []);
      }
      
      conversationsByUser.get(partnerId)?.push(message);
    });
    
    // Get the last message for each conversation
    const conversations = Array.from(conversationsByUser.entries()).map(([partnerId, messages]) => {
      // Sort messages by date
      messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      const partnerUser = this.users.get(partnerId);
      
      return {
        userId: partnerId,
        username: partnerUser?.username || "Unknown User",
        lastMessage: messages[0]
      };
    });
    
    return conversations;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const now = new Date();
    const message: Message = { ...insertMessage, id, createdAt: now };
    this.messages.set(id, message);
    return message;
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<boolean> {
    const messagesToUpdate = Array.from(this.messages.values())
      .filter(
        (message) => 
          message.senderId === senderId && 
          message.receiverId === receiverId &&
          !message.read
      );
    
    messagesToUpdate.forEach((message) => {
      const updatedMessage = { ...message, read: true };
      this.messages.set(message.id, updatedMessage);
    });
    
    return true;
  }
}

import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, and, or, like, desc, asc } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Shop operations
  async getShop(id: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.id, id));
    return shop;
  }

  async getShopByUserId(userId: number): Promise<Shop | undefined> {
    const [shop] = await db.select().from(shops).where(eq(shops.userId, userId));
    return shop;
  }

  async getShops(): Promise<Shop[]> {
    return await db.select().from(shops);
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const [shop] = await db.insert(shops).values(insertShop).returning();
    return shop;
  }

  async updateShop(id: number, shopData: Partial<InsertShop>): Promise<Shop | undefined> {
    const [updatedShop] = await db
      .update(shops)
      .set(shopData)
      .where(eq(shops.id, id))
      .returning();
    return updatedShop;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProducts(filter?: {
    category?: string;
    shopId?: number;
    search?: string;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    if (filter) {
      const conditions = [];
      
      if (filter.category) {
        conditions.push(eq(products.category, filter.category as any));
      }
      
      if (filter.shopId) {
        conditions.push(eq(products.shopId, filter.shopId));
      }
      
      if (filter.search) {
        conditions.push(
          or(
            like(products.title, `%${filter.search}%`),
            like(products.description, `%${filter.search}%`)
          )
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    return await query;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return !!result;
  }

  // Review operations
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  // Wishlist operations
  async getWishlistByUser(userId: number): Promise<WishlistItem[]> {
    return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async addToWishlist(insertWishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    const [wishlistItem] = await db.insert(wishlistItems).values(insertWishlistItem).returning();
    return wishlistItem;
  }

  async removeFromWishlist(userId: number, productId: number): Promise<boolean> {
    const result = await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, userId),
          eq(wishlistItems.productId, productId)
        )
      );
    return !!result;
  }

  // Cart operations
  async getCartByUser(userId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item is already in the cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, insertCartItem.userId),
          eq(cartItems.productId, insertCartItem.productId)
        )
      );

    if (existingItem) {
      // Update the quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + insertCartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [cartItem] = await db.insert(cartItems).values(insertCartItem).returning();
      return cartItem;
    }
  }

  async updateCartItem(userId: number, productId: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      )
      .returning();
    return updatedItem;
  }

  async removeFromCart(userId: number, productId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
    return !!result;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return !!result;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrdersByShop(shopId: number): Promise<Order[]> {
    // First get the product IDs belonging to this shop
    const shopProducts = await db.select().from(products).where(eq(products.shopId, shopId));
    const productIds = shopProducts.map(product => product.id);
    
    if (productIds.length === 0) {
      return [];
    }
    
    // Then get order items with these product IDs
    const orderItemsResult = await db
      .select()
      .from(orderItems)
      .where(
        productIds.map(id => eq(orderItems.productId, id)).reduce((a, b) => or(a, b))
      );
    
    const orderIds = [...new Set(orderItemsResult.map(item => item.orderId))];
    
    if (orderIds.length === 0) {
      return [];
    }
    
    // Finally get the orders
    return await db
      .select()
      .from(orders)
      .where(
        orderIds.map(id => eq(orders.id, id)).reduce((a, b) => or(a, b))
      );
  }

  async createOrder(insertOrder: InsertOrder, insertItems: InsertOrderItem[]): Promise<Order> {
    // Use a transaction to ensure order and items are created together
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(insertOrder).returning();
      
      // Insert order items with the order ID
      for (const item of insertItems) {
        await tx.insert(orderItems).values({
          ...item,
          orderId: order.id
        });
      }
      
      // Clear the user's cart
      await tx.delete(cartItems).where(eq(cartItems.userId, insertOrder.userId));
      
      return order;
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Message operations
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.receiverId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.receiverId, user1Id)
          )
        )
      )
      .orderBy(asc(messages.createdAt));
  }

  async getUserConversations(userId: number): Promise<{
    userId: number;
    username: string;
    lastMessage: Message;
  }[]> {
    // Get all unique users this user has exchanged messages with
    const sentMessages = await db
      .select({ otherUserId: messages.receiverId })
      .from(messages)
      .where(eq(messages.senderId, userId))
      .groupBy(messages.receiverId);
    
    const receivedMessages = await db
      .select({ otherUserId: messages.senderId })
      .from(messages)
      .where(eq(messages.receiverId, userId))
      .groupBy(messages.senderId);
    
    // Combine and deduplicate
    const otherUserIds = [...new Set([
      ...sentMessages.map(m => m.otherUserId),
      ...receivedMessages.map(m => m.otherUserId)
    ])];
    
    // For each other user, get the last message and username
    const conversations = [];
    
    for (const otherUserId of otherUserIds) {
      // Get the other user
      const [otherUser] = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(eq(users.id, otherUserId));
      
      if (!otherUser) continue;
      
      // Get the last message between these users
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(
          or(
            and(
              eq(messages.senderId, userId),
              eq(messages.receiverId, otherUserId)
            ),
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.receiverId, userId)
            )
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(1);
      
      if (lastMessage) {
        conversations.push({
          userId: otherUserId,
          username: otherUser.username,
          lastMessage
        });
      }
    }
    
    return conversations;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.senderId, senderId),
          eq(messages.receiverId, receiverId),
          eq(messages.read, false)
        )
      );
    return !!result;
  }
}

export const storage = new DatabaseStorage();
