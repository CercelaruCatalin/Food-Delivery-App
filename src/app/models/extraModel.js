import pool from "../config/db";

// Get all extras
const getAllExtras = async () => {
  try {
    const { rows } = await pool.query('SELECT * FROM extras');
    return rows;
  } catch (err) {
    console.error('Error getting all extras:', err);
    throw new Error("Error getting all extras");
  }
};

// Get extras for restaurant
const getExtrasForRestaurant = async (restaurantId) => {
  try {
    const { rows } = await pool.query('SELECT * FROM extras WHERE restaurant_id = $1', [restaurantId]);
    return rows;
  } catch (err) {
    console.error('Error getting extras for restaurant:', err);
    throw new Error("Error getting extras for restaurant");
  }
};

// Get extra by ID
const getExtra = async (extraId) => {
  try {
    const { rows } = await pool.query('SELECT * FROM extras WHERE extra_id = $1', [extraId]);
    if (rows.length === 0) {
      throw new Error("Extra not found");
    }
    return rows[0];
  } catch (err) {
    console.error('Error getting extra:', err);
    throw new Error("Error getting extra");
  }
};

// Create extra
const createExtra = async (restaurantId, name) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO extras (restaurant_id, name) VALUES ($1, $2) RETURNING *',
      [restaurantId, name]
    );
    return {
      message: 'Extra created successfully',
      createdExtra: rows[0]
    };
  } catch (err) {
    console.error('Error creating extra:', err);
    throw new Error("Error creating extra");
  }
};

// Update extra
const updateExtra = async (extraId, name) => {
  try {
    const { rows } = await pool.query(
      'UPDATE extras SET name = $1 WHERE extra_id = $2 RETURNING *',
      [name, extraId]
    );
    
    if (rows.length === 0) {
      throw new Error("Extra not found");
    }
    
    return {
      message: 'Extra updated successfully',
      updatedExtra: rows[0]
    };
  } catch (err) {
    console.error('Error updating extra:', err);
    throw new Error("Error updating extra");
  }
};

// Delete extra
const deleteExtra = async (extraId) => {
  try {
    // Check if extra is used in product_extras
    const productExtras = await pool.query('SELECT * FROM product_extras WHERE extra_id = $1', [extraId]);
    if (productExtras.rowCount > 0) {
      throw new Error("Cannot delete extra that is associated with products");
    }
    
    // Check if extra is used in cart_product_extras
    const cartProductExtras = await pool.query('SELECT * FROM cart_product_extras WHERE extra_id = $1', [extraId]);
    if (cartProductExtras.rowCount > 0) {
      throw new Error("Cannot delete extra that is in use by cart items");
    }
    
    const { rowCount } = await pool.query('DELETE FROM extras WHERE extra_id = $1', [extraId]);
    if (rowCount === 0) {
      throw new Error("Extra not found");
    }
    
    return {
      message: 'Extra deleted successfully',
      deletedExtraId: extraId
    };
  } catch (err) {
    console.error('Error deleting extra:', err);
    throw new Error(err.message);
  }
};

// ========== Product Extras Methods ==========

// Get product extras
const getProductExtras = async (productId) => {
  try {
    const { rows } = await pool.query(`
      SELECT pe.product_id, pe.extra_id, pe.price, e.name as extra_name
      FROM product_extras pe
      JOIN extras e ON pe.extra_id = e.extra_id
      WHERE pe.product_id = $1
    `, [productId]);
    return rows;
  } catch (err) {
    console.error('Error getting product extras:', err);
    throw new Error("Error getting product extras");
  }
};

// Add extra to product
const addExtraToProduct = async (productId, extraId, price) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO product_extras (product_id, extra_id, price) VALUES ($1, $2, $3) RETURNING *',
      [productId, extraId, price]
    );
    return {
      message: 'Extra added to product successfully',
      productExtra: rows[0]
    };
  } catch (err) {
    console.error('Error adding extra to product:', err);
    throw new Error("Error adding extra to product");
  }
};

