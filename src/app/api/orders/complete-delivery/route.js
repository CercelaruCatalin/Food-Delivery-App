// api/courier/complete-deliveryroute.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { resolveUserId } from "../../../models/userModel";
import pool from "../../../config/db";

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
    
    if (!courierId) {
      return new Response(JSON.stringify({ error: "Access denied - Courier only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const body = await req.json();
    const { orderId } = body;
    
    if (!orderId) {
      return new Response(JSON.stringify({
        error: "Order ID is required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if order exists in user orders and is assigned to this courier in deliverable state
      let orderResult = await client.query(
        `SELECT id, courier_status FROM orders
         WHERE id = $1 AND courier_id = $2
         AND courier_status IN ('A courier has taken your order', 'Delivering')`,
        [orderId, courierId]
      );
      
      let orderType = 'user';
      
      // Not found in user orders, check guest orders
      if (orderResult.rows.length === 0) {
        orderResult = await client.query(
          `SELECT id, courier_status FROM guest_orders
           WHERE id = $1 AND courier_id = $2
           AND courier_status IN ('A courier has taken your order', 'Delivering')`,
          [orderId, courierId]
        );
        orderType = 'guest';
        
        if (orderResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return new Response(JSON.stringify({ 
            error: "Order not found or not assigned to you" 
          }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
      
      const courierStatus = "Delivered";
      
      // Update order status to delivered
      if (orderType === 'user') {
        await client.query(
          `UPDATE orders
           SET courier_status = $1
           WHERE id = $2`,
          [courierStatus, orderId]
        );
      } else {
        await client.query(
          `UPDATE guest_orders
           SET courier_status = $1
           WHERE id = $2`,
          [courierStatus, orderId]
        );
      }
      
      await client.query('COMMIT');
      
      return new Response(JSON.stringify({
        success: true,
        message: `Successfully completed order #${orderId}`,
        orderId,
        orderType,
        newDeliveryStatus: courierStatus
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error("Error completing order:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}