import { Hono } from "hono";
import type { Env } from './core-utils';
import { ProductEntity, CartEntity, OrderEntity, UserEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { CartItem, Product, Order, Cart } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure products are seeded on first request
  app.use('/api/products/*', async (c, next) => {
    await ProductEntity.ensureSeed(c.env);
    await next();
  });
  // Ensure users are seeded on first request
  app.use('/api/auth/*', async (c, next) => {
    await UserEntity.ensureSeed(c.env);
    await next();
  });
  // AUTH
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!isStr(email) || !isStr(password)) return bad(c, 'Email and password required');
    const { items: users } = await UserEntity.list(c.env);
    const user = users.find(u => u.email === email);
    // Mock password check
    if (!user || password.length < 6) return bad(c, 'Invalid credentials');
    return ok(c, { user, token: crypto.randomUUID() });
  });
  // PRODUCTS
  app.get('/api/products', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ProductEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 20);
    return ok(c, page);
  });
  app.get('/api/products/:id', async (c) => {
    const { id } = c.req.param();
    const product = new ProductEntity(c.env, id);
    if (!await product.exists()) return notFound(c, 'Product not found');
    return ok(c, await product.getState());
  });
  app.get('/api/products/slug/:slug', async (c) => {
    const { slug } = c.req.param();
    if (!isStr(slug)) return bad(c, 'Invalid slug');
    await ProductEntity.ensureSeed(c.env);
    const { items: products } = await ProductEntity.list(c.env);
    const product = products.find(p => p.slug === slug);
    if (!product) return notFound(c, 'Product not found');
    return ok(c, product);
  });
  app.get('/api/products/:id/related', async (c) => {
    const { id } = c.req.param();
    const productEntity = new ProductEntity(c.env, id);
    if (!await productEntity.exists()) return notFound(c, 'Product not found');
    const product = await productEntity.getState();
    const { items: allProducts } = await ProductEntity.list(c.env, null, 100); // Fetch all for simple filtering
    const related = allProducts
      .filter(p => p.id !== id && p.category === product.category)
      .slice(0, 4);
    return ok(c, related);
  });
  // CART
  app.post('/api/cart', async (c) => {
    const { cartId } = (await c.req.json()) as { cartId?: string };
    if (isStr(cartId)) {
      const cart = new CartEntity(c.env, cartId);
      if (await cart.exists()) {
        return ok(c, await cart.getState());
      }
    }
    const newCartId = crypto.randomUUID();
    const now = Date.now();
    const newCart = await CartEntity.create(c.env, {
      id: newCartId,
      items: [],
      subtotal: 0,
      createdAt: now,
      updatedAt: now,
    });
    return ok(c, newCart);
  });
  app.post('/api/cart/merge', async (c) => {
    const { userId, guestCartId } = await c.req.json();
    if (!isStr(userId)) return bad(c, 'userId is required');
    const userCartEntity = new CartEntity(c.env, userId);
    let userCart: Cart;
    if (await userCartEntity.exists()) {
      userCart = await userCartEntity.getState();
    } else {
      const now = Date.now();
      userCart = await CartEntity.create(c.env, {
        id: userId,
        userId,
        items: [],
        subtotal: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    if (isStr(guestCartId)) {
      const guestCartEntity = new CartEntity(c.env, guestCartId);
      if (await guestCartEntity.exists()) {
        const guestCart = await guestCartEntity.getState();
        for (const item of guestCart.items) {
          await userCartEntity.addItem(item);
        }
        await guestCartEntity.delete();
      }
    }
    return ok(c, await userCartEntity.getState());
  });
  app.get('/api/cart/:cartId', async (c) => {
    const { cartId } = c.req.param();
    if (!isStr(cartId)) return bad(c, 'cartId is required');
    const cart = new CartEntity(c.env, cartId);
    if (!await cart.exists()) return notFound(c, 'Cart not found');
    return ok(c, await cart.getState());
  });
  app.post('/api/cart/:cartId/items', async (c) => {
    const { cartId } = c.req.param();
    const item = (await c.req.json()) as Omit<CartItem, 'id'>;
    if (!isStr(cartId) || !item || !item.productId || !item.quantity) {
      return bad(c, 'cartId and item details are required');
    }
    const cart = new CartEntity(c.env, cartId);
    if (!await cart.exists()) return notFound(c, 'Cart not found');
    const updatedCart = await cart.addItem(item);
    return ok(c, updatedCart);
  });
  app.put('/api/cart/:cartId/items/:itemId', async (c) => {
    const { cartId, itemId } = c.req.param();
    const { quantity } = (await c.req.json()) as { quantity: number };
    if (!isStr(cartId) || !isStr(itemId) || typeof quantity !== 'number') {
      return bad(c, 'cartId, itemId, and quantity are required');
    }
    const cart = new CartEntity(c.env, cartId);
    if (!await cart.exists()) return notFound(c, 'Cart not found');
    const updatedCart = await cart.updateItemQuantity(itemId, quantity);
    return ok(c, updatedCart);
  });
  app.delete('/api/cart/:cartId/items/:itemId', async (c) => {
    const { cartId, itemId } = c.req.param();
    if (!isStr(cartId) || !isStr(itemId)) return bad(c, 'cartId and itemId are required');
    const cart = new CartEntity(c.env, cartId);
    if (!await cart.exists()) return notFound(c, 'Cart not found');
    const updatedCart = await cart.removeItem(itemId);
    return ok(c, updatedCart);
  });
  // CHECKOUT (GUEST OR AUTH)
  app.post('/api/checkout', async (c) => {
    const { cartId, userId, name, email } = (await c.req.json()) as { cartId: string, userId?: string | null, name?: string, email?: string };
    if (!isStr(cartId)) return bad(c, 'cartId is required');
    const cart = new CartEntity(c.env, cartId);
    if (!await cart.exists()) return notFound(c, 'Cart not found');
    const cartState = await cart.getState();
    if (cartState.items.length === 0) return bad(c, 'Cannot checkout with an empty cart');
    let customer: { name: string; email: string };
    if (userId && isStr(userId)) {
      const userEntity = new UserEntity(c.env, userId);
      if (!await userEntity.exists()) return bad(c, 'User not found');
      const user = await userEntity.getState();
      customer = { name: user.name || "Authenticated User", email: user.email };
    } else if (isStr(name) && isStr(email)) {
      customer = { name, email };
    } else {
      return bad(c, 'Authentication or guest details are required');
    }
    const orderId = `ord_${crypto.randomUUID().slice(0, 8)}`;
    const newOrder: Order = {
      id: orderId,
      cartId: cartState.id,
      items: cartState.items,
      total: cartState.subtotal,
      customer,
      createdAt: Date.now(),
    };
    await OrderEntity.create(c.env, newOrder);
    await cart.clear();
    return ok(c, { orderId, message: 'Checkout successful!' });
  });
  // ORDERS (for demo dashboard)
  app.get('/api/orders', async (c) => {
    await OrderEntity.ensureSeed(c.env);
    const { items } = await OrderEntity.list(c.env);
    return ok(c, items);
  });
}