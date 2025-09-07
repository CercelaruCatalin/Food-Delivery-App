import { NextResponse } from "next/server";
import { getCategoryName } from "../../models/productModel";

export async function GET(req){
    try{
        const data = await req.json();
        const category_name = await(getCategoryName(data.category_id));

        if(!category_name){
            NextResponse.json({error: "Category not found!"}, {status: 404});
        }

        return NextResponse.json({
            succes: true,
            category_name: category_name
        })

    } catch (error) {
    console.error("Error fetching category name:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

}