// app/api/courier/location/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import pool from '../../../config/db';

// Helper function for database queries to ensure connection management
async function query(text, params) {
    const client = await pool.connect();
    try {
        return await client.query(text, params);
    } finally {
        client.release();
    }
}

// Helper function to get order details (for user and guest orders)
async function getOrderDetails(orderId, orderType = null) {
    let orderQuery;
    let params = [orderId];

    if (orderType === 'guest') {
        orderQuery = `
            SELECT 
                go.id,
                go.courier_id,
                go.delivery_status,
                go.guest_user_id,
                gu.name AS customer_name,
                gu.phone_number AS customer_phone,
                gu.email AS customer_email,
                c.name AS courier_name,
                c.phone_number AS courier_phone,
                c.is_active,
                'guest' AS order_type
            FROM guest_orders go
            LEFT JOIN guest_users gu ON go.guest_user_id = gu.id
            LEFT JOIN couriers c ON go.courier_id = c.id
            WHERE go.id = $1
        `;
    } else if (orderType === 'user') {
        orderQuery = `
            SELECT 
                o.id,
                o.courier_id,
                o.delivery_status,
                o.user_id,
                u.name AS customer_name,
                u.phone_number AS customer_phone,
                u.email AS customer_email,
                c.name AS courier_name,
                c.phone_number AS courier_phone,
                c.is_active,
                'user' AS order_type
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN couriers c ON o.courier_id = c.id
            WHERE o.id = $1
        `;
    } else {
        // Try both tables if order type is not specified
        orderQuery = `
            SELECT 
                o.id,
                o.courier_id,
                o.delivery_status,
                o.user_id,
                u.name AS customer_name,
                u.phone_number AS customer_phone,
                u.email AS customer_email,
                c.name AS courier_name,
                c.phone_number AS courier_phone,
                c.is_active,
                'user' AS order_type
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN couriers c ON o.courier_id = c.id
            WHERE o.id = $1
            
            UNION ALL
            
            SELECT 
                go.id,
                go.courier_id,
                go.delivery_status,
                go.guest_user_id AS user_id,
                gu.name AS customer_name,
                gu.phone_number AS customer_phone,
                gu.email AS customer_email,
                c.name AS courier_name,
                c.phone_number AS courier_phone,
                c.is_active,
                'guest' AS order_type
            FROM guest_orders go
            LEFT JOIN guest_users gu ON go.guest_user_id = gu.id
            LEFT JOIN couriers c ON go.courier_id = c.id
            WHERE go.id = $1
        `;
    }

    const result = await query(orderQuery, params);
    return result.rows.length > 0 ? result.rows[0] : null;
}

