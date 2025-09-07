import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { resolveUserId } from "../../../models/userModel";
import { NextResponse } from 'next/server';
import { transferGuestOrderToUser, getGuestOrdersByEmail } from "../../../models/orderModel";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
       
        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        const body = await req.json();
        const guestOrderId = body.guestOrderId || body;
       
        if (!guestOrderId) {
            return new NextResponse(JSON.stringify({ error: "Invalid guest order id" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        const userId = await resolveUserId(session.user.email);
       
        if (!userId) {
            return new NextResponse(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        // Try to transfer the specific guest order
        const transferredOrder = await transferGuestOrderToUser(guestOrderId, userId);
       
        return new Response(JSON.stringify({
            success: true,
            orderId: transferredOrder.id,
            message: "Order transferred successfully"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
       
    } catch (error) {
        console.error('Error trying to transfer the order from guest to user: ', error);
        return new NextResponse(JSON.stringify({
            error: "Internal Server Error",
            details: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// GET endpoint to find guest orders by email for potential transfer
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
       
        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        const userEmail = session.user.email;
        
        // Get all guest orders for this email
        const guestOrders = await getGuestOrdersByEmail(userEmail);
        
        return new Response(JSON.stringify({
            success: true,
            guestOrders: guestOrders,
            message: `Found ${guestOrders.length} guest orders for this email`
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
       
    } catch (error) {
        console.error('Error finding guest orders by email: ', error);
        return new NextResponse(JSON.stringify({
            error: "Internal Server Error",
            details: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}