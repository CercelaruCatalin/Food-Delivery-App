// api/courier/available-orders/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { resolveUserId } from "../../../models/userModel";
import pool from "../../../config/db";

// Get all available orders for couriers (orders without assigned courier)
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
      //check if courier already has an active order
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
      
      if (hasActiveOrder) {
        return new Response(JSON.stringify({
          success: true,
          orders: [],
          count: 0,
          message: "You already have an active order. Complete or abandon it to accept new orders."
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Get all orders without assigned courier from both user and guest orders
      // Only include orders with delivery_date = today or delivery_date IS NULL
      const availableOrdersQuery = `
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
          WHERE o.courier_id IS NULL
            AND o.delivery_status IN ('Order received', 'The restaurant confirmed your order', 'Preparing delivery')
            AND (o.delivery_date::date = CURRENT_DATE OR o.delivery_date IS NULL)
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
          WHERE go.courier_id IS NULL
            AND go.delivery_status IN ('Order received', 'The restaurant confirmed your order', 'Preparing delivery')
            AND (go.delivery_date::date = CURRENT_DATE OR go.delivery_date IS NULL)
        )
        SELECT * FROM user_orders
        UNION ALL
        SELECT * FROM guest_orders
        ORDER BY order_date DESC
      `;
      
      const ordersResult = await client.query(availableOrdersQuery);
      const orders = ordersResult.rows;
      
      // For each order, get the products and restaurants
      const ordersWithDetails = [];
      
      for (const order of orders) {
        // Get products for this order
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
    console.error("Error fetching available orders:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}