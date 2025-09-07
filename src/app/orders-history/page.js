"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BuildingStorefrontIcon, ClockIcon, CheckCircleIcon, TruckIcon } from "@heroicons/react/24/outline";


export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check user type and redirect if necessary
  useEffect(() => {
    if (status === "loading") return;
    
    const userType = session?.user?.userType;
    
    if (!session) {
      router.push('/');
      return;
    }
    
    if (userType === 'courier') {
      router.push('/courier/dashboard');
      return;
    }
    
    if (userType !== 'user') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id || hasFetched) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/orders`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extract orders from the response and combine with products
        const { orders: ordersList, ordersProducts } = data;
        
        // Group products by order_id
        const productsByOrder = {};
        if (ordersProducts && Array.isArray(ordersProducts)) {
          ordersProducts.forEach(product => {
            if (!productsByOrder[product.order_id]) {
              productsByOrder[product.order_id] = [];
            }
            productsByOrder[product.order_id].push(product);
          });
        }
        
        // Combine orders with their products
        const ordersWithProducts = ordersList.map(order => ({
          ...order,
          products: productsByOrder[order.id] || []
        }));
        
        setOrders(ordersWithProducts);
        setHasFetched(true)
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.userType === 'user') {
      fetchOrders();
    }
  }, [session]);

  const getStatusInfo = (status) => {
    const statusMap = {
      "Order received": { color: "text-blue-600", icon: ClockIcon },
      "The restaurant confirmed your order": { color: "text-orange-600", icon: CheckCircleIcon },
      "Preparing delivery": { color: "text-yellow-600", icon: ClockIcon },
      "Delivering": { color: "text-purple-600", icon: TruckIcon },
      "Delivered": { color: "text-green-600", icon: CheckCircleIcon }
    };
    
    return statusMap[status] || { color: "text-gray-600", icon: ClockIcon };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group products by restaurant for each order
  const getRestaurantProducts = (products) => {
    const grouped = {};
    
    products.forEach((product) => {
      if (!grouped[product.restaurant_id]) {
        grouped[product.restaurant_id] = {
          restaurant_name: product.restaurant_name,
          products: []
        };
      }
      grouped[product.restaurant_id].products.push(product);
    });
    
    return Object.values(grouped);
  };

  // waiting for login
  if (status === "loading" || !session || session.user?.userType !== 'user') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 mt-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 mt-10">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 mt-10">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading orders: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 mt-10">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
          <Link 
            href="/" 
            className="bg-primary text-white rounded-full px-6 py-2 hover:bg-primaryhov transition-colors duration-200"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-16 py-8 mt-20">
      <h1 className="text-center text-primary text-4xl mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.delivery_status);
          const StatusIcon = statusInfo.icon;
          const restaurantGroups = getRestaurantProducts(order.products);
          
          return (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-primary">
              {/* Order Header */}
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="mb-2 md:mb-0">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Order #{order.id}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {formatDate(order.order_date)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className={`flex items-center ${statusInfo.color}`}>
                      <StatusIcon className="h-5 w-5 mr-2" />
                      <span className="font-medium"><span className="font-medium">{order.courier_status ? order.courier_status : order.delivery_status}</span></span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-800">
                        {order.total_price} Lei
                      </span>
                      <p className="text-sm text-gray-600">
                        {order.payment_method === 'stripe' ? 'Card Payment' : 'Cash on Delivery'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Info */}
                <div className="mt-3 text-sm text-gray-600">
                  <p>
                    <strong>Delivery Address:</strong> {order.street_address}, {order.city}, {order.postal_code}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.phone_number}
                  </p>
                  {order.delivery_date && (
                    <p>
                      <strong>Delivery Date:</strong> {formatDate(order.delivery_date)}
                    </p>
                  )}
                  {order.courier_name && (
                    <p>
                      <strong>Courier:</strong> {order.courier_name} ({order.courier_phone})
                    </p>
                  )}
                </div>
              </div>

              {/* Order Products */}
              <div className="p-4">
                {restaurantGroups.map((restaurantGroup, restaurantIndex) => (
                  <div key={restaurantIndex} className="mb-6 last:mb-0">
                    <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                      <BuildingStorefrontIcon className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{restaurantGroup.restaurant_name}</h3>
                    </div>
                    
                    {restaurantGroup.products.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex flex-col md:flex-row border-b border-gray-100 py-3 last:border-b-0">
                        <div className="md:w-1/4 mb-3 md:mb-0">
                          {item.image && (
                            <div className="relative h-24 w-24 rounded-md overflow-hidden">
                              <Image 
                                src={item.image} 
                                alt={item.name}
                                fill
                                sizes="(max-width: 96px) 100vw, 96px"
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="md:w-2/4">
                          <h4 className="text-lg font-medium text-gray-800">{item.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {item.description?.substring(0, 150)}{item.description?.length > 150 ? '...' : ''}
                          </p>
                          
                          {item.size && (
                            <p className="text-sm text-gray-500 mt-1">
                              Size: {item.size.size_name} ({item.size.price} Lei)
                            </p>
                          )}
                          
                          {item.extras && item.extras.length > 0 && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-500">Extras:</p>
                              <ul className="text-sm text-gray-500 ml-2">
                                {item.extras.map((extra, extraIndex) => (
                                  <li key={extraIndex}>• {extra.extra_name} (+{extra.price} Lei)</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="md:w-1/4 flex flex-col items-end justify-center">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-lg font-semibold text-gray-800">
                              {(item.size ? parseFloat(item.size.price) : parseFloat(item.price_per_item)) * item.quantity} Lei
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center mt-8">
        <Link 
          href="/" 
          className="text-primary hover:text-primaryhov transition-colors duration-200 inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-2">
            <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}