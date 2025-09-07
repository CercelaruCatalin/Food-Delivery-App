// pages/courier/dashboard.js
'use client';
import { useState, useEffect, useContext } from 'react'; // Import useContext
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  CreditCardIcon,
  BanknotesIcon,
  CubeIcon,
  UserIcon,
  CheckCircleIcon,
  MapIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { OrderContext } from '../../../components/OrdersContext';

export default function CourierDashboard() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  const { hasActiveOrder, activeOrderId, checkActiveOrder } = useContext(OrderContext);

  // Fetch all available orders for couriers
  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/courier/available-orders');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setAvailableOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
      setAvailableOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect to check active order and fetch available orders
  useEffect(() => {
    // Only fetch available orders if there is no active order

    if (status === "authenticated" && session.user.userType === 'courier') {
      if (!hasActiveOrder) {
        fetchAvailableOrders();
      }
    }

    // Set up polling for new orders every 30 seconds
    const interval = setInterval(() => {
      checkActiveOrder();
      if (!hasActiveOrder) {
        fetchAvailableOrders();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasActiveOrder, session, status, checkActiveOrder]);

  useEffect(() => {
    if (status === "loading") return;

    const userType = session?.user?.userType;

    if (!session) {
      // Guest user - redirect to home
      router.push('/');
      return;
    }

    if (userType !== 'courier') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const acceptSingleOrder = async (orderId, orderType) => {
    if (hasActiveOrder) {
      alert('You already have an active order. Complete it first to accept new orders.');
      return;
    }

    try {
      setAccepting(orderId);

      const response = await fetch('/api/courier/accept-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          orderType: orderType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'ALREADY_HAS_ORDER') {
          alert('You already have an active order. Complete or abandon it to accept new orders.');
          checkActiveOrder();
          return;
        } else if (data.code === 'ORDER_NOT_AVAILABLE') {
          alert('This order is no longer available.');
          await fetchAvailableOrders(); // Refresh the list
          return;
        }
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to accept order');
      }

      // Success
      checkActiveOrder(); // Update context immediately after accepting
      router.push(`/delivery?orderId=${orderId}`);

    } catch (err) {
      console.error('Error accepting order:', err);
      alert(`Error accepting order: ${err.message}`);
    } finally {
      setAccepting(null);
    }
  };

  const goToActiveDelivery = () => {
    if (activeOrderId) {
      router.push(`/delivery?orderId=${activeOrderId}`);
    }
  };

  const calculateItemTotal = (item) => {
    let basePrice = 0;

    // If there's a size, use the size price, otherwise use the product price
    if (item.size && item.size.price !== null && item.size.price !== undefined) {
      basePrice = parseFloat(item.size.price) || 0;
    } else if (item.price_per_item !== null && item.price_per_item !== undefined) {
      basePrice = parseFloat(item.price_per_item) || 0;
    }

    // Add extras cost
    let extrasTotal = 0;
    if (item.extras && Array.isArray(item.extras)) {
      extrasTotal = item.extras.reduce((sum, extra) => {
        const extraPrice = parseFloat(extra.price) || 0;
        const extraQuantity = parseInt(extra.quantity) || 0;
        return sum + (extraPrice * extraQuantity);
      }, 0);
    }

    const quantity = parseInt(item.quantity) || 0;
    const total = (basePrice + extrasTotal) * quantity;

    return isNaN(total) ? 0 : total;
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  };

  const getOrderPriority = (deliveryDate) => {
    try {
      const now = new Date();
      const delivery = new Date(deliveryDate);
      const timeDiff = delivery - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      return hoursDiff <= 1 ? 'urgent' : 'normal';
    } catch (err) {
      return 'normal';
    }
  };

  const groupProductsByRestaurant = (products) => {
    if (!products || !Array.isArray(products)) return [];

    const grouped = products.reduce((acc, product) => {
      const restaurantId = product.restaurant_id;
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurant: {
            id: restaurantId,
            name: product.restaurant_name
          },
          products: []
        };
      }
      acc[restaurantId].products.push(product);
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return numPrice.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md mx-4">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAvailableOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Courier Dashboard</h1>
            <button
              onClick={() => {
                checkActiveOrder();
                fetchAvailableOrders();
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh
            </button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CubeIcon className="w-4 h-4" />
              <span>{availableOrders.length} available orders</span>
            </div>
            {hasActiveOrder && (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span className="text-green-600">You have an active delivery</span>
              </div>
            )}
          </div>
        </div>

        {/* Active Order Alert */}
        {hasActiveOrder && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  You have an active delivery (Order #{activeOrderId})
                </span>
              </div>
              <button
                onClick={goToActiveDelivery}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to Delivery
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="grid gap-6">
          {availableOrders.map((order) => {
            const priority = getOrderPriority(order.delivery_date);
            const restaurantGroups = groupProductsByRestaurant(order.products);
            const isAcceptingThis = accepting === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  hasActiveOrder
                    ? 'border-gray-200 opacity-60'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-800">
                        Order #{order.id}
                      </h2>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {priority === 'urgent' ? 'URGENT' : 'NORMAL'}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.order_type === 'user'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {order.order_type === 'user' ? 'USER' : 'GUEST'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>Ordered: {formatDateTime(order.order_date)}</span>
                        </div>
                        {order.delivery_date &&
                          <div>Delivery: {formatDateTime(order.delivery_date)}</div>
                        }
                      </div>
                      <button
                        onClick={() => acceptSingleOrder(order.id, order.order_type)}
                        disabled={hasActiveOrder || isAcceptingThis} // Disable if has active order (from context)
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          hasActiveOrder
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isAcceptingThis
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      >
                        {isAcceptingThis ? 'Accepting...' : 'Accept Delivery'}
                      </button>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Customer
                      </h3>
                      <div>
                        <h4 className="font-medium text-gray-800">{order.user_name || 'N/A'}</h4>
                        <div className="flex items-start gap-1 text-sm text-gray-600 mt-1">
                          <MapPinIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{order.street_address}, {order.city}{order.postal_code ? `, ${order.postal_code}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <PhoneIcon className="w-3 h-3" />
                          <span>{order.phone_number || 'N/A'}</span>
                        </div>
                        {order.user_email && (
                          <div className="text-sm text-gray-600 mt-1">
                            Email: {order.user_email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Restaurants Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <BuildingStorefrontIcon className="w-4 h-4" />
                        Restaurants
                      </h3>
                      <div className="space-y-2">
                        {order.restaurants && order.restaurants.length > 0 ? (
                          order.restaurants.map((restaurant) => (
                            <div key={restaurant.id} className="flex items-center gap-2">
                              <BuildingStorefrontIcon className="w-4 h-4 text-gray-400" />
                              <div>
                                <h4 className="font-medium text-gray-800">{restaurant.name}</h4>
                                <div className="text-sm text-gray-600">
                                  {restaurant.street_address}, {restaurant.city}
                                </div>
                                {restaurant.phone_number && (
                                  <div className="text-sm text-gray-600">
                                    Phone: {restaurant.phone_number}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No restaurant information available</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items - Grouped by Restaurant */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
                    <div className="space-y-4">
                      {restaurantGroups.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CubeIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p>No items in this order</p>
                        </div>
                      ) : (
                        restaurantGroups.map((restaurantGroup, restaurantIndex) => (
                          <div key={restaurantIndex} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                              <BuildingStorefrontIcon className="mr-2 h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-lg">{restaurantGroup.restaurant.name}</h4>
                            </div>

                            <div className="space-y-2">
                              {restaurantGroup.products.map((item) => (
                                <div key={item.order_item_id} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <span className="font-medium mr-2 text-blue-600">{item.quantity}x</span>
                                      <span className="font-medium">{item.name}</span>
                                    </div>
                                    {item.size && (
                                      <div className="ml-6 text-sm text-gray-600">
                                        Size: {item.size.size_name} ({formatPrice(item.size.price)} lei)
                                      </div>
                                    )}
                                    {!item.size && item.price_per_item && (
                                      <div className="ml-6 text-sm text-gray-600">
                                        Price: {formatPrice(item.price_per_item)} lei
                                      </div>
                                    )}
                                    {item.extras && item.extras.length > 0 && (
                                      <div className="ml-6 text-sm text-blue-600">
                                        {item.extras.map((extra, index) => (
                                          <div key={index}>+ {extra.extra_name} ({extra.quantity}x {formatPrice(extra.price)} lei)</div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-gray-800">
                                      {formatPrice(calculateItemTotal(item))} lei
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Payment and Total */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center gap-2 font-semibold">
                        {order.payment_method === 'card' ? (
                          <CreditCardIcon className="w-5 h-5" />
                        ) : (
                          <BanknotesIcon className="w-5 h-5" />
                        )}
                        <span>{order.payment_method === 'card' ? 'Card Payment' : 'Cash on Delivery'}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        Total: {formatPrice(order.total_price)} lei
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {availableOrders.length === 0 && !loading && !error && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No new orders available</h3>
              <p className="mt-1 text-gray-500">Check back later for more delivery opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}