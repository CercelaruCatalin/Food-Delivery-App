// api/courier/courier-status/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { changeCourierStatus } from "../../../models/orderModel";
import { resolveUserId } from "../../../models/userModel";

export async function PUT(req) {
  console.log('PUT /api/courier/courier-status - Request received');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.userType !== 'courier') {
      console.log('Access denied - not a courier');
      return new Response(JSON.stringify({
        error: "Access denied. Courier authentication required."
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const courierId = await resolveUserId(session?.user?.email, 'courier');

    let body;
    try {
      body = await req.json();
      console.log('Request body parsed:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({
        error: "Invalid JSON in request body"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { orderId, courierStatus } = body;
    console.log('Extracted data:', { orderId, courierStatus });
   
    // Validate input
    if (!orderId || !courierStatus || typeof courierStatus !== 'string') {
      console.log('Validation failed:', { orderId, courierStatus, type: typeof courierStatus });
      return new Response(JSON.stringify({
        error: "Order ID and courier status (as string) are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    // Valid statuses for couriers
    const validStatuses = [
      "A courier has taken your order",
      "Delivering",
      "Delivered"
    ];
   
    if (!validStatuses.includes(courierStatus)) {
      console.log('Invalid status:', courierStatus);
      return new Response(JSON.stringify({
        error: "Invalid courier status. Must be one of: " + validStatuses.join(", ")
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log('About to call changeCourierStatus with:', { orderId, courierStatus });
    
    if (typeof changeCourierStatus !== 'function') {
      console.error('changeCourierStatus is not a function:', typeof changeCourierStatus);
      throw new Error('Database function not properly imported');
    }
    
    const result = await changeCourierStatus(orderId, courierStatus, courierId);
    console.log('changeCourierStatus result:', result);
    
    // Verify result structure
    if (!result || typeof result !== 'object') {
      console.error('Invalid result from changeCourierStatus:', result);
      throw new Error('Invalid response from database function');
    }
   
    const responseData = {
      success: true,
      message: result.message || 'Courier status updated successfully',
      newCourierStatus: result.newCourierStatus || courierStatus
    };

    console.log('Sending success response:', responseData);
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
   
  } catch (error) {
    console.error("Error updating courier status:", error);
    console.error("Error stack:", error.stack);
    
    const errorResponse = {
      error: "Internal Server Error",
      details: error.message,
      timestamp: new Date().toISOString()
    };

    console.log('Sending error response:', errorResponse);
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}