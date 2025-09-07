import { NextResponse } from 'next/server';
import pool from '../../config/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cartItemId, extraId } = await request.json();

    if (!cartItemId || !extraId) {
      return NextResponse.json({ error: 'Cart item ID and extra ID are required' }, { status: 400 });
    }

    const { rows } = await pool.query(
      'INSERT INTO cart_product_extras (cart_item_id, extra_id) VALUES ($1, $2) RETURNING *',
      [cartItemId, extraId]
    );

    return NextResponse.json({ 
      message: 'Extra added to cart item',
      cartProductExtra: rows[0] 
    });
  } catch (error) {
    console.error('Error adding extra to cart item:', error);
    return NextResponse.json(
      { error: 'Failed to add extra to cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');
    const extraId = searchParams.get('extraId');

    if (!cartItemId) {
      return NextResponse.json({ error: 'Cart item ID is required' }, { status: 400 });
    }

    let query;
    let params;

    if (extraId) {
      query = 'DELETE FROM cart_product_extras WHERE cart_item_id = $1 AND extra_id = $2';
      params = [cartItemId, extraId];
    } else {
      query = 'DELETE FROM cart_product_extras WHERE cart_item_id = $1';
      params = [cartItemId];
    }

    await pool.query(query, params);

    return NextResponse.json({ 
      message: extraId ? 'Extra removed from cart item' : 'All extras removed from cart item'
    });
  } catch (error) {
    console.error('Error removing extra from cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove extra from cart item' },
      { status: 500 }
    );
  }
}