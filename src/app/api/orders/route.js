import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { resolveUserId } from "../../models/userModel";
import { getUserOrders, placeUserOrder, placeGuestOrder } from "../../models/orderModel";

// Get all orders for logged-in user
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        const userId = await resolveUserId(session.user.email);
        
        if (!userId) {
            return new Response(JSON.stringify({ error: "User not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
        }
        
        const orders = await getUserOrders(userId);
        
        // Format the response
        const formattedOrders = orders.map(order => ({
            id: order.id,
            payment_method: order.payment_method,
            street_address: order.street_address,
            city: order.city,
            postal_code: order.postal_code,
            phone_number: order.phone_number,
            total_price: order.total_price,
            order_date: order.order_date,
            payment_status: order.payment_status,
            delivery_date: order.delivery_date,
            delivery_status: order.delivery_status,
            courier_status: order.courier_status,
            courier_id: order.courier_id
        }));
        
        // Get all products from all orders flattened
        const ordersProducts = [];
        orders.forEach(order => {
            order.products.forEach(product => {
                ordersProducts.push({
                    ...product,
                    order_id: order.id
                });
            });
        });
        
        return new Response(JSON.stringify({ 
            orders: formattedOrders,
            ordersProducts 
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching orders: ", error);
        return new Response(JSON.stringify({
            error: "Internal Server Error",
            details: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// Place a new order (works for both logged-in and guest users)
export async function POST(req) {
    try {
        const body = await req.json();
        const { 
        cartProducts, 
        streetAddress, 
        city, 
        postalCode, 
        phoneNumber, 
        paymentMethod,
        totalPrice,
        guestDetails,
        deliveryDate,
        paymentIntentId
        } = body;
        console.log("deliveryTimestamp route", deliveryDate);
        
        // Validate required fields
        if (!cartProducts || !Array.isArray(cartProducts) || cartProducts.length === 0) {
            return new Response(JSON.stringify({ error: "Cart is empty" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        if (!streetAddress || !city || !postalCode || !phoneNumber) {
            return new Response(JSON.stringify({ error: "Delivery address and contact information is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        if (!paymentMethod || !totalPrice) {
            return new Response(JSON.stringify({ error: "Payment method and total price are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        const session = await getServerSession(authOptions);
        
        // For logged-in users
        if (session?.user?.email) {
            const userId = await resolveUserId(session.user.email);
        
            if (!userId) {
                return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
                });
            }
        
            const placedOrder = await placeUserOrder(
            userId,
            cartProducts,
            streetAddress,
            city,
            postalCode,
            phoneNumber,
            paymentMethod,
            totalPrice,
            deliveryDate,
            paymentIntentId
            );
            
            return new Response(JSON.stringify({
                success: true,
                order: placedOrder
            }), {
                status: 201,
                headers: { "Content-Type": "application/json" },
            });
        } 
        // For guest users
        else {
            if (!guestDetails || !guestDetails.name || !guestDetails.email || !guestDetails.phone) {
                return new Response(JSON.stringify({ error: "Guest details are required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
            
            const placedOrder = await placeGuestOrder({
                name: guestDetails.name,
                email: guestDetails.email,
                phone: guestDetails.phone,
                streetAddress,
                city,
                postalCode,
                phoneNumber,
                paymentMethod,
                totalPrice,
                deliveryDate,
                paymentIntentId
                },
                cartProducts
            );
            
            return new Response(JSON.stringify({
                success: true,
                order: placedOrder
            }), {
                status: 201,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        console.error("Error placing order:", error);
        return new Response(JSON.stringify({
            error: "Internal Server Error",
            details: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}