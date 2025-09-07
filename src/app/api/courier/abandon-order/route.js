//api/courier/abandon-order/rout.js

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
    console.log("Abandoning order - Courier ID:", courierId); // Debug log
   
    if (!courierId) {
      return new Response(JSON.stringify({ error: "Access denied - Courier only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    const body = await req.json();
    const { orderId } = body;
    console.log("Abandoning order - Order ID:", orderId); // Debug log
   
    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    const client = await pool.connect();
   
    try {
      await client.query('BEGIN');
     
      // Check in `orders` table first - only orders in courier steps can be abandoned
      let orderResult = await client.query(
        `SELECT id, courier_status, courier_id FROM orders
         WHERE id = $1 AND courier_id = $2
         AND courier_status IN ('A courier has taken your order', 'Delivering')`,
        [orderId, courierId]
      );
     
      let orderType = 'user';
      console.log("User orders check result:", orderResult.rows); // Debug log
     
      // Not found in user orders, check guest orders
      if (orderResult.rows.length === 0) {
        orderResult = await client.query(
          `SELECT id, courier_status, courier_id FROM guest_orders
           WHERE id = $1 AND courier_id = $2
           AND courier_status IN ('A courier has taken your order', 'Delivering')`,
          [orderId, courierId]
        );
        orderType = 'guest';
        console.log("Guest orders check result:", orderResult.rows); // Debug log
       
        if (orderResult.rows.length === 0) {
          await client.query('ROLLBACK');
          
          // Additional debug: check if order exists with any status
          const debugUserOrder = await client.query(
            `SELECT id, courier_status, courier_id FROM orders WHERE id = $1`,
            [orderId]
          );
          const debugGuestOrder = await client.query(
            `SELECT id, courier_status, courier_id FROM guest_orders WHERE id = $1`,
            [orderId]
          );
          
          console.log("Debug - User order:", debugUserOrder.rows);
          console.log("Debug - Guest order:", debugGuestOrder.rows);
          
          return new Response(JSON.stringify({ 
            error: "Order not found or not assigned to you",
            debug: {
              userOrder: debugUserOrder.rows[0] || null,
              guestOrder: debugGuestOrder.rows[0] || null,
              courierId,
              orderId
            }
          }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      const order = orderResult.rows[0];
      console.log("Order before abandoning:", order); // Debug log
     
      // Unassign courier from the order and reset status to previous step
      let updateResult;
      if (orderType === 'user') {
        updateResult = await client.query(
          `UPDATE orders
           SET courier_id = NULL, courier_status = NULL
           WHERE id = $1 AND courier_id = $2`,
          [orderId, courierId]
        );
      } else {
        updateResult = await client.query(
          `UPDATE guest_orders
           SET courier_id = NULL, courier_status = NULL
           WHERE id = $1 AND courier_id = $2`,
          [orderId, courierId]
        );
      }

      console.log("Update result - rows affected:", updateResult.rowCount); // Debug log

      if (updateResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return new Response(JSON.stringify({ 
          error: "Failed to abandon order - no rows were updated",
          debug: { orderType, orderId, courierId }
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
      console.log("Verification after abandon:", verifyResult.rows[0]); // Debug log
     
      await client.query('COMMIT');
      console.log("Abandon transaction committed successfully"); // Debug log
     
      return new Response(JSON.stringify({
        success: true,
        message: `Successfully abandoned order #${orderId}`,
        orderId,
        orderType,
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
      console.error("Transaction error during abandon:", error); // Debug log
      throw error;
    } finally {
      client.release();
    }
   
  } catch (error) {
    console.error("Error abandoning order:", error);
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