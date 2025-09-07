import { NextResponse } from "next/server";
import { getAllCategories } from "../../models/categoryModel.js";

export async function GET() {
  try {
    const categoriesResult = await getAllCategories();
    const categories = categoriesResult.rows;
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}