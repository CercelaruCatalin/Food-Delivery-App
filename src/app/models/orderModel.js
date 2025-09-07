import pool from "../config/db";

// Helper function to create or get guest user
const createOrGetGuestUser = async (name, email, phone) => {
  const client = await pool.connect();
  
  try {
    // First check if guest user already exists
    const existingGuestUser = await client.query(
      `SELECT id FROM guest_users WHERE email = $1`,
      [email]
    );
    
    if (existingGuestUser.rows.length > 0) {
      // Update existing guest user with latest info
      const updatedGuestUser = await client.query(
        `UPDATE guest_users 
         SET name = $1, phone_number = $2
         WHERE email = $3
         RETURNING id`,
        [name, phone, email]
      );
      return updatedGuestUser.rows[0].id;
    } else {
      // Create new guest user
      const newGuestUser = await client.query(
        `INSERT INTO guest_users (name, email, phone_number)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [name, email, phone]
      );
      return newGuestUser.rows[0].id;
    }
  } finally {
    client.release();
  }
};

// Get all orders for a user
const getUserOrders = async (userId) => {
  try {
    // Query to get basic order info with courier data
    const ordersQuery = `
      SELECT 
        o.id,
        o.payment_method,
        o.street_address,
        o.city,
        o.postal_code,
        o.phone_number,
        o.total_price,
        o.order_date,
        o.payment_status,
        o.payment_intent_id,
        o.delivery_date,
        o.delivery_status,
        o.courier_status,
        o.courier_id,
        c.name as courier_name,
        c.phone_number as courier_phone,
        'user' as order_type
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE o.user_id = $1
      ORDER BY o.order_date DESC
    `;
    
    const orders = await pool.query(ordersQuery, [userId]);
    
    // For each order, get the products
    const ordersWithProducts = [];
    
    for (const order of orders.rows) {
      const productsQuery = `
        WITH order_items AS (
          SELECT 
            op.order_item_id,
            op.product_id,
            op.restaurant_id,
            op.quantity,
            op.size_id,
            p.name AS product_name,
            p.description,
            p.price_per_item,
            p.image,
            s.size_name,
            s.price AS size_price,
            r.name AS restaurant_name
          FROM orders_products op
          JOIN products p ON op.product_id = p.id
          JOIN restaurants r ON op.restaurant_id = r.id
          LEFT JOIN sizes s ON op.size_id = s.size_id
          WHERE op.order_id = $1 AND op.guest_order_id IS NULL
        ),
        extras_info AS (
          SELECT 
            ope.order_item_id,
            json_agg(
              json_build_object(
                'extra_id', e.extra_id, 
                'extra_name', e.name,
                'price', pe.price,
                'quantity', ope.quantity
              )
            ) AS extras
          FROM orders_products_extras ope
          JOIN extras e ON ope.extra_id = e.extra_id
          JOIN product_extras pe ON ope.extra_id = pe.extra_id AND pe.product_id = (
            SELECT product_id FROM orders_products WHERE order_item_id = ope.order_item_id
          )
          GROUP BY ope.order_item_id
        )
        SELECT 
          oi.*,
          COALESCE(ei.extras, '[]'::json) AS extras
        FROM order_items oi
        LEFT JOIN extras_info ei ON oi.order_item_id = ei.order_item_id
      `;
      
      const products = await pool.query(productsQuery, [order.id]);
      
      // Format the products
      const formattedProducts = products.rows.map(item => {
        const size = item.size_id ? { 
          size_id: item.size_id, 
          size_name: item.size_name, 
          price: item.size_price 
        } : null;
        
        return {
          product_id: item.product_id,
          restaurant_id: item.restaurant_id,
          name: item.product_name,
          description: item.description,
          price_per_item: item.price_per_item,
          image: item.image,
          quantity: item.quantity,
          restaurant_name: item.restaurant_name,
          order_item_id: item.order_item_id,
          size,
          extras: item.extras
        };
      });
      
      ordersWithProducts.push({
        ...order,
        products: formattedProducts
      });
    }
    
    return ordersWithProducts;
  } catch (err) {
    console.error('Error getting user orders:', err);
    throw new Error("Error getting user orders");
  }
};

// Get order by ID - works for both user and guest orders with courier data
const getOrderById = async (orderId, userId = null) => {
  try {
    // First try to get from user orders with courier data
    let orderQuery = `
      SELECT 
        o.id,
        o.user_id,
        o.payment_method,
        o.street_address,
        o.city,
        o.postal_code,
        o.phone_number,
        o.total_price,
        o.order_date,
        o.payment_status,
        o.payment_intent_id,
        o.delivery_date,
        o.delivery_status,
        o.courier_status,
        o.courier_id,
        c.name as courier_name,
        c.phone_number as courier_phone,
        c.email as courier_email,
        'user' as order_type
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE o.id = $1
      ${userId ? 'AND o.user_id = $2' : ''}
    `;
    
    let params = userId ? [orderId, userId] : [orderId];
    let orderResult = await pool.query(orderQuery, params);
    
    // If not found in user orders, try guest orders with courier data
    if (orderResult.rows.length === 0) {
      orderQuery = `
        SELECT 
          go.id,
          go.guest_user_id,
          go.payment_method,
          go.street_address,
          go.city,
          go.postal_code,
          go.phone_number,
          go.total_price,
          go.order_date,
          go.payment_status,
          go.payment_intent_id,
          go.delivery_date,
          go.delivery_status,
          go.courier_status,
          go.courier_id,
          c.name as courier_name,
          c.phone_number as courier_phone,
          c.email as courier_email,
          gu.name as guest_name,
          gu.email as guest_email,
          'guest' as order_type
        FROM guest_orders go
        LEFT JOIN couriers c ON go.courier_id = c.id
        LEFT JOIN guest_users gu ON go.guest_user_id = gu.id
        WHERE go.id = $1
      `;
      
      orderResult = await pool.query(orderQuery, [orderId]);
    }
    
    if (orderResult.rows.length === 0) {
      return null;
    }
    
    const order = orderResult.rows[0];
    
    // Get products based on order type
    const productsQuery = `
      WITH order_items AS (
        SELECT 
          op.order_item_id,
          op.product_id,
          op.restaurant_id,
          op.quantity,
          op.size_id,
          p.name AS product_name,
          p.description,
          p.price_per_item,
          p.image,
          s.size_name,
          s.price AS size_price,
          r.name AS restaurant_name
        FROM orders_products op
        JOIN products p ON op.product_id = p.id
        JOIN restaurants r ON op.restaurant_id = r.id
        LEFT JOIN sizes s ON op.size_id = s.size_id
        WHERE ${order.order_type === 'user' ? 'op.order_id = $1 AND op.guest_order_id IS NULL' : 'op.guest_order_id = $1 AND op.order_id IS NULL'}
      ),
      extras_info AS (
        SELECT 
          ope.order_item_id,
          json_agg(
            json_build_object(
              'extra_id', e.extra_id, 
              'extra_name', e.name,
              'price', pe.price,
              'quantity', ope.quantity
            )
          ) AS extras
        FROM orders_products_extras ope
        JOIN extras e ON ope.extra_id = e.extra_id
        JOIN product_extras pe ON ope.extra_id = pe.extra_id AND pe.product_id = (
          SELECT product_id FROM orders_products WHERE order_item_id = ope.order_item_id
        )
        GROUP BY ope.order_item_id
      )
      SELECT 
        oi.*,
        COALESCE(ei.extras, '[]'::json) AS extras
      FROM order_items oi
      LEFT JOIN extras_info ei ON oi.order_item_id = ei.order_item_id
    `;
    
    const products = await pool.query(productsQuery, [orderId]);
    
    // Get restaurants with their coordinates
    const restaurantQuery = `
      SELECT DISTINCT 
        r.id,
        r.name,
        r.street_address,
        r.city,
        r.latitude,
        r.longitude
      FROM restaurants r
      JOIN orders_products op ON r.id = op.restaurant_id
      WHERE ${order.order_type === 'user' ? 'op.order_id = $1 AND op.guest_order_id IS NULL' : 'op.guest_order_id = $1 AND op.order_id IS NULL'}
    `;
    
    const restaurants = await pool.query(restaurantQuery, [orderId]);
    
    // Format the products
    const formattedProducts = products.rows.map(item => {
      const size = item.size_id ? { 
        size_id: item.size_id, 
        size_name: item.size_name, 
        price: item.size_price 
      } : null;
      
      return {
        product_id: item.product_id,
        restaurant_id: item.restaurant_id,
        name: item.product_name,
        description: item.description,
        price_per_item: item.price_per_item,
        image: item.image,
        quantity: item.quantity,
        restaurant_name: item.restaurant_name,
        order_item_id: item.order_item_id,
        size,
        extras: item.extras
      };
    });
    
    return {
      order,
      formattedProducts,
      restaurants: restaurants.rows
    };
  } catch (err) {
    console.error('Error getting order by ID:', err);
    throw new Error("Error getting order by ID");
  }
};

// Place user order - updated to use correct table
const placeUserOrder = async (userId, products, streetAddress, city, postalCode, phoneNumber, paymentMethod, totalPrice, deliveryDate, paymentIntentId = null) => {
  const client = await pool.connect();

  console.log("deliveryDate received:", deliveryDate);
  console.log("Stripe paymentIntentId received:", paymentIntentId);
  
  try {
    await client.query('BEGIN');

    // Insert order into orders table
    const orderResult = await client.query(
      `INSERT INTO orders (
         user_id,
         payment_method,
         street_address,
         city,
         postal_code,
         phone_number,
         total_price,
         payment_status,
         payment_intent_id,
         order_date,
         delivery_date,
         delivery_status
       ) VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9, CURRENT_TIMESTAMP, $10::timestamptz, 'Order received'
       ) RETURNING *`,
      [
        userId,
        paymentMethod,
        streetAddress,
        city,
        postalCode,
        phoneNumber,
        totalPrice.toFixed(2),
        paymentIntentId ? 'paid' : 'pending',
        paymentIntentId,
        deliveryDate
      ]
    );
    const order = orderResult.rows[0];

    // Insert products and extras
    for (const product of products) {
      const res = await client.query(
        `INSERT INTO orders_products (order_id, product_id, restaurant_id, quantity, size_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING order_item_id`,
        [order.id, product.id, product.restaurant_id, product.quantity || 1, product.size?.size_id || null]
      );
      const orderItemId = res.rows[0].order_item_id;
      
      if (product.extras && Array.isArray(product.extras)) {
        for (const extra of product.extras) {
          await client.query(
            `INSERT INTO orders_products_extras (order_item_id, extra_id, quantity)
             VALUES ($1, $2, $3)`,
            [orderItemId, extra.extra_id, 1]
          );
        }
      }
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', err);
    throw new Error(`Error creating order: ${err.message}`);
  } finally {
    client.release();
  }
};

// Updated guest order function to use guest_users table
const placeGuestOrder = async (guestDetails, cartProducts) => {
  const { name, email, phone, streetAddress, city, postalCode, phoneNumber, paymentMethod, totalPrice, deliveryDate, paymentIntentId } = guestDetails;
 
  if (!name || !email || !phone) {
    throw new Error("Guest name, email and phone are required");
  }
 
  if (!streetAddress || !city || !postalCode || !phoneNumber) {
    throw new Error("Delivery address and contact details are required");
  }
 
  if (!paymentMethod || !totalPrice) {
    throw new Error("Payment method is required and price");
  }
 
  if (!Array.isArray(cartProducts) || cartProducts.length === 0) {
    throw new Error("Cart is empty");
  }
 
  const client = await pool.connect();
 
  try {
    await client.query('BEGIN');
    
    // Create or get guest user
    const guestUserId = await createOrGetGuestUser(name, email, phone);
   
    // Insert into guest_orders table with guest_user_id
    const orderResult = await client.query(
      `INSERT INTO guest_orders (
         guest_user_id,
         payment_method,
         street_address,
         city,
         postal_code,
         phone_number,
         total_price,
         payment_status,
         payment_intent_id,
         order_date,
         delivery_date,
         delivery_status
       ) VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9, CURRENT_TIMESTAMP, $10::timestamptz, 'Order received'
       ) RETURNING *`,
      [
        guestUserId,
        paymentMethod,
        streetAddress,
        city,
        postalCode,
        phoneNumber,
        totalPrice.toFixed(2),
        paymentIntentId ? 'paid' : 'pending',
        paymentIntentId,
        deliveryDate
      ]
    );
    const order = orderResult.rows[0];

    // Insert products and extras using guest_order_id
    for (const product of cartProducts) {
      const res = await client.query(
        `INSERT INTO orders_products (guest_order_id, product_id, restaurant_id, quantity, size_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING order_item_id`,
        [order.id, product.id, product.restaurant_id, product.quantity || 1, product.size?.size_id || null]
      );
      const orderItemId = res.rows[0].order_item_id;
      
      if (product.extras && Array.isArray(product.extras)) {
        for (const extra of product.extras) {
          await client.query(
            `INSERT INTO orders_products_extras (order_item_id, extra_id, quantity)
             VALUES ($1, $2, $3)`,
            [orderItemId, extra.extra_id, 1]
          );
        }
      }
    }
   
    await client.query('COMMIT');
    return order;
   
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating guest order:', err);
    throw new Error(`Error creating guest order: ${err.message}`);
  } finally {
    client.release();
  }
};

// Updated transfer function to handle guest_users table
const transferGuestOrderToUser = async (guestOrderId, userId) => {
  const client = await pool.connect();
  
  try {
    // Validate input parameters
    if (!guestOrderId || !userId) {
      throw new Error("Guest order ID and user ID are required");
    }

    await client.query('BEGIN');
    
    // Get the guest order with guest user info
    const guestOrderResult = await client.query(
      `SELECT go.*, gu.name, gu.email, gu.phone_number
       FROM guest_orders go
       LEFT JOIN guest_users gu ON go.guest_user_id = gu.id
       WHERE go.id = $1`,
      [guestOrderId]
    );
    
    if (guestOrderResult.rows.length === 0) {
      throw new Error('Guest order not found');
    }
    
    const guestOrder = guestOrderResult.rows[0];
    
    // Create new user order
    const userOrderResult = await client.query(
      `INSERT INTO orders (
         user_id,
         payment_method,
         street_address,
         city,
         postal_code,
         phone_number,
         total_price,
         payment_status,
         payment_intent_id,
         order_date,
         delivery_date,
         delivery_status,
         courier_id
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
       ) RETURNING *`,
      [
        userId,
        guestOrder.payment_method,
        guestOrder.street_address,
        guestOrder.city,
        guestOrder.postal_code,
        guestOrder.phone_number,
        guestOrder.total_price,
        guestOrder.payment_status,
        guestOrder.payment_intent_id,
        guestOrder.order_date,
        guestOrder.delivery_date,
        guestOrder.delivery_status,
        guestOrder.courier_id
      ]
    );
    
    const newUserOrder = userOrderResult.rows[0];
    
    // Update orders_products to point to new user order
    await client.query(
      `UPDATE orders_products 
       SET order_id = $1, guest_order_id = NULL 
       WHERE guest_order_id = $2`,
      [newUserOrder.id, guestOrderId]
    );
    
    // Delete the guest order
    await client.query(
      `DELETE FROM guest_orders WHERE id = $1`,
      [guestOrderId]
    );
    
    // I will keep the guest_user record for future orders
    
    await client.query('COMMIT');
    return newUserOrder;
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error transferring guest order to user:', err);
    throw new Error(`Error transferring guest order: ${err.message}`);
  } finally {
    client.release();
  }
};

// Get guest orders by email (for matching during transfer)
const getGuestOrdersByEmail = async (email) => {
  try {
    const query = `
      SELECT go.*, gu.name, gu.email, gu.phone_number
      FROM guest_orders go
      JOIN guest_users gu ON go.guest_user_id = gu.id
      WHERE gu.email = $1
      ORDER BY go.order_date DESC
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows;
  } catch (err) {
    console.error('Error getting guest orders by email:', err);
    throw new Error("Error getting guest orders by email");
  }
};

const changeDeliveryStatus = async (orderId, deliveryStatus, orderType) => {
  if (!orderId || !deliveryStatus || typeof deliveryStatus !== 'string' || !orderType) {
    throw new Error("Order ID and delivery status (as string) are required");
  }
 
  // Only allow automatic delivery statuses
  const validStatuses = [
    "Order received",
    "The restaurant confirmed your order",
    "Preparing delivery"
  ];
 
  if (!validStatuses.includes(deliveryStatus)) {
    throw new Error("Invalid delivery status provided");
  }

  try {
    let result;
    
    if (orderType === 'user') {
      // Try to update user order first
      result = await pool.query(
        `UPDATE orders
        SET delivery_status = $1
        WHERE id = $2
        RETURNING delivery_status`,
        [deliveryStatus, orderId]
      );
    } else if (orderType === 'guest') {
      // Try to update guest_orders
      result = await pool.query(
        `UPDATE guest_orders
        SET delivery_status = $1
        WHERE id = $2
        RETURNING delivery_status`,
        [deliveryStatus, orderId]
      );
    } else {
      throw new Error("Invalid order type. Must be 'user' or 'guest'");
    }

    if (result.rowCount === 0) {
      throw new Error(`Order with ID ${orderId} not found in ${orderType} orders`);
    }

    return {
      message: 'Delivery status updated successfully',
      newDeliveryStatus: result.rows[0].delivery_status
    };
   
  } catch (err) {
    console.error('Error updating the delivery status:', err);
    throw new Error(`Error updating the delivery status: ${err.message}`);
  }
};

// NEW: Change courier status - works for both user and guest orders (courier statuses only)
async function changeCourierStatus(orderId, courierStatus, courierId) {
  console.log('changeCourierStatus called with:', { orderId, courierStatus, courierId });

  if (!orderId || !courierStatus || !courierId) {
    console.error('Missing required parameters:', { orderId, courierStatus, courierId });
    return {
      success: false,
      error: 'Order ID, courier ID, and courier status are required'
    };
  }

  const validStatuses = ["A courier has taken your order", "Delivering", "Delivered"];
  if (!validStatuses.includes(courierStatus)) {
    return {
      success: false,
      error: `Invalid courier status. Must be one of: ${validStatuses.join(', ')}`
    };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Try updating in 'orders' first
    let orderResult = await client.query(
      `UPDATE orders
       SET courier_status = $1
       WHERE id = $2
         AND courier_id = $3
         AND courier_status IN ('A courier has taken your order', 'Delivering')
       RETURNING id, courier_status, delivery_status, 'user' AS order_type`,
      [courierStatus, orderId, courierId]
    );

    // If not found in 'orders', try 'guest_orders'
    if (orderResult.rows.length === 0) {
      orderResult = await client.query(
        `UPDATE guest_orders
         SET courier_status = $1
         WHERE id = $2
           AND courier_id = $3
           AND courier_status IN ('A courier has taken your order', 'Delivering')
         RETURNING id, courier_status, delivery_status, 'guest' AS order_type`,
        [courierStatus, orderId, courierId]
      );
    }

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: 'Order not found or courier not authorized to update status'
      };
    }

    await client.query('COMMIT');

    const updatedOrder = orderResult.rows[0];

    return {
      success: true,
      message: `Courier status updated to ${courierStatus}`,
      newCourierStatus: updatedOrder.courier_status,
      orderId: updatedOrder.id,
      orderType: updatedOrder.order_type,
      deliveryStatus: updatedOrder.delivery_status
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error in changeCourierStatus:', error);

    return {
      success: false,
      error: 'Database error occurred',
      details: error.message
    };
  } finally {
    client.release();
  }
}


// Function to verify payment intent - checks both tables
const verifyPaymentIntent = async (paymentIntentId) => {
  try {
    let result = await pool.query(
      `SELECT id, payment_status, total_price, 'user' as order_type
       FROM orders 
       WHERE payment_intent_id = $1`,
      [paymentIntentId]
    );
    
    // If not found in user orders, check guest orders
    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT id, payment_status, total_price, 'guest' as order_type
         FROM guest_orders 
         WHERE payment_intent_id = $1`,
        [paymentIntentId]
      );
    }
    
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error verifying payment intent:', err);
    throw new Error("Error verifying payment intent");
  }
};

export {
  getUserOrders,
  getOrderById,
  placeUserOrder,
  placeGuestOrder,
  transferGuestOrderToUser,
  getGuestOrdersByEmail,
  changeDeliveryStatus,
  verifyPaymentIntent,
  changeCourierStatus
};