import { Hono } from "hono";
import type { Env } from './core-utils';
import { ProductEntity, CartEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { CartItem, Product } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure products are seeded on first request
  app.use('/api/products/*', async (c, next) => {
    await ProductEntity.ensureSeed(c.env);
    await next();
  });
  // PRODUCTS
  app.get('/api/products', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ProductEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 12);
    return ok(c, page);
  });
  app.get('/api/products/:id', async (c) => {
    const { id } = c.req.param();
    const product = new ProductEntity(c.env, id);
    if (!await product.exists()) return notFound(c, 'Product not found');
    return ok(c, await product.getState());
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
  // MOCK CHECKOUT
  app.post('/api/checkout', async (c) => {
    const { cartId } = (await c.req.json()) as { cartId?: string };
    if (!isStr(cartId)) return bad(c, 'cartId is required');
    const cart = new CartEntity(c.env, cartId);
    if (!await cart.exists()) return notFound(c, 'Cart not found');
    // In a real app, you'd create an order, process payment, etc.
    // Here we just clear the cart and return a mock order ID.
    await cart.clear();
    return ok(c, { orderId: `mock_order_${crypto.randomUUID()}`, message: 'Checkout successful!' });
  });
}