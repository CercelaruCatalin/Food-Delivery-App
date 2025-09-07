//api/courier/accept-order/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { resolveUserId } from "../../../models/userModel";
import pool from "../../../config/db";

// Accept a single order and assign it to the courier
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const courierId = await resolveUserId(session.user.email, 'courier');
    console.log("Courier ID:", courierId);

    if (!courierId) {
      return new Response(JSON.stringify({ error: "Access denied - Courier only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { orderId, orderType } = body;
    console.log("Request body:", { orderId, orderType });

    if (!orderId || !orderType) {
      return new Response(JSON.stringify({ error: "Order ID and Type are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (orderType !== 'user' && orderType !== 'guest') {
      return new Response(JSON.stringify({ error: "Invalid order type. Must be 'user' or 'guest'." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // First check if courier already has an active order
      const activeOrderCheck = `
        SELECT COUNT(*) as active_count FROM (
          SELECT id FROM orders 
          WHERE courier_id = $1 AND courier_status IN ('A courier has taken your order', 'Delivering')
          UNION ALL
          SELECT id FROM guest_orders 
          WHERE courier_id = $1 AND courier_status IN ('A courier has taken your order', 'Delivering')
        ) as active_orders
      `;

      const activeResult = await client.query(activeOrderCheck, [courierId]);
      const hasActiveOrder = parseInt(activeResult.rows[0].active_count) > 0;
      console.log("Has active order:", hasActiveOrder);

      if (hasActiveOrder) {
        await client.query('ROLLBACK');
        return new Response(JSON.stringify({ 
          error: "You already have an active order. Complete or abandon it to accept new orders.",
          code: "ALREADY_HAS_ORDER"
        }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      let orderResult;
      let tableName;

      // Use orderType to determine which table to query
      if (orderType === 'user') {
        tableName = 'orders';
        console.log("Querying orders table for order:", orderId);
        
        orderResult = await client.query(
          `SELECT id, delivery_status, courier_id, user_id, total_price, payment_method, 
                   street_address, city, postal_code, phone_number, order_date, delivery_date
            FROM orders 
            WHERE id = $1 AND courier_id IS NULL 
            AND delivery_status IN ('Order received', 'The restaurant confirmed your order', 'Preparing delivery')`,
          [orderId]
        );
      } else { // orderType === 'guest'
        tableName = 'guest_orders';
        console.log("Querying guest_orders table for order:", orderId);
        
        orderResult = await client.query(
          `SELECT id, delivery_status, courier_id, guest_user_id as user_id, total_price, payment_method,
                   street_address, city, postal_code, phone_number, order_date, delivery_date
            FROM guest_orders 
            WHERE id = $1 AND courier_id IS NULL 
            AND delivery_status IN ('Order received', 'The restaurant confirmed your order', 'Preparing delivery')`,
          [orderId]
        );
      }
      
      console.log("Order query result:", orderResult.rows);
      
      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        
        // check if order exists at all
        const debugQuery = orderType === 'user' ? 
          `SELECT id, courier_status, courier_id FROM orders WHERE id = $1` :
          `SELECT id, courier_status, courier_id FROM guest_orders WHERE id = $1`;
        
        const debugResult = await client.query(debugQuery, [orderId]);
        console.log("Debug - Order exists check:", debugResult.rows);
        
        return new Response(JSON.stringify({ 
          error: "Order not found or already assigned",
          code: "ORDER_NOT_AVAILABLE",
          debug: debugResult.rows.length > 0 ? debugResult.rows[0] : "Order not found"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const order = orderResult.rows[0];
      console.log("Order before update:", order);

      // Update the order with courier assignment and new status
      const updateQuery = `UPDATE ${tableName} 
                          SET courier_id = $1, courier_status = $2
                          WHERE id = $3`;
      
      console.log("Update query:", updateQuery);
      console.log("Update parameters:", [courierId, 'A courier has taken your order', orderId]);

      const updateResult = await client.query(updateQuery, [
        courierId, 
        'A courier has taken your order', 
        orderId
      ]);
      
      console.log("Update result - rows affected:", updateResult.rowCount);

      if (updateResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return new Response(JSON.stringify({ 
          error: "Failed to update order - no rows affected",
          code: "UPDATE_FAILED"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verify the update was successful
      const verifyQuery = orderType === 'user' ? 
        `SELECT courier_status, courier_id FROM orders WHERE id = $1` :
        `SELECT courier_status, courier_id FROM guest_orders WHERE id = $1`;
      
      const verifyResult = await client.query(verifyQuery, [orderId]);
      console.log("Verification after update:", verifyResult.rows[0]);

      await client.query('COMMIT');
      console.log("Transaction committed successfully");

      // Get courier information for the response
      const courierInfo = await client.query(
        `SELECT name, phone_number, email FROM couriers WHERE id = $1`,
        [courierId]
      );

      return new Response(JSON.stringify({
        success: true,
        message: `Successfully accepted order #${orderId}`,
        order: {
          id: orderId,
          type: orderType,
          ...order
        },
        courier: courierInfo.rows[0] || null,
        debug: {
          updateRowCount: updateResult.rowCount,
          finalStatus: verifyResult.rows[0]
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Transaction error:", error);
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Error accepting order:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Get courier's accepted orders (should only be one at a time)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const courierId = await resolveUserId(session.user.email, 'courier');
    
    if (!courierId) {
      return new Response(JSON.stringify({ error: "Access denied - Courier only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const client = await pool.connect();
    
    try {
      // Get all orders assigned to this courier from both tables
      const acceptedOrdersQuery = `
        WITH user_orders AS (
          SELECT 
            o.id,
            o.user_id,
            u.name as user_name,
            u.email as user_email,
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
            'user' as order_type
          FROM orders o
          JOIN users u ON o.user_id = u.id
          WHERE o.courier_id = $1
            AND o.courier_status IN ('A courier has taken your order', 'Delivering')
        ),
        guest_orders AS (
          SELECT 
            go.id,
            go.guest_user_id as user_id,
            gu.name as user_name,
            gu.email as user_email,
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
            'guest' as order_type
          FROM guest_orders go
          LEFT JOIN guest_users gu ON gu.id = go.guest_user_id
          WHERE go.courier_id = $1
            AND go.courier_status IN ('A courier has taken your order', 'Delivering')
        )
        SELECT * FROM user_orders
        UNION ALL
        SELECT * FROM guest_orders
        ORDER BY order_date DESC
      `;
      
      const ordersResult = await client.query(acceptedOrdersQuery, [courierId]);
      const orders = ordersResult.rows;
      
      // For each order, get the products and restaurants
      const ordersWithDetails = [];
      
      for (const order of orders) {
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
        
        const products = await client.query(productsQuery, [order.id]);
        
        // Get unique restaurants for this order
        const restaurantsQuery = `
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
        
        const restaurants = await client.query(restaurantsQuery, [order.id]);
        
        // Format the products
        const formattedProducts = products.rows.map(item => {
          const size = item.size_id ? { 
            size_id: item.size_id, 
            size_name: item.size_name, 
            price: item.size_price 
          } : null;
          
          return {
            order_item_id: item.order_item_id,
            product_id: item.product_id,
            restaurant_id: item.restaurant_id,
            name: item.product_name,
            description: item.description,
            price_per_item: item.price_per_item,
            image: item.image,
            quantity: item.quantity,
            restaurant_name: item.restaurant_name,
            size,
            extras: item.extras
          };
        });
        
        ordersWithDetails.push({
          ...order,
          products: formattedProducts,
          restaurants: restaurants.rows
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        orders: ordersWithDetails,
        count: ordersWithDetails.length
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error("Error fetching accepted orders:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}