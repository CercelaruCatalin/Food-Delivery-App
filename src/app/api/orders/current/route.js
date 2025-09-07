import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { resolveUserId } from "../../../models/userModel";
import { getOrderById } from "../../../models/orderModel";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
   
    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    const session = await getServerSession(authOptions);
    let userId = null;
   
    if (session?.user?.email) {
      userId = await resolveUserId(session.user.email);
    }
   
    const orderData = await getOrderById(orderId, userId);
   
    if (!orderData) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    console.log("Order data:", orderData.order);
    console.log("Formatted products:", orderData.formattedProducts);
    console.log("Restaurants:", orderData.restaurants);
   
    return new Response(JSON.stringify({
      order: orderData.order,
      orderProducts: orderData.formattedProducts,
      restaurants: orderData.restaurants || []
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
   
  } catch (error) {
    console.error("Error fetching order:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}