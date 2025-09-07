import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { resolveUserId } from "../../models/userModel";
import { 
  createCart, 
  getCartId, 
  getUserCart,
  verifyCartItemOwnership,
  syncLocalCartToDatabase,
  addItemToCart,
  addExtraToCartItem
} from "../../models/cartModel";

// Get cart
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
    
    let cartId = await getCartId(userId);
    
    if (!cartId) {
      const newCart = await createCart(userId);
      cartId = newCart.id;
    }
    
    const cartProducts = await getUserCart(userId);
    
    return new Response(JSON.stringify({ cartProducts }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error fetching cart:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// For syncing entire cart (when logging in with localStorage cart)
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const body = await req.json();
    const products = body.products || [];
    
    if (!Array.isArray(products)) {
      return new Response(JSON.stringify({ error: "Invalid products format" }), {
        status: 400,
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
    
    await syncLocalCartToDatabase(userId, products);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error updating cart:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Add item to cart
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
    const { product, size, extras = [] } = body;
    
    if (!product?.id) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), {
        status: 400,
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
    
    let cartId = await getCartId(userId);
    
    if (!cartId) {
      const newCart = await createCart(userId);
      cartId = newCart.id;
    }
    
    const cartItemId = await addItemToCart(cartId, product.id, product.restaurant_id, 1, size?.size_id || null);
    
    if (Array.isArray(extras) && extras.length > 0) {
      for (const extra of extras) {
        if (extra && extra.extra_id) {
          await addExtraToCartItem(cartItemId, extra.extra_id);
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      cartItemId 
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}