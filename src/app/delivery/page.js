"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useOrder } from '../../components/OrdersContext';
import { useUser } from "../hooks/User/user";
import { useCart } from "../../components/CartContext";
import Loading from "../../components/loading/loading";
import { 
  BuildingStorefrontIcon, 
  PhoneIcon, 
  ChatBubbleLeftIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  HomeIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import GoogleMapsTracking from '../../components/googleMaps/tracking';

export default function OrderTrackingPage() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [restaurantLocations, setRestaurantLocations] = useState([]);
  const [courierLocation, setCourierLocation] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [isDeliveryCompleted, setIsDeliveryCompleted] = useState(false);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [isRestaurantsGeocoded, setIsRestaurantsGeocoded] = useState(false);
  const [orderDataLoaded, setOrderDataLoaded] = useState(false);
  
  // Use refs to prevent unnecessary re-renders
  const lastDeliveryStatusRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const statusIntervalRef = useRef(null); // New ref for status polling
  const orderIdRef = useRef(null);
  
  const {data: session, status} = useSession();
  const { user, updateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    currentOrder,
    currentOrderProducts,
    currentOrderRestaurants,
    courierActiveOrder,
    deliverySteps,
    currentStepIndex,
    getDeliveryTimeDisplay,
    getEstimatedDeliveryTime,
    fetchCurrentOrderFromDatabase,
    loading: orderLoading,
    updateDeliveryStatus,
    updateCourierStatus,
    getGuestAddressForGeocoding,
     guestDetails
  } = useOrder();

  const isCourier = session?.user?.userType === 'courier';
  
  const orderId = searchParams.get('orderId');
  
  // Load order data from URL parameter - only run once per orderId
  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderId || orderIdRef.current === orderId || orderDataLoaded) return;
      
      orderIdRef.current = orderId;
      
      try {
        await fetchCurrentOrderFromDatabase(orderId);
        setOrderDataLoaded(true);
      } catch (error) {
        console.error("Error loading order:", error);
        toast.error("Failed to load order data");
      }
    };

    loadOrderData();
  }, [orderId]);

  useEffect(() => {
    if (status === 'loading') return;
    
    const userType = session?.user?.userType;
    
    if (userType === 'courier' && !orderId) {
      router.push('/courier/dashboard');
    } else if (userType === 'admin') {
      router.push('/admin/dashboard');
    }
  }, [session?.user?.userType, status, orderId, router]);

  // check order status every 10 seconds
  useEffect(() => {
    if (isCourier || !currentOrder?.id || isDeliveryCompleted) return;
    
    const pollOrderStatus = async () => {
      try {
        // Refresh order data to get latest information
        await fetchCurrentOrderFromDatabase(currentOrder.id);
      } catch (error) {
        console.error('Error polling order status:', error);
      }
    };

    // Clear existing status interval
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }

    // Set initial status
    lastDeliveryStatusRef.current = currentOrder.delivery_status;

    // Poll every 10 seconds for customers
    statusIntervalRef.current = setInterval(pollOrderStatus, 15000);

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    };
  }, [isCourier, currentOrder?.id, currentOrder?.delivery_status, isDeliveryCompleted, fetchCurrentOrderFromDatabase]);

  // Update courier location on server - memoized callback
  const updateCourierLocationOnServer = useCallback(async (latitude, longitude, accuracy, speed, orderType) => {
    if (!currentOrder?.id) return;
    
    try {
      const response = await fetch('/api/courier/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: currentOrder.id,
          latitude,
          longitude,
          accuracy,
          speed,
          orderType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      const data = await response.json();
      console.log('Location updated successfully:', data);
    } catch (error) {
      console.error('Error updating courier location:', error);
    }
  }, [currentOrder?.id]);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation || isTrackingLocation) {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser");
      }
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // 30 seconds
    };

    const successCallback = (position) => {
      const { latitude, longitude, accuracy, speed } = position.coords;
      
      // Update courier location state
      setCourierLocation({
        lat: latitude,
        lng: longitude,
        accuracy,
        speed,
        timestamp: new Date()
      });

      // Send location to server
      updateCourierLocationOnServer(latitude, longitude, accuracy, speed, currentOrder.order_type);
      
      setLocationError(null);
    };

    const errorCallback = (error) => {
      console.error("Geolocation error:", error);
      setLocationError(`Location error: ${error.message}`);
      setIsTrackingLocation(false);
    };

    // Start watching position
    const id = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );

    setWatchId(id);
    setIsTrackingLocation(true);
  }, [updateCourierLocationOnServer, isTrackingLocation]);

  const stopLocationTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTrackingLocation(false);
  }, [watchId]);

  // Auto-start location tracking for couriers when they have an active order
  useEffect(() => {
    if (!isCourier || !currentOrder?.id || isDeliveryCompleted) {
      return;
    }

    // Auto-start tracking for couriers when they have an order
    startLocationTracking();

    // Cleanup function
    return () => {
      stopLocationTracking();
    };
  }, [isCourier, currentOrder?.id, isDeliveryCompleted]);

  // Fetch courier location for customers
  useEffect(() => {
  if (isCourier || !currentOrder?.courier_id) return;

  const fetchCourierLocation = async () => {
    try {
      const response = await fetch(`/api/courier/location?orderType=${currentOrder.order_type}&orderId=${currentOrder.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setCourierLocation({
          lat: data.location.latitude,
          lng: data.location.longitude,
          accuracy: data.location.accuracy,
          speed: data.location.speed,
          timestamp: new Date(data.location.timestamp),
          isRecent: data.location.is_recent
        });
      }
    } catch (error) {
      console.error('Error fetching courier location:', error);
    }
  };

  // Clear existing interval
  if (locationIntervalRef.current) {
    clearInterval(locationIntervalRef.current);
  }

  // Fetch immediately and then every 10 seconds
  fetchCourierLocation();
  locationIntervalRef.current = setInterval(fetchCourierLocation, 10000);

  return () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };
}, [isCourier, currentOrder?.id, currentOrder?.courier_id]);

useEffect(() => {
  if (isCourier || !currentOrder?.courier_id) return;

  const fetchCourierLocation = async () => {
    try {
      const response = await fetch(`/api/courier/location?orderType=${currentOrder.order_type}&orderId=${currentOrder.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setCourierLocation({
          lat: data.location.latitude,
          lng: data.location.longitude,
          accuracy: data.location.accuracy,
          speed: data.location.speed,
          timestamp: new Date(data.location.timestamp),
          isRecent: data.location.is_recent
        });
      }
    } catch (error) {
      console.error('Error fetching courier location:', error);
    }
  };

  // Clear existing interval
  if (locationIntervalRef.current) {
    clearInterval(locationIntervalRef.current);
  }

  // Fetch immediately and then every 10 seconds
  fetchCourierLocation();
  locationIntervalRef.current = setInterval(fetchCourierLocation, 10000);

  return () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };
}, [isCourier, currentOrder?.id, currentOrder?.courier_id, currentOrder?.order_type]);


  // Fetch user info - only run once when authentication status changes
  useEffect(() => {
    if (status !== 'authenticated' || isUserDataLoaded) return;

    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        
        const latitude = data.latitude ? parseFloat(data.latitude) : null;
        const longitude = data.longitude ? parseFloat(data.longitude) : null;
        
        const userUpdateData = {
          name: data.name || "",
          phoneNumber: data.phone_number || "",
          streetAddress: data.street_address || "",
          postalCode: data.postal_code || "",
          city: data.city || "",
          dateOfBirth: data.date_of_birth ? data.date_of_birth.split("T")[0] : "",
          longitude: longitude,
          latitude: latitude
        };
        
        updateUser(userUpdateData);
        setIsUserDataLoaded(true);
      } catch (error) {
        console.error("Error in fetchUserInfo:", error);
        toast.error("Something went wrong: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [status]);

  // Geocode user address
  useEffect(() => {
    if (!currentOrder?.id || userLocation) return;
    
    const geocodeUserAddress = async () => {
      try {
        const isGuestUser = !session?.user || !user?.latitude || !user?.longitude;
        
        if (isGuestUser || isNaN(parseFloat(user.latitude)) || isNaN(parseFloat(user.longitude))) {
          let addressToGeocode = null;
          let addressSource = '';
          
          // Pentru userii logati care nu au coordonate, foloseste adresa
          if (session?.user && user) {

            if (user.streetAddress && user.city) {
              addressToGeocode = `${user.streetAddress}, ${user.city}`;
              addressSource = 'user_profile';
              console.log('Using logged user profile address:', addressToGeocode);
            } else if (user.streetAddress) {
              addressToGeocode = user.streetAddress;
              addressSource = 'user_profile';
              console.log('Using logged user street address:', addressToGeocode);
            }
          }
          
          // Daca nu exista adresa in profilul userului, incearca guest details
          if (!addressToGeocode) {
            addressToGeocode = getGuestAddressForGeocoding();
            if (addressToGeocode) {
              addressSource = 'guest_details';
              console.log('Using guest address:', addressToGeocode);
            }
          }
          
          // Fallback la adresa din comanda
          if (!addressToGeocode && currentOrder) {
            addressToGeocode = `${currentOrder.street_address}, ${currentOrder.city}`;
            addressSource = 'order_address';
            console.log('Using order address:', addressToGeocode);
          }
          
          if (addressToGeocode) {
            try {
              const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address: addressToGeocode }),
              });
              
              if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.latitude && data.longitude) {
                  setUserLocation({
                    lat: data.latitude,
                    lng: data.longitude,
                    isGeocoded: true,
                    source: addressSource
                  });
                  console.log('Successfully geocoded address:', data, 'from:', addressSource);
                  return;
                }
              }
            } catch (geocodeError) {
              console.error("Error geocoding address:", geocodeError);
            }
          }
          
          // Fallback to default coordinates
          setUserLocation({
            lat: 45.7489,
            lng: 21.2087,
            isGeocoded: false,
            source: 'fallback'
          });
        } else {
          // Logged user with valid coordinates
          const lat = parseFloat(user.latitude);
          const lng = parseFloat(user.longitude);
          
          setUserLocation({
            lat: lat,
            lng: lng,
            isGeocoded: false,
            source: 'user_profile'
          });
          console.log('Using user profile coordinates:', { lat, lng });
        }
      } catch (error) {
        console.error('Error in geocodeUserAddress:', error);
        setUserLocation({
          lat: 45.7489,
          lng: 21.2087,
          isGeocoded: false,
          source: 'fallback'
        });
      }
    };
    
    geocodeUserAddress();
  }, [currentOrder?.id, currentOrder?.street_address, currentOrder?.city, user?.latitude, user?.longitude, user?.streetAddress, user?.city, session?.user, guestDetails]);

  // Geocode restaurant addresses - only run once when restaurants are loaded
  useEffect(() => {
    if (!currentOrderRestaurants?.length || isRestaurantsGeocoded) return;

    const geocodeRestaurantAddresses = async () => {
      try {
        const locations = [];
        
        for (const restaurant of currentOrderRestaurants) {
          if (restaurant.latitude && restaurant.longitude) {
            locations.push({
              id: restaurant.id,
              name: restaurant.name,
              lat: parseFloat(restaurant.latitude),
              lng: parseFloat(restaurant.longitude),
              address: `${restaurant.street_address}, ${restaurant.city}`
            });
          } else {
            const fullAddress = `${restaurant.street_address}, ${restaurant.city}`;
            
            try {
              const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address: fullAddress }),
              });

              if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.latitude && data.longitude) {
                  locations.push({
                    id: restaurant.id,
                    name: restaurant.name,
                    lat: data.latitude,
                    lng: data.longitude,
                    address: fullAddress
                  });
                } else {
                  locations.push({
                    id: restaurant.id,
                    name: restaurant.name,
                    lat: 45.7489 + (Math.random() - 0.5) * 0.01,
                    lng: 21.2087 + (Math.random() - 0.5) * 0.01,
                    address: fullAddress,
                    isFallback: true
                  });
                }
              } else {
                locations.push({
                  id: restaurant.id,
                  name: restaurant.name,
                  lat: 45.7489 + (Math.random() - 0.5) * 0.01,
                  lng: 21.2087 + (Math.random() - 0.5) * 0.01,
                  address: fullAddress,
                  isFallback: true
                });
              }
            } catch (geocodeError) {
              console.error('Error geocoding restaurant:', restaurant.name, geocodeError);
              locations.push({
                id: restaurant.id,
                name: restaurant.name,
                lat: 45.7489 + (Math.random() - 0.5) * 0.01,
                lng: 21.2087 + (Math.random() - 0.5) * 0.01,
                address: fullAddress,
                isFallback: true
              });
            }
          }
        }
        
        setRestaurantLocations(locations);
        setIsRestaurantsGeocoded(true);
      } catch (error) {
        console.error('Error processing restaurant addresses:', error);
        setIsRestaurantsGeocoded(true);
      }
    };

    geocodeRestaurantAddresses();
  }, [currentOrderRestaurants?.length]);

  // Complete delivery function for couriers - memoized
  const completeDelivery = useCallback(async () => {
    if (!currentOrder?.id) return;
    
    try {
      const response = await fetch('/api/orders/complete-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId: currentOrder.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete delivery');
      }

      const data = await response.json();
      toast.success("Delivery completed successfully!");
      
      // Stop location tracking
      stopLocationTracking();
      setIsDeliveryCompleted(true);
      
      // Redirect to courier dashboard after a delay
      setTimeout(() => {
        router.push('/courier/dashboard')
      }, 2000);

      
    } catch(error) {
      console.error("Error completing delivery:", error);
      toast.error("Failed to complete delivery: " + error.message);
    }
  }, [currentOrder?.id, stopLocationTracking, router]);
  
  // Group products by restaurant - memoized
  const groupRestaurantProducts = useCallback(() => {
    if (!currentOrderRestaurants || !currentOrderProducts) return [];
    
    const grouped = {};
    
    currentOrderRestaurants.forEach(restaurant => {
      grouped[restaurant.id] = {
        restaurant,
        products: []
      };
    });
    
    currentOrderProducts.forEach((product, index) => {
      if (product.restaurant_id && grouped[product.restaurant_id]) {
        grouped[product.restaurant_id].products.push({
          ...product,
          originalIndex: index
        });
      }
    });
    
    return Object.values(grouped);
  }, [currentOrderRestaurants, currentOrderProducts]);

  const shouldShowMap = () => {
    return !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  };

  if (isLoading || orderLoading || !currentOrder) {
    return <Loading />;
  }

  const restaurantGroups = groupRestaurantProducts();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="font-bold text-xl text-primary">
              {isCourier ? 'Courier Dashboard' : 'FoodApp'}
            </div>
          </div>
          <div className="flex space-x-4">
            {isCourier && (
              <Link 
                href="/courier/dashboard"
                className="text-gray-600 hover:text-primaryhov"
              >
                Back to Dashboard
              </Link>
            )}
            <button className="text-gray-600 hover:text-primaryhov">
              {isCourier ? 'Settings' : 'My Account'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Courier Controls */}
        {isCourier && (
          <div className="bg-white rounded-lg shadow-md mb-4 p-6">   
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">Tracking Status:</p>
                <p className={isTrackingLocation ? 'text-green-600' : 'text-red-600'}>
                  {isTrackingLocation ? 'Active (Auto)' : 'Inactive'}
                </p>
              </div>
              
              {courierLocation && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Last Location:</p>
                  <p className="text-gray-600">
                    {courierLocation.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">Delivery Status:</p>
                <p className={isDeliveryCompleted ? 'text-green-600' : 'text-blue-600'}>
                  {isDeliveryCompleted ? 'Completed' : 'In Progress'}
                </p>
              </div>
              
              {locationError && (
                <div className="bg-red-50 p-3 rounded md:col-span-3">
                  <p className="font-medium text-red-600">Error:</p>
                  <p className="text-red-600 text-xs">{locationError}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-md mb-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-semibold">Order #{currentOrder.id}</h1>
              
              {/* Show both statuses */}
              <div className="flex flex-col space-y-1">
                <p className="text-sm text-gray-600">
                  Kitchen: <span className="font-medium text-orange-600">
                    {currentOrder.delivery_status || 'Order received'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Courier: <span className={`font-medium ${
                    currentOrder.courier_status === 'delivered' ? 'text-green-600' :
                    currentOrder.courier_status ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {currentOrder.courier_status ? 
                      currentOrder.courier_status.charAt(0).toUpperCase() + 
                      currentOrder.courier_status.slice(1).replace('_', ' ') : 
                      'Not assigned'
                    }
                  </span>
                </p>
              </div>
              
              {isCourier && (
                <p className="text-sm text-gray-600 mt-1">
                  Customer: {currentOrder.street_address}, {currentOrder.city}
                </p>
              )}
            </div>
            <div className="bg-blue-100 px-4 py-2 rounded-full">
              <p className="font-medium">
                {currentOrder.courier_status === 'delivered'
                  ? "Order completed" 
                  : `Estimated delivery: ${getEstimatedDeliveryTime()}`}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex flex-col space-y-4">
              {deliverySteps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = currentStepIndex === index && !step.completed;
                const isAutomatic = step.isAutomatic;
                
                return (
                  <div key={index} className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-primary' : 
                        isActive ? 'bg-primary/70 ring-2 ring-primary/30' : 'bg-gray-200'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          step.completed || isActive ? 'text-white' : 'text-gray-500'
                        }`} />
                      </div>
                      {index < deliverySteps.length - 1 && (
                        <div className={`h-10 w-0.5 ${
                          step.completed ? 'bg-primary' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${
                          isActive ? 'text-primary' : 
                          step.completed ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {step.title}
                          {isAutomatic && (
                            <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                              Auto
                            </span>
                          )}
                        </p>
                        
                        {/* Courier Action Buttons - only show for courier and manual steps */}
                        {isCourier && !isAutomatic && !step.completed && (
                          <div className="flex space-x-2">
                            {index === 3 && !currentOrder.courier_status && (
                              <button 
                                onClick={() => advanceCourierStep(currentOrder.id, 'taken')}
                                className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary/80"
                              >
                                Take Order
                              </button>
                            )}
                            {index === 4 && currentOrder.courier_status === 'taken' && (
                              <button 
                                onClick={() => advanceCourierStep(currentOrder.id, 'delivering')}
                                className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary/80"
                              >
                                Start Delivery
                              </button>
                            )}
                            {index === 5 && currentOrder.courier_status === 'delivering' && (
                              <button 
                                onClick={() => completeDelivery()}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              >
                                Complete Delivery
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {step.time && (
                        <p className="text-sm text-gray-500">{step.time}</p>
                      )}
                      
                      {/* Show step status */}
                      {isActive && (
                        <p className="text-xs text-primary mt-1">
                          {isAutomatic ? 'Processing...' : 'Waiting for courier action'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
          <div className="h-96 bg-gray-200 relative">
            {shouldShowMap() ? (
              <GoogleMapsTracking
                currentOrder={currentOrder}
                currentOrderRestaurants={currentOrderRestaurants}
                userLocation={userLocation}
                restaurantLocations={restaurantLocations}
                courierLocation={courierLocation}
                isCourier={isCourier}
                onLocationUpdate={(location) => {
                  console.log('Location updated:', location);

                  // setCourierLocation(location);
                }}
                completeDelivery={completeDelivery}
                updateCourierStatus={updateCourierStatus}
                updateDeliveryStatus={updateDeliveryStatus}

                fetchCurrentOrderFromDatabase={fetchCurrentOrderFromDatabase}
                deliverySteps={deliverySteps}
                currentStepIndex={currentStepIndex}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Google Maps integration requires API key</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
                  </p>
                  <div className="flex justify-center space-x-8">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mb-1">
                        <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-gray-600">
                        {restaurantLocations.length > 0 ? 
                          `${restaurantLocations.length} Restaurant(s)` : 
                          'Restaurant'}
                      </span>
                    </div>
                    {(currentOrder?.courier_id || isCourier) && (
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-1">
                          <TruckIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-gray-600">
                          {isCourier ? 'You' : (currentOrder?.courier_name || 'Courier')}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                        <HomeIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-gray-600">
                        {isCourier ? 'Customer' : 'Your Location'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Courier Info - only shown if courier exists and user is not the courier */}
        {currentOrder.courier_id && !isCourier && (
          <div className="bg-white rounded-lg shadow-md mb-4 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold mb-1">
                  Your courier: {currentOrder.courier_name || "On the way"}
                </h2>
                <p className="text-gray-600">
                  {currentStepIndex >= 3 ? "On the way to your address" : "Waiting for the food"}
                </p>
                {courierLocation && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last seen: {courierLocation.timestamp.toLocaleTimeString()}
                    {courierLocation.isRecent ? ' (Live)' : ' (Delayed)'}
                  </p>
                )}
              </div>
              {currentOrder.courier_phone && (
                <div className="flex space-x-3">
                  <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                    <PhoneIcon className="w-5 h-5 text-primary" />
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-primary" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md mb-4">
          <div className="p-6">
            <h2 className="font-semibold mb-4">Delivery details</h2>
            
            {/* Delivery Time Info */}
            {currentOrder.delivery_date && 
             new Date(currentOrder.delivery_date) > new Date(currentOrder.order_date) && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center text-primary">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">Scheduled delivery: {getDeliveryTimeDisplay()}</span>
                </div>
              </div>
            )}
            
            {/* Order Items - Grouped by Restaurant */}
            <div className="mb-4">
              {restaurantGroups.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in this order</p>
              ) : (
                restaurantGroups.map((restaurantGroup, restaurantIndex) => (
                  <div key={restaurantIndex} className="mb-6 last:mb-0">
                    <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                      <BuildingStorefrontIcon className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{restaurantGroup.restaurant.name}</h3>
                      {isCourier && (
                        <span className="ml-auto text-sm text-gray-500">
                          {restaurantGroup.restaurant.street_address}
                        </span>
                      )}
                    </div>
                    
                    {restaurantGroup.products.map((item) => (
                      <div key={item.order_item_id} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{item.quantity}x</span>
                            <span>{item.name}</span>
                          </div>
                          {item.extras && item.extras.length > 0 && (
                            <div className="ml-6 text-xs text-gray-500">
                              {item.extras.map((extra, index) => (
                                <div key={index}>+ {extra.extra_name}</div>
                              ))}
                            </div>
                          )}
                          {item.size && (
                            <div className="ml-6 text-xs text-gray-500">
                              Size: {item.size.size_name}
                            </div>
                          )}
                        </div>
                        <span>{Number(item.size ? item.size.price : item.price_per_item).toFixed(2)} lei</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
            
            
            {/* Payment Details */}
             <div className="border-t border-gray-100 pt-4">
              {currentOrder && (
                <>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{Number(currentOrder.total_price - 10).toFixed(2)} lei</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>10.00 lei</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold">
                    <span>Total</span>
                    <span>{Number(currentOrder.total_price).toFixed(2)} lei</span>
                  </div>
                  <div className="flex items-center mt-2">
                    {currentOrder.payment_method === "card" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                    <span>Paid with {currentOrder.payment_method}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Courier-specific delivery info */}
        {isCourier && (
          <div className="bg-white rounded-lg shadow-md mb-4 p-6">
            <h2 className="font-semibold mb-4">Delivery Information</h2>
            
            {/* Customer Address */}
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-start">
                <HomeIcon className="h-5 w-5 text-green-600 mr-2 mt-1" />
                <div>
                  <p className="font-medium text-green-800">Customer Address</p>
                  <p className="text-green-700">{currentOrder.street_address}</p>
                  <p className="text-green-700">{currentOrder.city}, {currentOrder.postal_code}</p>
                  {currentOrder.phone_number && (
                    <p className="text-green-700 mt-1">
                      <PhoneIcon className="h-4 w-4 inline mr-1" />
                      {currentOrder.phone_number}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Restaurant Addresses */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Restaurant Pickups</h3>
              {currentOrderRestaurants.map((restaurant, index) => (
                <div key={restaurant.id} className="mb-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-start">
                    <BuildingStorefrontIcon className="h-5 w-5 text-red-600 mr-2 mt-1" />
                    <div>
                      <p className="font-medium text-red-800">{restaurant.name}</p>
                      <p className="text-red-700">{restaurant.street_address}</p>
                      <p className="text-red-700">{restaurant.city}</p>
                      {restaurant.phone_number && (
                        <p className="text-red-700 mt-1">
                          <PhoneIcon className="h-4 w-4 inline mr-1" />
                          {restaurant.phone_number}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Notes */}
            {currentOrder.delivery_notes && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="font-medium text-blue-800">Delivery Notes</p>
                <p className="text-blue-700">{currentOrder.delivery_notes}</p>
              </div>
            )}

          </div>
        )}

        {/* Support Section */}
        {!isCourier && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex space-x-3">
              <button className="border border-primary text-primary py-2 px-4 rounded-lg hover:bg-blue-50 flex-1">
                Cancel Order
              </button>
            </div>
          </div>
        )}

        {/* Order Summary for Courier */}
        {isCourier && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 className="font-semibold mb-3">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="font-medium">
                  {new Date(currentOrder.order_date).toLocaleDateString('ro-RO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">{currentOrder.payment_method}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="font-medium text-green-600">{Number(currentOrder.total_price).toFixed(2)} lei</p>
              </div>
              <div>
                <p className="text-gray-600">Items Count</p>
                <p className="font-medium">{currentOrderProducts.length} items</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Status for Courier */}
        {isCourier && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="font-semibold mb-3">Location Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Your Location:</span>
                <span className={courierLocation ? 'text-green-600' : 'text-red-600'}>
                  {courierLocation ? 'Active' : 'Not Available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Location:</span>
                <span className={userLocation ? 'text-green-600' : 'text-red-600'}>
                  {userLocation ? 'Available' : 'Not Available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Restaurant(s):</span>
                <span className={restaurantLocations.length > 0 ? 'text-green-600' : 'text-red-600'}>
                  {restaurantLocations.length > 0 ? `${restaurantLocations.length} Located` : 'Not Available'}
                </span>
              </div>
              
              {courierLocation && (
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">
                    Last update: {courierLocation.timestamp.toLocaleString()}
                  </p>
                  {courierLocation.accuracy && (
                    <p className="text-xs text-gray-600">
                      Accuracy: {Math.round(courierLocation.accuracy)}m
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}