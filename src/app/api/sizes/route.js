import { NextResponse } from 'next/server';
import pool from '../../config/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { rows } = await pool.query(
      'SELECT * FROM sizes WHERE product_id = $1 ORDER BY price ASC',
      [productId]
    );

    return NextResponse.json({ sizes: rows });
  } catch (error) {
    console.error('Error fetching sizes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sizes' },
      { status: 500 }
    );
  }
}