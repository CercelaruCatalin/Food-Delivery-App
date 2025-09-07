import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../config/db';

export async function GET(request, { params }) {
  try {
    const { orderId } = params;

    const result = await pool.query(`
      SELECT 
        o.delivery_status,
        o.courier_status,
        o.courier_id,
        c.name as courier_name,
        c.phone_number as courier_phone
      FROM orders o
      LEFT JOIN couriers c ON o.courier_id = c.id
      WHERE o.id = $1
    `, [orderId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}