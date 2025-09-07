import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { resolveUserId } from "../../../models/userModel";
import { verifyCartItemOwnership, removeCartItem, updateCartItemQuantity } from "../../../models/cartModel";

// Delete cart item
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
   
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get('cartItemId');
   
    if (!cartItemId) {
      return new Response(JSON.stringify({ error: "Cart item ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    // Verify ownership of the cart item
    const isOwner = await verifyCartItemOwnership(cartItemId, session.user.email);
   
    if (!isOwner) {
      return new Response(JSON.stringify({ error: "Cart item not found or not owned by user" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    // Remove the cart item and its extras
    await removeCartItem(cartItemId);
   
    return new Response(JSON.stringify({ 
      success: true,
      message: "Item removed from cart successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
   
  } catch (error) {
    console.error("Error removing cart item:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Update cart item quantity
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
   
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    const body = await req.json();
    const { cartItemId, quantity } = body;
   
    if (!cartItemId || quantity === undefined) {
      return new Response(JSON.stringify({ error: "Cart item ID and quantity are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    if (quantity <= 0) {
      return new Response(JSON.stringify({ error: "Quantity must be a positive number" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    // Verify ownership of the cart item
    const isOwner = await verifyCartItemOwnership(cartItemId, session.user.email);
   
    if (!isOwner) {
      return new Response(JSON.stringify({ error: "Cart item not found or not owned by user" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
   
    // Update the cart item quantity
    await updateCartItemQuantity(cartItemId, quantity);
   
    return new Response(JSON.stringify({ 
      success: true,
      message: "Quantity updated successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
   
  } catch (error) {
    console.error("Error updating cart item:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}