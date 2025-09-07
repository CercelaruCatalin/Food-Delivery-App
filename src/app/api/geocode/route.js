
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { address } = await req.json();
    
    console.log("Received address:", address);
    
    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address is required" },
        { status: 400 }
      );
    }

    // Check both server-side and client-side API keys
    const serverApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const clientApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    console.log("Server API key exists:", !!serverApiKey);
    console.log("Client API key exists:", !!clientApiKey);
    
    // Use server-side API key first, fallback to client-side
    const apiKey = serverApiKey || clientApiKey;
    
    if (!apiKey) {
      console.error("No Google Maps API key found");
      return NextResponse.json(
        { success: false, error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Clean and encode the address
    const cleanAddress = address.trim().replace(/\s+/g, ' ');
    const encodedAddress = encodeURIComponent(cleanAddress);
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    console.log("Geocoding address:", cleanAddress);
    console.log("Encoded address:", encodedAddress);
    console.log("Full URL (without key):", url.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    console.log("Google Maps API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Maps API error response:", errorText);
      throw new Error(`Google Maps API returned status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log("Google Maps API response:", {
      status: data.status,
      results_count: data.results?.length || 0,
      error_message: data.error_message
    });
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      
      console.log("Geocoding successful:", {
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address
      });
      
      return NextResponse.json({
        success: true,
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: data.results[0].formatted_address
      });
    } else {
      console.error("Geocoding failed:", {
        status: data.status,
        error_message: data.error_message,
        results_count: data.results?.length || 0
      });
      
      return NextResponse.json(
        {
          success: false,
          error: `Geocoding failed: ${data.status}`,
          details: data.error_message || 'No additional details available'
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error("Error in geocoding:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message
      },
      { status: 500 }
    );
  }
}