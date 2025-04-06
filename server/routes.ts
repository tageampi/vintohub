import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { insertProductSchema, insertReviewSchema, insertShopSchema } from "@shared/schema";
import { z } from "zod";

interface ChatMessage {
  type: 'message';
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
}

interface ChatSocketData {
  userId: number;
  isAlive: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Map<WebSocket, ChatSocketData>();
  
  wss.on('connection', (ws) => {
    clients.set(ws, { userId: 0, isAlive: true });
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'auth') {
          const userData = clients.get(ws);
          if (userData) {
            userData.userId = data.userId;
            clients.set(ws, userData);
          }
          return;
        }
        
        // Handle chat messages
        if (data.type === 'message') {
          const chatMessage: ChatMessage = {
            type: 'message',
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
            timestamp: new Date()
          };
          
          // Save to database
          await storage.createMessage({
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
            read: false
          });
          
          // Send to receiver if online
          clients.forEach((userData, client) => {
            if (userData.userId === data.receiverId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(chatMessage));
            }
          });
          
          // Return to sender as confirmation
          ws.send(JSON.stringify({
            ...chatMessage,
            status: 'sent'
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Handle pings to keep connection alive
    ws.on('pong', () => {
      const userData = clients.get(ws);
      if (userData) {
        userData.isAlive = true;
        clients.set(ws, userData);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });
  
  // Ping all clients every 30 seconds
  const pingInterval = setInterval(() => {
    clients.forEach((userData, ws) => {
      if (!userData.isAlive) {
        ws.terminate();
        clients.delete(ws);
        return;
      }
      
      userData.isAlive = false;
      clients.set(ws, userData);
      ws.ping();
    });
  }, 30000);
  
  // Clear interval when server closes
  httpServer.on('close', () => {
    clearInterval(pingInterval);
  });

  // API Routes
  
  // Shop Routes
  app.post('/api/shops', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Validate user is a seller
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Only sellers can create shops' });
      }
      
      // Check if user already has a shop
      const existingShop = await storage.getShopByUserId(req.user.id);
      if (existingShop) {
        return res.status(400).json({ message: 'User already has a shop' });
      }
      
      // Validate input
      const validatedData = insertShopSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const shop = await storage.createShop(validatedData);
      res.status(201).json(shop);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/shops', async (req, res, next) => {
    try {
      const shops = await storage.getShops();
      res.json(shops);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/shops/:id', async (req, res, next) => {
    try {
      const shopId = parseInt(req.params.id);
      const shop = await storage.getShop(shopId);
      
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      
      res.json(shop);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/user/shop', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const shop = await storage.getShopByUserId(req.user.id);
      
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      
      res.json(shop);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch('/api/shops/:id', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const shopId = parseInt(req.params.id);
      const shop = await storage.getShop(shopId);
      
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      
      // Verify ownership
      if (shop.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedShop = await storage.updateShop(shopId, req.body);
      res.json(updatedShop);
    } catch (error) {
      next(error);
    }
  });

  // Product Routes
  app.post('/api/products', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Get user's shop
      const shop = await storage.getShopByUserId(req.user.id);
      
      if (!shop) {
        return res.status(404).json({ message: 'You need to create a shop first' });
      }
      
      // Validate input
      const validatedData = insertProductSchema.parse({
        ...req.body,
        shopId: shop.id
      });
      
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/products', async (req, res, next) => {
    try {
      const { category, shopId, search } = req.query;
      
      const filter: any = {};
      
      if (category) filter.category = category as string;
      if (shopId) filter.shopId = parseInt(shopId as string);
      if (search) filter.search = search as string;
      
      const products = await storage.getProducts(filter);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/products/:id', async (req, res, next) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch('/api/products/:id', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Get user's shop
      const shop = await storage.getShopByUserId(req.user.id);
      
      // Verify ownership
      if (!shop || product.shopId !== shop.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const updatedProduct = await storage.updateProduct(productId, req.body);
      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete('/api/products/:id', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Get user's shop
      const shop = await storage.getShopByUserId(req.user.id);
      
      // Verify ownership
      if (!shop || product.shopId !== shop.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      await storage.deleteProduct(productId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Review Routes
  app.post('/api/products/:id/reviews', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Validate input
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        productId,
        userId: req.user.id
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/products/:id/reviews', async (req, res, next) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByProduct(productId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  // Wishlist Routes
  app.get('/api/wishlist', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const wishlistItems = await storage.getWishlistByUser(req.user.id);
      res.json(wishlistItems);
    } catch (error) {
      next(error);
    }
  });
  
  app.post('/api/wishlist', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
      
      const product = await storage.getProduct(parseInt(productId));
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const wishlistItem = await storage.addToWishlist({
        userId: req.user.id,
        productId: parseInt(productId)
      });
      
      res.status(201).json(wishlistItem);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete('/api/wishlist/:productId', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const productId = parseInt(req.params.productId);
      
      await storage.removeFromWishlist(req.user.id, productId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Cart Routes
  app.get('/api/cart', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const cartItems = await storage.getCartByUser(req.user.id);
      res.json(cartItems);
    } catch (error) {
      next(error);
    }
  });
  
  app.post('/api/cart', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { productId, quantity } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
      
      const product = await storage.getProduct(parseInt(productId));
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const cartItem = await storage.addToCart({
        userId: req.user.id,
        productId: parseInt(productId),
        quantity: quantity || 1
      });
      
      res.status(201).json(cartItem);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch('/api/cart/:productId', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;
      
      if (quantity === undefined) {
        return res.status(400).json({ message: 'Quantity is required' });
      }
      
      const cartItem = await storage.updateCartItem(req.user.id, productId, quantity);
      
      if (!cartItem && quantity > 0) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      res.json(cartItem || { removed: true });
    } catch (error) {
      next(error);
    }
  });
  
  app.delete('/api/cart/:productId', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const productId = parseInt(req.params.productId);
      
      await storage.removeFromCart(req.user.id, productId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete('/api/cart', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      await storage.clearCart(req.user.id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Order Routes
  app.post('/api/orders', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { shippingAddress } = req.body;
      
      if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required' });
      }
      
      // Get cart items
      const cartItems = await storage.getCartByUser(req.user.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      
      // Calculate total
      let total = 0;
      const orderItems = [];
      
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }
        
        if (product.inventory < item.quantity) {
          return res.status(400).json({ 
            message: `Not enough inventory for product "${product.title}"` 
          });
        }
        
        total += product.price * item.quantity;
        
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
        
        // Update inventory
        await storage.updateProduct(product.id, {
          inventory: product.inventory - item.quantity
        });
      }
      
      // Create order
      const order = await storage.createOrder(
        {
          userId: req.user.id,
          total,
          status: 'pending',
          shippingAddress
        },
        orderItems
      );
      
      // Clear cart
      await storage.clearCart(req.user.id);
      
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/orders', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const orders = await storage.getOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/orders/:id', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Verify ownership
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/seller/orders', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Verify user is a seller
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Only sellers can access this endpoint' });
      }
      
      // Get user's shop
      const shop = await storage.getShopByUserId(req.user.id);
      
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      
      const orders = await storage.getOrdersByShop(shop.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch('/api/orders/:id/status', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Verify user is a seller
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Only sellers can update order status' });
      }
      
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      // Validate status
      const validStatus = z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).safeParse(status);
      
      if (!validStatus.success) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Message Routes
  app.get('/api/messages/conversations', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const conversations = await storage.getUserConversations(req.user.id);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  });
  
  app.get('/api/messages/:userId', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const otherUserId = parseInt(req.params.userId);
      const conversation = await storage.getConversation(req.user.id, otherUserId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(otherUserId, req.user.id);
      
      res.json(conversation);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