// Update product extra price
const updateProductExtraPrice = async (productId, extraId, price) => {
  try {
    const { rows } = await pool.query(
      'UPDATE product_extras SET price = $1 WHERE product_id = $2 AND extra_id = $3 RETURNING *',
      [price, productId, extraId]
    );
    
    if (rows.length === 0) {
      throw new Error("Product extra not found");
    }
    
    return {
      message: 'Product extra price updated successfully',
      updatedProductExtra: rows[0]
    };
  } catch (err) {
    console.error('Error updating product extra price:', err);
    throw new Error("Error updating product extra price");
  }
};

// Remove extra from product
const removeExtraFromProduct = async (productId, extraId) => {
  try {
    // Check if this product-extra combination is in any cart items
    const cartProductExtras = await pool.query(`
      SELECT cpe.* 
      FROM cart_product_extras cpe
      JOIN cart_products cp ON cpe.cart_item_id = cp.cart_item_id
      WHERE cp.product_id = $1 AND cpe.extra_id = $2
    `, [productId, extraId]);
    
    if (cartProductExtras.rowCount > 0) {
      throw new Error("Cannot remove extra that is in use by cart items");
    }
    
    const { rowCount } = await pool.query(
      'DELETE FROM product_extras WHERE product_id = $1 AND extra_id = $2',
      [productId, extraId]
    );
    
    if (rowCount === 0) {
      throw new Error("Product extra not found");
    }
    
    return {
      message: 'Extra removed from product successfully',
      removedProductId: productId,
      removedExtraId: extraId
    };
  } catch (err) {
    console.error('Error removing extra from product:', err);
    throw new Error(err.message);
  }
};

// ========== Cart Product Extras Methods ==========

// Get cart product extras
const getCartProductExtras = async (cartItemId) => {
  try {
    const { rows } = await pool.query(`
      SELECT cpe.cart_item_id, cpe.extra_id, e.name as extra_name, pe.price
      FROM cart_product_extras cpe
      JOIN extras e ON cpe.extra_id = e.extra_id
      JOIN cart_products cp ON cpe.cart_item_id = cp.cart_item_id
      JOIN product_extras pe ON cp.product_id = pe.product_id AND cpe.extra_id = pe.extra_id
      WHERE cpe.cart_item_id = $1
    `, [cartItemId]);
    return rows;
  } catch (err) {
    console.error('Error getting cart product extras:', err);
    throw new Error("Error getting cart product extras");
  }
};

// Add extra to cart product
const addExtraToCartProduct = async (cartItemId, extraId) => {
  try {
    // First verify that this extra is valid for the product
    const cartProduct = await pool.query('SELECT product_id FROM cart_products WHERE cart_item_id = $1', [cartItemId]);
    if (cartProduct.rowCount === 0) {
      throw new Error("Cart item not found");
    }
    
    const productId = cartProduct.rows[0].product_id;
    const productExtra = await pool.query(
      'SELECT * FROM product_extras WHERE product_id = $1 AND extra_id = $2',
      [productId, extraId]
    );
    
    if (productExtra.rowCount === 0) {
      throw new Error("This extra is not available for this product");
    }
    
    const { rows } = await pool.query(
      'INSERT INTO cart_product_extras (cart_item_id, extra_id) VALUES ($1, $2) RETURNING *',
      [cartItemId, extraId]
    );
    
    return {
      message: 'Extra added to cart item successfully',
      cartProductExtra: rows[0]
    };
  } catch (err) {
    console.error('Error adding extra to cart item:', err);
    throw new Error(err.message);
  }
};

// Remove extra from cart product
const removeExtraFromCartProduct = async (cartItemId, extraId) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM cart_product_extras WHERE cart_item_id = $1 AND extra_id = $2',
      [cartItemId, extraId]
    );
    
    if (rowCount === 0) {
      throw new Error("Cart product extra not found");
    }
    
    return {
      message: 'Extra removed from cart item successfully',
      removedCartItemId: cartItemId,
      removedExtraId: extraId
    };
  } catch (err) {
    console.error('Error removing extra from cart item:', err);
    throw new Error("Error removing extra from cart item");
  }
};

export {
  // Extras
  getAllExtras,
  getExtrasForRestaurant,
  getExtra,
  createExtra,
  updateExtra,
  deleteExtra,
  
  // Product Extras
  getProductExtras,
  addExtraToProduct,
  updateProductExtraPrice,
  removeExtraFromProduct,
  
  // Cart Product Extras
  getCartProductExtras,
  addExtraToCartProduct,
  removeExtraFromCartProduct
};