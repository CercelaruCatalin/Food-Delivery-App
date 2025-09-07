import pool from "../config/db";

// Get all sizes
const getAllSizes = async () => {
  try {
    const { rows } = await pool.query('SELECT * FROM sizes');
    return rows;
  } catch (err) {
    console.error('Error getting all sizes:', err);
    throw new Error("Error getting all sizes");
  }
};

// Get sizes for product
const getSizesForProduct = async (productId) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM sizes WHERE product_id = $1 ORDER BY price ASC', 
      [productId]
    );
    return rows;
  } catch (err) {
    console.error('Error getting sizes for product:', err);
    throw new Error("Error getting sizes for product");
  }
};

// Get size by ID
const getSize = async (sizeId) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM sizes WHERE size_id = $1', 
      [sizeId]
    );
    
    if (rows.length === 0) {
      throw new Error("Size not found");
    }
    
    return rows[0];
  } catch (err) {
    console.error('Error getting size:', err);
    throw new Error("Error getting size");
  }
};

// Create size
const createSize = async (productId, sizeName, price) => {
  try {
    const { rows } = await pool.query(
      'INSERT INTO sizes (product_id, size_name, price) VALUES ($1, $2, $3) RETURNING *',
      [productId, sizeName, price]
    );
    
    return {
      message: 'Size created successfully',
      createdSize: rows[0]
    };
  } catch (err) {
    console.error('Error creating size:', err);
    throw new Error("Error creating size");
  }
};

// Update size
const updateSize = async (sizeId, updates) => {
  try {
    const updateFields = [];
    const queryValues = [];
    let paramCounter = 1;
    
    // Build the dynamic query based on provided updates
    if (updates.size_name !== undefined) {
      updateFields.push(`size_name = $${paramCounter}`);
      queryValues.push(updates.size_name);
      paramCounter++;
    }
    
    if (updates.price !== undefined) {
      updateFields.push(`price = $${paramCounter}`);
      queryValues.push(updates.price);
      paramCounter++;
    }
    
    if (updateFields.length === 0) {
      throw new Error("No update parameters provided");
    }
    
    const query = `
      UPDATE sizes 
      SET ${updateFields.join(', ')} 
      WHERE size_id = $${paramCounter} 
      RETURNING *
    `;
    
    queryValues.push(sizeId);
    
    const { rows } = await pool.query(query, queryValues);
    
    if (rows.length === 0) {
      throw new Error("Size not found");
    }
    
    return {
      message: 'Size updated successfully',
      updatedSize: rows[0]
    };
  } catch (err) {
    console.error('Error updating size:', err);
    throw new Error("Error updating size");
  }
};

// Delete size
const deleteSize = async (sizeId) => {
  try {
    // First check if any cart products use this size
    const cartProducts = await pool.query(
      'SELECT * FROM cart_products WHERE size_id = $1', 
      [sizeId]
    );
    
    if (cartProducts.rowCount > 0) {
      throw new Error("Cannot delete size that is in use by cart products");
    }
    
    const { rowCount } = await pool.query(
      'DELETE FROM sizes WHERE size_id = $1', 
      [sizeId]
    );
    
    if (rowCount === 0) {
      throw new Error("Size not found");
    }
    
    return {
      message: 'Size deleted successfully',
      deletedSizeId: sizeId
    };
  } catch (err) {
    console.error('Error deleting size:', err);
    throw new Error(err.message);
  }
};

export {
  getAllSizes,
  getSizesForProduct,
  getSize,
  createSize,
  updateSize,
  deleteSize
};