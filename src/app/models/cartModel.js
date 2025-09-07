import pool from "../config/db";
import { resolveUserId } from "./userModel";

// Get cart ID for user
const getCartId = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT id FROM carts WHERE user_id = $1",
      [userId]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
    return null;
  } catch (err) {
    console.error('Error getting cart id:', err);
    throw new Error("Error getting cart id");
  }
};

// Create new cart for user
const createCart = async (userId) => {
  try {
    const result = await pool.query(
      "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
      [userId]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    throw new Error("Failed to create cart");
  } catch (err) {
    console.error('Error creating cart:', err);
    throw new Error("Error creating cart");
  }
};

// Verify cart item ownership
const verifyCartItemOwnership = async (cartItemId, userEmail) => {
  try {
    const result = await pool.query(`
      SELECT cp.cart_item_id
      FROM cart_products cp
      JOIN carts c ON cp.cart_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE cp.cart_item_id = $1 AND u.email = $2
    `, [cartItemId, userEmail]);
    
    return result.rows.length > 0;
  } catch (err) {
    console.error('Error verifying cart item ownership:', err);
    throw new Error("Error verifying cart item ownership");
  }
};

// Remove cart item extras
const removeCartItemExtras = async (cartItemId) => {
  try {
    await pool.query(
      "DELETE FROM cart_product_extras WHERE cart_item_id = $1",
      [cartItemId]
    );
  } catch (err) {
    console.error('Error removing cart item extras:', err);
    throw new Error("Error removing cart item extras");
  }
};

// Remove cart item
const removeCartItem = async (cartItemId) => {
  try {
    // First delete related extras
    await removeCartItemExtras(cartItemId);
    
    // Then delete cart item
    await pool.query(
      "DELETE FROM cart_products WHERE cart_item_id = $1",
      [cartItemId]
    );
  } catch (err) {
    console.error('Error removing cart item:', err);
    throw new Error("Error removing cart item");
  }
};

// Update cart item quantity
const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    await pool.query(
      "UPDATE cart_products SET quantity = $1 WHERE cart_item_id = $2",
      [quantity, cartItemId]
    );
  } catch (err) {
    console.error('Error updating cart item quantity:', err);
    throw new Error("Error updating cart item quantity");
  }
};

// Clear cart extras
const clearCartExtras = async (cartId) => {
  try {
    await pool.query(`
      DELETE FROM cart_product_extras
      WHERE cart_item_id IN (
        SELECT cart_item_id FROM cart_products WHERE cart_id = $1
      )`,
      [cartId]
    );
  } catch (err) {
    console.error('Error clearing cart extras:', err);
    throw new Error("Error clearing cart extras");
  }
};

