import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { resolveUserId } from "../../../models/userModel";
import pool from "../../../config/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
   
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { latitude, longitude } = await request.json();
    
    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const userId = await resolveUserId(session.user.email);
    const client = await pool.connect();
    
    try {
      const updateQuery = `
        UPDATE users
        SET latitude = $1, longitude = $2, updated_at = NOW()
        WHERE id = $3
      `;
     
      await client.query(updateQuery, [
        parseFloat(latitude), 
        parseFloat(longitude), 
        userId
      ]);

      return NextResponse.json({
        success: true,
        message: 'Location updated successfully',
        location: { 
          latitude: parseFloat(latitude), 
          longitude: parseFloat(longitude)
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating user location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}