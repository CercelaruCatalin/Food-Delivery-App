import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import {
  findUser,
} from "../../models/userModel.js";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await findUser(session.user.email, session.user.userType);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // DEBUG: Log the raw user data from database
    console.log("Raw user data from DB:", {
      id: user.id,
      email: user.email,
      latitude: user.latitude,
      longitude: user.longitude,
      latitudeType: typeof user.latitude,
      longitudeType: typeof user.longitude
    });
    
    // Filter sensitive data
    const { password, ...safeUserData } = user;
    
    // DEBUG: Log
    console.log("Safe user data being sent:", {
      id: safeUserData.id,
      email: safeUserData.email,
      latitude: safeUserData.latitude,
      longitude: safeUserData.longitude,
      latitudeType: typeof safeUserData.latitude,
      longitudeType: typeof safeUserData.longitude
    });
    
    return NextResponse.json(safeUserData);
   
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}