// Clear cart products
const clearCartProducts = async (cartId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First clear all extras related to this cart
    await client.query(`
      DELETE FROM cart_product_extras
      WHERE cart_item_id IN (
        SELECT cart_item_id FROM cart_products WHERE cart_id = $1
      )`,
      [cartId]
    );
    
    // Then clear all products
    await client.query(
      "DELETE FROM cart_products WHERE cart_id = $1",
      [cartId]
    );
    
    await client.query('COMMIT');
    console.log(`Successfully cleared cart ${cartId}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error clearing cart products:', err);
    throw new Error("Error clearing cart products");
  } finally {
    client.release();
  }
};

// Add item to cart with size and extras
const addItemToCart = async (cartId, productId, restaurantId, quantity, sizeId = null) => {
  try {
    const result = await pool.query(
      `INSERT INTO cart_products (cart_id, product_id, restaurant_id, quantity, size_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING cart_item_id`,
      [cartId, productId, restaurantId, quantity, sizeId]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].cart_item_id;
    }
    throw new Error("Failed to add item to cart");
  } catch (err) {
    console.error('Error adding item to cart:', err);
    throw new Error("Error adding item to cart");
  }
};

// Add extra to cart item
const addExtraToCartItem = async (cartItemId, extraId) => {
  try {
    await pool.query(
      `INSERT INTO cart_product_extras (cart_item_id, extra_id)
       VALUES ($1, $2)`,
      [cartItemId, extraId]
    );
  } catch (err) {
    console.error('Error adding extra to cart item:', err);
    throw new Error("Error adding extra to cart item");
  }
};

// Get user cart by email
const getUserCart = async (identifier) => {
  try {
    const userId = await resolveUserId(identifier);
    
    if (!userId) {
      throw new Error("User not found");
    }
    
    let cartId = await getCartId(userId);
    
    if (!cartId) {
      const newCart = await createCart(userId);
      cartId = newCart.id;
    }
    
    // Get cart products with details
    const cartProductsQuery = `
      WITH cart_items AS (
        SELECT 
          cp.cart_item_id,
          cp.product_id,
          cp.restaurant_id,
          cp.quantity,
          cp.size_id,
          p.name AS product_name,
          p.description,
          p.price_per_item,
          p.image,
          p.id,
          c.name AS category_name,
          s.size_name,
          s.price AS size_price
        FROM cart_products cp
        JOIN products p ON cp.product_id = p.id
        LEFT JOIN categories c ON p.category_name = c.name
        LEFT JOIN sizes s ON cp.size_id = s.size_id
        WHERE cp.cart_id = $1
      ),
      extras_info AS (
        SELECT 
          cpe.cart_item_id,
          json_agg(
            json_build_object(
              'extra_id', e.extra_id, 
              'extra_name', e.name,
              'price', pe.price
            )
          ) AS extras
        FROM cart_product_extras cpe
        JOIN extras e ON cpe.extra_id = e.extra_id
        JOIN product_extras pe ON cpe.extra_id = pe.extra_id AND pe.product_id = (
          SELECT product_id FROM cart_products WHERE cart_item_id = cpe.cart_item_id
        )
        GROUP BY cpe.cart_item_id
      )
      SELECT 
        ci.*,
        COALESCE(ei.extras, '[]'::json) AS extras
      FROM cart_items ci
      LEFT JOIN extras_info ei ON ci.cart_item_id = ei.cart_item_id
    `;
    
    const cartProducts = await pool.query(cartProductsQuery, [cartId]);
    
    // Format the response
    const formattedCartProducts = cartProducts.rows.map(item => {
      const size = item.size_id ? { 
        size_id: item.size_id, 
        size_name: item.size_name, 
        price: item.size_price 
      } : null;
      
      return {
        id: item.id,
        name: item.product_name,
        description: item.description,
        price_per_item: item.price_per_item,
        image: item.image,
        category_name: item.category_name,
        quantity: item.quantity,
        cart_item_id: item.cart_item_id,
        restaurant_id: item.restaurant_id,
        size,
        extras: item.extras
      };
    });
    
    return formattedCartProducts;
  } catch (err) {
    console.error('Error getting user cart:', err);
    throw new Error("Error getting user cart");
  }
};

// Sync local cart to database
const syncLocalCartToDatabase = async (userId, products) => {
  try {
    let cartId = await getCartId(userId);
    
    if (!cartId) {
      const newCart = await createCart(userId);
      cartId = newCart.id;
    }
    
    // Clear existing cart first
    await clearCartProducts(cartId);
    
    // Add each product to cart
    for (const product of products) {
      const { id: productId, restaurantId, size, extras = [], quantity = 1 } = product;
      
      // Add product to cart
      const cartItemId = await addItemToCart(cartId, productId, restaurantId, quantity, size?.size_id || null);
      
      // Add extras if any
      for (const extra of extras) {
        await addExtraToCartItem(cartItemId, extra.extra_id);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error syncing local cart to database:', err);
    throw new Error("Error syncing local cart to database");
  }
};

export {
  getCartId,
  createCart,
  verifyCartItemOwnership,
  removeCartItemExtras,
  removeCartItem,
  updateCartItemQuantity,
  clearCartProducts,
  clearCartExtras,
  addItemToCart,
  addExtraToCartItem,
  getUserCart,
  syncLocalCartToDatabase
};