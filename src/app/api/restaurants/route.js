// api/restaurants/route.js
import { NextResponse } from "next/server";
import { getAllRestaurantsFromCity } from "../../models/restaurantModel.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
   
    if (!city) {
      return NextResponse.json(
        { error: "City parameter is required" },
        { status: 400 }
      );
    }
   
    const restaurantsResult = await getAllRestaurantsFromCity(city, category);
    const restaurants = restaurantsResult.rows;
   
    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({ restaurants: [] });
    }
   
    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}