import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getAllProductsFromRestaurant } from "../../models/productModel";
import { getRestaurant } from "../../models/restaurantModel.js";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const restaurantInfo = await getRestaurant(restaurantId);

    const restaurantProducts = await getAllProductsFromRestaurant(restaurantId);

    if (!restaurantInfo || !restaurantProducts) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json({restaurant: restaurantInfo, products: restaurantProducts});
    
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}