// GET /api/courier/location?orderId=123&orderType=guest
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const orderType = searchParams.get('orderType');

        console.log('GET /api/courier/location - Params:', { orderId, orderType });

        if (!orderId) {
            console.warn('GET /api/courier/location: Order ID is missing.');
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        // get order details
        const order = await getOrderDetails(orderId, orderType);

        if (!order) {
            console.warn(`GET /api/courier/location: Order with ID ${orderId} not found.`);
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        if (!order.courier_id) {
            console.warn(`GET /api/courier/location: No courier assigned to order ID ${orderId}.`);
            return NextResponse.json(
                { error: 'No courier assigned to this order yet' },
                { status: 404 }
            );
        }

        if (!order.is_active) {
            console.warn(`GET /api/courier/location: Assigned courier for order ID ${orderId} is not active.`);
            return NextResponse.json(
                { error: 'Courier assigned to this order is not active or available' },
                { status: 404 }
            );
        }

        // 3. Get the latest location of the courier for this specific order
        const locationResult = await query(`
            SELECT 
                cl.latitude,
                cl.longitude,
                cl.timestamp,
                cl.created_at,
                cl.accuracy,
                cl.speed,
                cl.order_type
            FROM courier_locations cl
            WHERE cl.order_id = $1 AND cl.courier_id = $2 AND cl.order_type = $3
            ORDER BY cl.timestamp DESC
            LIMIT 1
        `, [orderId, order.courier_id, order.order_type]);

        if (locationResult.rows.length === 0) {
            console.warn(`GET /api/courier/location: No courier location found for order ID ${orderId} and courier ID ${order.courier_id}.`);
            return NextResponse.json(
                { error: 'No courier location data available for this order yet' },
                { status: 404 }
            );
        }

        const location = locationResult.rows[0];

        // check if the location data is recent (within the last 5 minutes)
        const locationTime = new Date(location.timestamp || location.created_at);
        const now = new Date();
        const timeDiff = now - locationTime;
        const isRecent = timeDiff < 5 * 60 * 1000; // 5 minutes in milliseconds

        console.log('GET /api/courier/location - Success:', { 
            orderId, 
            courierLocation: location,
            isRecent 
        });

        //return the courier's location and detils
        return NextResponse.json({
            location: {
                latitude: parseFloat(location.latitude),
                longitude: parseFloat(location.longitude),
                timestamp: location.timestamp || location.created_at,
                accuracy: location.accuracy ? parseFloat(location.accuracy) : null,
                speed: location.speed ? parseFloat(location.speed) : null,
                is_recent: isRecent,
                age_minutes: Math.floor(timeDiff / (1000 * 60))
            },
            courier: {
                name: order.courier_name,
                phone: order.courier_phone
            },
            order: {
                id: order.id,
                delivery_status: order.delivery_status,
                order_type: order.order_type
            },
            customer: {
                name: order.customer_name,
                phone: order.customer_phone,
                email: order.customer_email || null
            }
        });

    } catch (error) {
        console.error('Error fetching courier location:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST only for courier
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.userType !== 'courier') {
            return NextResponse.json(
                { error: 'Access denied. Courier access required.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { orderId, orderType, latitude, longitude, accuracy, speed } = body;

        console.log('POST /api/courier/location - Body:', body);

        if (!orderId || !orderType || latitude === undefined || longitude === undefined) {
            return NextResponse.json(
                { error: 'Order ID, order type, latitude, and longitude are required' },
                { status: 400 }
            );
        }

        if (!['user', 'guest'].includes(orderType)) {
            return NextResponse.json(
                { error: 'Order type must be either "user" or "guest"' },
                { status: 400 }
            );
        }

        // Validate latitude and longitude
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return NextResponse.json(
                { error: 'Invalid latitude or longitude' },
                { status: 400 }
            );
        }

        const courierResult = await query(`
            SELECT id FROM couriers 
            WHERE email = $1 AND is_active = true
        `, [session.user.email]);
        
        if (courierResult.rows.length === 0) {
            console.warn(`POST /api/courier/location: Courier with email ${session.user.email} not found or inactive.`);
            return NextResponse.json(
                { error: 'Courier not found or inactive' },
                { status: 404 }
            );
        }

        const courierId = courierResult.rows[0].id;

        const order = await getOrderDetails(orderId, orderType);
        
        if (!order || order.courier_id !== courierId) {
            console.warn(`POST /api/courier/location: Courier ${courierId} is not assigned to order ID ${orderId} (${orderType}).`);
            return NextResponse.json(
                { error: 'You are not assigned to this order' },
                { status: 403 }
            );
        }

        const insertQuery = `
            INSERT INTO courier_locations (order_id, order_type, courier_id, latitude, longitude, timestamp, accuracy, speed)
            VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
            RETURNING id, timestamp
        `;

        const parsedAccuracy = accuracy !== undefined && !isNaN(parseFloat(accuracy)) ? parseFloat(accuracy) : null;
        const parsedSpeed = speed !== undefined && !isNaN(parseFloat(speed)) ? parseFloat(speed) : null;

        const insertResult = await query(insertQuery, [orderId, orderType, courierId, lat, lng, parsedAccuracy, parsedSpeed]);

        console.log('POST /api/courier/location - Success:', insertResult.rows[0]);

        return NextResponse.json({
            success: true,
            locationId: insertResult.rows[0].id,
            timestamp: insertResult.rows[0].timestamp,
            orderType: orderType
        });

    } catch (error) {
        console.error('Error updating courier location:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT batch update endpoint
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.userType !== 'courier') {
            return NextResponse.json(
                { error: 'Access denied. Courier access required.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { locations } = body;

        if (!Array.isArray(locations) || locations.length === 0) {
            return NextResponse.json(
                { error: 'Locations array is required' },
                { status: 400 }
            );
        }

        if (locations.length > 50) {
            return NextResponse.json(
                { error: 'Maximum 50 locations allowed per batch' },
                { status: 400 }
            );
        }

        const courierQuery = `SELECT id FROM couriers WHERE email = $1 AND is_active = true`;
        const courierResult = await query(courierQuery, [session.user.email]);

        if (courierResult.rows.length === 0) {
            console.warn(`PUT /api/courier/location: Courier with email ${session.user.email} not found or inactive.`);
            return NextResponse.json(
                { error: 'Courier not found or inactive' },
                { status: 404 }
            );
        }

        const courierId = courierResult.rows[0].id;

        const results = [];
        const errors = [];

        for (const location of locations) {
            try {
                const { orderId, orderType, latitude, longitude, timestamp, accuracy, speed } = location;

                if (!orderId || !orderType || latitude === undefined || longitude === undefined) {
                    errors.push({
                        location,
                        error: 'Order ID, order type, latitude, and longitude are required for each location entry.'
                    });
                    continue;
                }

                if (!['user', 'guest'].includes(orderType)) {
                    errors.push({
                        location,
                        error: 'Order type must be either "user" or "guest".'
                    });
                    continue;
                }

                const lat = parseFloat(latitude);
                const lng = parseFloat(longitude);

                if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                    errors.push({
                        location,
                        error: 'Invalid latitude or longitude for an entry.'
                    });
                    continue;
                }

                const order = await getOrderDetails(orderId, orderType);
                
                if (!order || order.courier_id !== courierId) {
                    errors.push({
                        location,
                        error: 'You are not assigned to this specific order.'
                    });
                    continue;
                }

                const locationTimestamp = timestamp ? new Date(timestamp) : new Date();
                const locationAccuracy = accuracy !== undefined && !isNaN(parseFloat(accuracy)) ? parseFloat(accuracy) : null;
                const locationSpeed = speed !== undefined && !isNaN(parseFloat(speed)) ? parseFloat(speed) : null;

                const insertQuery = `
                    INSERT INTO courier_locations (
                        order_id, 
                        order_type,
                        courier_id, 
                        latitude, 
                        longitude, 
                        timestamp,
                        accuracy,
                        speed,
                        created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
                    RETURNING id, timestamp
                `;

                const insertResult = await query(insertQuery, [
                    orderId,
                    orderType,
                    courierId,
                    lat,
                    lng,
                    locationTimestamp,
                    locationAccuracy,
                    locationSpeed
                ]);

                results.push({
                    orderId,
                    orderType,
                    locationId: insertResult.rows[0].id,
                    timestamp: insertResult.rows[0].timestamp,
                    success: true
                });

            } catch (innerError) {
                console.error(`Error processing batch location entry:`, location, innerError);
                errors.push({
                    location,
                    error: innerError.message || 'Unknown processing error.'
                });
            }
        }

        return NextResponse.json({
            success: errors.length === 0,
            processed: locations.length,
            successful: results.length,
            failed: errors.length,
            results,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error batch updating courier locations:', error);
        return NextResponse.json(
            { error: 'Internal server error during batch update' },
            { status: 500 }
        );
    }
}

// DELETE
export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.userType !== 'courier') {
            return NextResponse.json(
                { error: 'Access denied. Courier access required.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const orderType = searchParams.get('orderType');
        const daysOld = searchParams.get('daysOld') || '7';

        const parsedDaysOld = parseInt(daysOld);
        if (isNaN(parsedDaysOld) || parsedDaysOld <= 0) {
            return NextResponse.json(
                { error: 'Invalid "daysOld" parameter. Must be a positive number.' },
                { status: 400 }
            );
        }

        const courierQuery = `SELECT id FROM couriers WHERE email = $1 AND is_active = true`;
        const courierResult = await query(courierQuery, [session.user.email]);

        if (courierResult.rows.length === 0) {
            console.warn(`DELETE /api/courier/location: Courier with email ${session.user.email} not found or inactive.`);
            return NextResponse.json(
                { error: 'Courier not found or inactive' },
                { status: 404 }
            );
        }

        const courierId = courierResult.rows[0].id;

        let deleteQuery = `
            DELETE FROM courier_locations 
            WHERE courier_id = $1 
            AND timestamp < NOW() - INTERVAL '${parsedDaysOld} days'
        `;

        let queryParams = [courierId];

        if (orderId && orderType) {
            const order = await getOrderDetails(orderId, orderType);
            if (!order || order.courier_id !== courierId) {
                return NextResponse.json(
                    { error: 'You are not assigned to this order or order not found.' },
                    { status: 403 }
                );
            }
            deleteQuery += ` AND order_id = $2 AND order_type = $3`;
            queryParams.push(orderId, orderType);
        }

        deleteQuery += ` RETURNING id`;

        const deleteResult = await query(deleteQuery, queryParams);

        return NextResponse.json({
            success: true,
            deletedCount: deleteResult.rows.length,
            message: `Deleted ${deleteResult.rows.length} old location records for courier ${courierId}`
        });

    } catch (error) {
        console.error('Error deleting old courier locations:', error);
        return NextResponse.json(
            { error: 'Internal server error during delete operation' },
            { status: 500 }
        );
    }
}