import { NextResponse } from 'next/server';
import pool from '../../config/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Query to get all extras for a specific product with their names
    const { rows } = await pool.query(`
      SELECT pe.product_id, pe.extra_id, pe.price, e.name as extra_name
      FROM product_extras pe
      JOIN extras e ON pe.extra_id = e.extra_id
      WHERE pe.product_id = $1
    `, [productId]);

    return NextResponse.json({ extras: rows });
  } catch (error) {
    console.error('Error fetching product extras:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product extras' },
      { status: 500 }
    );
  }
}