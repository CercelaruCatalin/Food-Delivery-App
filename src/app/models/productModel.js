import pool from '../config/db.js';

const getAllProducts = async () => {
    const { rows } = await pool.query('SELECT * FROM products');
    return rows;
};

const getAllProductsFromRestaurant = async (restaurantId) => {
    const { rows } = await pool.query('SELECT * FROM products WHERE restaurant_id = $1', [restaurantId]);
    return rows;
}

// Helper function to determine if input is ID or name
const getProductId = async (input) => {
    if (typeof input === 'number') {
        return input; // Assume input is product_id
    } else {
        const product = await pool.query('SELECT product_id FROM products WHERE product_name = $1', [input]);
        if (product.rowCount > 0) {
            return product.rows[0].product_id;
        } else {
            throw new Error("Product not found");
        }
    }
};

const getProduct = async (input) => {
    const productId = await getProductId(input);

    try {
        const product = await pool.query('SELECT * FROM products WHERE product_id = $1', [productId]);
        if (product.rowCount > 0) {
            return product.rows[0];
        } else {
            throw new Error("Product not found");
        }
    } catch (err) {
        console.error('Error getting product:', err);
        throw new Error("Error getting product");
    }
};

const getCategoryName = async (category_id) => {
    try{
        const category = await pool.query('SELECT name FROM categories WHERE id = $1', [category_id]);
        if(category.rowCount > 0){
            return category.name;
        }
        else{
            throw new Error('Category not found!');
        }
    }catch(err){
        console.error('Error getting category:', err);
        throw new Error('Error getting cateogry');
    }

}

const deleteProduct = async (input) => {
    const productId = await getProductId(input);

    try {
        const result = await pool.query('DELETE FROM products WHERE product_id = $1', [productId]);
        console.log('Product deleted successfully');
        if (result.rowCount === 1) {
            await pool.query('DELETE FROM carts_products WHERE product_id = $1', [productId]);
            await pool.query('DELETE FROM orders_products WHERE product_id = $1', [productId]);
            return {
                message: 'Product deleted successfully',
                deletedProductId: productId
            }
        }
    } catch (err) {
        console.error('Error deleting product:', err);
        throw new Error("Error deleting product");
    }
};

const createProduct = async (name, price, restaurantName, category, quantity, description, image) => {
    const restaurantId = await getRestaurantIdByName(restaurantName);
    if (!restaurantId) throw new Error("Restaurant not found");

    const categoryId = await getCategoryIdByName(category);
    if (!categoryId) throw new Error("Category not found");

    try {
        const result = await pool.query(
            'INSERT INTO products (restaurant_id, product_name, category_id, quantity, description, price_per_item, image) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [restaurantId, name, categoryId, quantity, description, price, image]
        );
        console.log('Product created successfully');
        return {
            message: 'Product created successfully',
            createdProduct: result.rows[0]
        };
    } catch (err) {
        console.error('Error creating product:', err);
        throw new Error("Error creating product");
    }
};

const updateProductName = async (input, newName) => {
    const productId = await getProductId(input);

    try {
        const result = await pool.query('UPDATE products SET product_name = $1 WHERE product_id = $2 RETURNING *', [newName, productId]);
        if (result.rowCount === 1) {
            return {
                message: 'Product name updated successfully',
                updatedProduct: result.rows[0]
            }
        }
    } catch (err) {
        console.error('Error updating product name:', err);
        throw new Error("Error updating product name");
    }
};

const updateProductPrice = async (input, price) => {
    const productId = await getProductId(input);

    try {
        const result = await pool.query('UPDATE products SET price_per_item = $1 WHERE product_id = $2 RETURNING *', [price, productId]);
        if (result.rowCount === 1) {
            return {
                message: 'Product price updated successfully',
                updatedProduct: result.rows[0]
            }
        }
    } catch (err) {
        console.error('Error updating product price:', err);
        throw new Error("Error updating product price");
    }
};

const updateProductQuantity = async (input, quantity) => {
    const productId = await getProductId(input);

    try {
        const result = await pool.query('UPDATE products SET quantity = $1 WHERE product_id = $2 RETURNING *', [quantity, productId]);
        if (result.rowCount === 1) {
            return {
                message: 'Product quantity updated successfully',
                updatedProduct: result.rows[0]
            }
        }
    } catch (err) {
        console.error('Error updating product quantity:', err);
        throw new Error("Error updating product quantity");
    }
};

const updateProductDescription = async (input, description) => {
    const productId = await getProductId(input);

    try {
        const result = await pool.query('UPDATE products SET description = $1 WHERE product_id = $2 RETURNING *', [description, productId]);
        if (result.rowCount === 1) {
            return {
                message: 'Product description updated successfully',
                updatedProduct: result.rows[0]
            }
        }
    } catch (err) {
        console.error('Error updating product description:', err);
        throw new Error("Error updating product description");
    }
};

const updateProductImage = async (input, image) => {
    const productId = await getProductId(input);

    try {
        const result = await pool.query('UPDATE products SET image = $1 WHERE product_id = $2 RETURNING *', [image, productId]);
        if (result.rowCount === 1) {
            return {
                message: 'Product image updated successfully',
                updatedProduct: result.rows[0]
            }
        }
    } catch (err) {
        console.error('Error updating product image:', err);
        throw new Error("Error updating product image");
    }
};

export {
    getAllProducts,
    getAllProductsFromRestaurant,
    getProductId,
    getProduct,
    getCategoryName,
    deleteProduct,
    createProduct,
    updateProductName,
    updateProductPrice,
    updateProductQuantity,
    updateProductDescription,
    updateProductImage
};
