// api/orders/delivery-status/route.js - For automatic delivery status updates - for user steps
import { changeDeliveryStatus } from "../../../models/orderModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { orderId, deliveryStatus, orderType } = body;
   
    // Validate input
    if (!orderId || !deliveryStatus || typeof deliveryStatus !== 'string') {
      return new Response(JSON.stringify({
        error: "Order ID and delivery status (as string) are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    // Lista statusurilor valide pentru actualizari automatice
    const validStatuses = [
      "Order received",
      "The restaurant confirmed your order",
      "Preparing delivery"
    ];
   
    if (!validStatuses.includes(deliveryStatus)) {
      return new Response(JSON.stringify({
        error: "Invalid delivery status. Must be one of: " + validStatuses.join(", ")
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await changeDeliveryStatus(orderId, deliveryStatus, orderType);
   
    return new Response(JSON.stringify({
      success: true,
      message: result.message,
      newDeliveryStatus: result.newDeliveryStatus
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
   
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}