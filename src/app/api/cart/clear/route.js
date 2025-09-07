import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { resolveUserId } from "../../../models/userModel";
import { getCartId, clearCartProducts, getUserCart } from "../../../models/cartModel";

// Clear the entire cart
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Clear cart session:", session?.user?.email);
   
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    const userId = await resolveUserId(session.user.email);
    console.log("Clear cart userId:", userId);
   
    if (!userId) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    const cartId = await getCartId(userId);
    console.log("Clear cart cartId:", cartId);
   
    if (!cartId) {
      console.log("No cart found to clear");
      return new Response(JSON.stringify({
        success: true,
        message: "No cart found to clear"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cartBefore = await getUserCart(session.user.email);
    console.log("Cart contents before clearing:", cartBefore.length, "items");
   
    // Clear cart products
    await clearCartProducts(cartId);
    console.log("clearCartProducts completed");

    // Check cart contents after clearing
    const cartAfter = await getUserCart(session.user.email);
    console.log("Cart contents after clearing:", cartAfter.length, "items");
   
    return new Response(JSON.stringify({
      success: true,
      message: "Cart cleared successfully",
      debug: {
        cartId,
        itemsBeforeClearing: cartBefore.length,
        itemsAfterClearing: cartAfter.length
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
   
  } catch (error) {
    console.error("Error clearing cart:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}