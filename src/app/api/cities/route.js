import { NextResponse } from "next/server";
import pool from '../../config/db.js';

export async function GET() {
  try {
    // Obtine lista de orase unice din baza de date
    const result = await pool.query('SELECT DISTINCT city FROM restaurants ORDER BY city ASC');
    
    // Extrage numele oraselor din rezultat
    const cities = result.rows.map(row => row.city);
    
    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
