import { NextResponse } from 'next/server';
import pool from '../../config/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 });
    }

    // Query to get all extras for a specific restaurant
    const { rows } = await pool.query(
      'SELECT * FROM extras WHERE restaurant_id = $1',
      [restaurantId]
    );

    return NextResponse.json({ extras: rows });
  } catch (error) {
    console.error('Error fetching restaurant extras:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant extras' },
      { status: 500 }
    );
  }
}