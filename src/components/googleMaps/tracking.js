// components/googleMaps/tracking.js
"use client"
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { useSession } from 'next-auth/react';

// 'places' este utila pentru geocodare, 'geometry' ar putea fi utila pentru calcule de distanta.
const libraries = ['places', 'geometry']; 

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const GoogleMapsTracking = ({ 
  currentOrder, 
  userLocation,
  restaurantLocations,
  courierLocation,
  onLocationUpdate,
  completeDelivery,
  updateCourierStatus
}) => {
  const { data: session } = useSession();
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 45.7597, lng: 21.2300 }); // Centrul Timisoarei
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [gpsWatchId, setGpsWatchId] = useState(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // New states for step-by-step navigation
  const [navigationState, setNavigationState] = useState('TO_RESTAURANT'); // 'TO_RESTAURANT', 'AT_RESTAURANT', 'TO_USER'
  const [currentTargetRestaurant, setCurrentTargetRestaurant] = useState(0); // Index of current restaurant
  const [pickedUpRestaurants, setPickedUpRestaurants] = useState(new Set()); // IDs of picked up restaurants
  const [orderStatus, setOrderStatus] = useState(currentOrder?.status || 'assigned');

  // Debug states
  const [debugInfo, setDebugInfo] = useState({
    restaurantsReceived: 0,
    userLocationReceived: false,
    courierLocationReceived: false
  });
  
  // Refs pentru stabilitate in useCallback/useEffect
  const mapRef = useRef(null);
  const intervalRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const lastLocationUpdateRef = useRef(0);
  const loadingTimeoutRef = useRef(null);
  
  // Verifica daca utilizatorul este curier
  const isCourier = useMemo(() => {
    return session?.user?.userType === 'courier';
  }, [session]);

  // Memoizeaza valorile pentru a evita re-render-urile inutile
  const memoizedOrder = useMemo(() => currentOrder, [currentOrder?.id, currentOrder?.courier_id]);
  
  const memoizedUserLocation = useMemo(() => {
    console.log('Memoizing user location:', userLocation);
    setDebugInfo(prev => ({ ...prev, userLocationReceived: !!userLocation }));
    return userLocation;
  }, [userLocation?.lat, userLocation?.lng]);
  
  const memoizedRestaurantLocations = useMemo(() => {
    console.log('Memoizing restaurant locations:', restaurantLocations);
    setDebugInfo(prev => ({ ...prev, restaurantsReceived: restaurantLocations?.length || 0 }));
    return restaurantLocations;
  }, [
    restaurantLocations?.length,
    restaurantLocations?.map(r => `${r.id}-${r.lat}-${r.lng}`).join(',')
  ]);
  
  const memoizedCourierLocation = useMemo(() => {
    console.log('Memoizing courier location:', courierLocation);
    setDebugInfo(prev => ({ ...prev, courierLocationReceived: !!courierLocation }));
    return courierLocation;
  }, [courierLocation?.lat, courierLocation?.lng]);

  // Get current target restaurant
  const getCurrentTargetRestaurant = useMemo(() => {
    if (!memoizedRestaurantLocations?.length) return null;
    
    // Find next unpicked restaurant
    const unpickedRestaurants = memoizedRestaurantLocations.filter(r => !pickedUpRestaurants.has(r.id));
    return unpickedRestaurants.length > 0 ? unpickedRestaurants[0] : null;
  }, [memoizedRestaurantLocations, pickedUpRestaurants]);

  // Update navigation state based on progress
  useEffect(() => {
    if (isCourier && memoizedRestaurantLocations?.length > 0) {
      const totalRestaurants = memoizedRestaurantLocations.length;
      const pickedUp = pickedUpRestaurants.size;

      if (pickedUp === 0) {
        setNavigationState('TO_RESTAURANT');
      } else if (pickedUp < totalRestaurants) {
        setNavigationState('TO_RESTAURANT'); // Still picking up from restaurants
      } else {
        setNavigationState('TO_USER'); // All restaurants picked up, go to user
      }
    }
  }, [isCourier, memoizedRestaurantLocations?.length, pickedUpRestaurants.size]);

  // Function to mark restaurant as picked up - Modified to handle local transitions
  const markRestaurantPickedUp = useCallback((restaurantId) => {
    try {
      // Update local state
      setPickedUpRestaurants(prev => new Set([...prev, restaurantId]));
      console.log(`Restaurant ${restaurantId} picked up`);
    } catch (error) {
      console.error('Error recording pickup:', error);
      // Revert local state on error
      setPickedUpRestaurants(prev => {
        const newSet = new Set(prev);
        newSet.delete(restaurantId);
        return newSet;
      });
    }
  }, []);

  useEffect(() => {
    const totalRestaurants = memoizedRestaurantLocations?.length || 0;
    if (pickedUpRestaurants.size === totalRestaurants && totalRestaurants > 0) {
      console.log('All restaurants picked up, transitioning to delivery phase');
      setOrderStatus('picked_up');
      setNavigationState('TO_USER');

      if (updateCourierStatus) {
        updateCourierStatus(memoizedOrder.id, "Delivering");
      }
    }
  }, [pickedUpRestaurants, memoizedRestaurantLocations?.length, memoizedOrder?.id, updateCourierStatus]);

  // Timeout pentru loading pentru a evita loading-ul infinit
  useEffect(() => {
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('Loading timeout reached, proceeding with available data');
        setIsLoading(false);
        setError(null);
      }, 15000); // 15 secunde timeout
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading]);

  // Creeaza icon-uri personalizate cu Heroicons - DOAR dupa ce Google Maps este incarcat
  const createCustomMarkerIcons = useCallback(() => {
    if (!window.google || !mapsLoaded) return {};
    
    return {
      restaurant: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="23" fill="#dc2626" stroke="#fff" stroke-width="3"/>
            <svg x="10" y="10" width="30" height="30" viewBox="0 0 24 24" fill="#fff">
              <path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z" clip-rule="evenodd"/>
            </svg>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(50, 50),
        anchor: new window.google.maps.Point(25, 50)
      },
      restaurantPickedUp: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="23" fill="#059669" stroke="#fff" stroke-width="3"/>
            <svg x="10" y="10" width="30" height="30" viewBox="0 0 24 24" fill="#fff">
              <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd"/>
            </svg>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(50, 50),
        anchor: new window.google.maps.Point(25, 50)
      },
      restaurantTarget: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="28" fill="#f59e0b" stroke="#fff" stroke-width="4"/>
            <circle cx="30" cy="30" r="20" fill="#fff" opacity="0.3"/>
            <circle cx="30" cy="30" r="12" fill="#fff"/>
            <svg x="18" y="18" width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b">
              <path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z" clip-rule="evenodd"/>
            </svg>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(60, 60),
        anchor: new window.google.maps.Point(30, 60)
      },
      courier: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="23" fill="#2563eb" stroke="#fff" stroke-width="3"/>
            <path d="M8 23h20v10H8zm20-2.5h7.5l2.5 5v7.5h-2.5v-2.5h-7.5v2.5H25v-7.5z" fill="#fff"/>
            <circle cx="15" cy="35" r="2.5" fill="#fff"/>
            <circle cx="35" cy="35" r="2.5" fill="#fff"/>
            <path d="M12.5 20v-5h10v5" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(50, 50),
        anchor: new window.google.maps.Point(25, 50)
      },
      user: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="23" fill="#059669" stroke="#fff" stroke-width="3"/>
            <path d="M25 15a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" fill="#fff"/>
            <path d="M12.5 37.5a12.5 12.5 0 1 1 25 0v1.25H12.5v-1.25z" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(50, 50),
        anchor: new window.google.maps.Point(25, 50)
      },
      userTarget: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="28" fill="#059669" stroke="#fff" stroke-width="4"/>
            <circle cx="30" cy="30" r="20" fill="#fff" opacity="0.3"/>
            <circle cx="30" cy="30" r="12" fill="#fff"/>
            <path d="M30 20a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" fill="#059669"/>
            <path d="M17.5 42.5a12.5 12.5 0 1 1 25 0v1.25H17.5v-1.25z" fill="#059669"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(60, 60),
        anchor: new window.google.maps.Point(30, 60)
      }
    };
  }, [mapsLoaded]);

  const markerIcons = useMemo(() => {
    return createCustomMarkerIcons();
  }, [createCustomMarkerIcons]);

  // Functie pentru a actualiza locatia curierului pe server (doar pentru curier)
  const updateCourierLocationOnServer = useCallback(async (latitude, longitude, accuracy = null, speed = null, orderType) => {
    if (!isCourier || !memoizedOrder?.id) {
      console.log('Not a courier or no order assigned, skipping server location update.');
      return;
    }

    // Throttle updates - max 1 per 10 seconds
    const now = Date.now();
    if (now - lastLocationUpdateRef.current < 10000) {
      return;
    }
    lastLocationUpdateRef.current = now;

    try {
      const response = await fetch('/api/courier/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: memoizedOrder.id,
          latitude: latitude,
          longitude: longitude,
          accuracy: accuracy,
          speed: speed,
          orderType: orderType
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Courier location updated on server:', data);
        
        // Notify parent component about location update
        if (onLocationUpdate) {
          onLocationUpdate({
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to update courier location on server:', errorData.error);
        setError(errorData.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating courier location:', error);
      setError('Network error updating location');
    }
  }, [isCourier, memoizedOrder?.id, onLocationUpdate]);

  // Functie pentru a incepe tracking-ul GPS (doar pentru curier)
  const startGPSTracking = useCallback(() => {
    if (!isCourier || !navigator.geolocation) {
      console.log('GPS tracking not available or user is not a courier');
      setIsGpsActive(false);
      return;
    }

    if (gpsWatchId) {
        console.log('GPS tracking already active.');
        return;
    }

    console.log('Starting GPS tracking for courier');
    setIsGpsActive(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed } = position.coords;
        console.log('GPS position updated:', { latitude, longitude, accuracy, speed });
        
        updateCourierLocationOnServer(latitude, longitude, accuracy, speed, currentOrder.order_type);
      },
      (error) => {
        console.error('GPS error:', error);
        setIsGpsActive(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enable location services for this site.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            console.log('GPS timeout, trying again...');
            setIsGpsActive(false);
            break;
          default:
            setError(`An unknown GPS error occurred: ${error.message}`);
            break;
        }
      },
      options
    );

    setGpsWatchId(watchId);
  }, [isCourier, gpsWatchId, updateCourierLocationOnServer, currentOrder]);

  // Functie pentru a opri tracking-ul GPS
  const stopGPSTracking = useCallback(() => {
    if (gpsWatchId) {
      navigator.geolocation.clearWatch(gpsWatchId);
      setGpsWatchId(null);
      setIsGpsActive(false);
      console.log('GPS tracking stopped');
    }
  }, [gpsWatchId]);

  // Seteaza centrul hartii cu logica stabila
  useEffect(() => {
    let newCenter = { lat: 45.7597, lng: 21.2300 }; // Default Timisoara

    if (memoizedCourierLocation) {
      newCenter = memoizedCourierLocation;
    } else if (getCurrentTargetRestaurant) {
      newCenter = { lat: getCurrentTargetRestaurant.lat, lng: getCurrentTargetRestaurant.lng };
    } else if (memoizedRestaurantLocations?.length > 0) {
      const validRestaurant = memoizedRestaurantLocations.find(r => 
        r.lat && r.lng && !isNaN(r.lat) && !isNaN(r.lng)
      );
      if (validRestaurant) {
        newCenter = { lat: validRestaurant.lat, lng: validRestaurant.lng };
      }
    } else if (memoizedUserLocation?.lat && memoizedUserLocation?.lng) {
      newCenter = memoizedUserLocation;
    }

    setMapCenter(prev => {
      if (Math.abs(prev.lat - newCenter.lat) > 0.000001 || 
          Math.abs(prev.lng - newCenter.lng) > 0.000001) {
        return newCenter;
      }
      return prev;
    });
  }, [memoizedCourierLocation, getCurrentTargetRestaurant, memoizedRestaurantLocations, memoizedUserLocation]);

  // Calculeaza directions cu step-by-step navigation (DOAR pentru curier)
  const calculateDirections = useCallback(() => {
    if (!mapRef.current || !window.google || !mapsLoaded || !initialLoadComplete) {
      console.log('Skipping directions calculation: Map not ready or not initialized.');
      return;
    }

    if (!isCourier) {
      setDirections(null);
      return;
    }

    const validRestaurants = memoizedRestaurantLocations?.filter(r => 
      r.lat && r.lng && !isNaN(r.lat) && !isNaN(r.lng)
    ) || [];

    console.log('Calculating directions with:', {
      isCourier,
      validRestaurants: validRestaurants.length,
      userLocation: memoizedUserLocation,
      courierLocation: memoizedCourierLocation,
      navigationState,
      currentTarget: getCurrentTargetRestaurant
    });

    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }

    let origin = memoizedCourierLocation;
    let destination = null;
    let waypoints = [];

    if (navigationState === 'TO_RESTAURANT' && getCurrentTargetRestaurant) {
      // Navigate to current target restaurant
      destination = { lat: getCurrentTargetRestaurant.lat, lng: getCurrentTargetRestaurant.lng };
    } else if (navigationState === 'TO_USER' && memoizedUserLocation?.lat && memoizedUserLocation?.lng) {
      // Navigate to user after picking up all restaurants
      destination = memoizedUserLocation;
    }

    if (!origin || !destination) {
      console.log('Not enough points for directions:', { origin, destination });
      setDirections(null);
      return;
    }

    if (origin.lat === destination.lat && origin.lng === destination.lng) {
      console.log('Origin and destination are the same, skipping directions.');
      setDirections(null);
      return;
    }

    console.log('Calculating directions from', origin, 'to', destination);

    directionsServiceRef.current.route({
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirections(result);
        console.log('Directions calculated successfully for', navigationState);
      } else {
        console.error('Directions request failed:', status);
        setDirections(null);
        setError(`Failed to calculate route: ${status}`);
      }
    });
  }, [memoizedRestaurantLocations, memoizedCourierLocation, memoizedUserLocation, mapsLoaded, initialLoadComplete, isCourier, navigationState, getCurrentTargetRestaurant]);

  // GPS tracking pentru curier
  useEffect(() => {
    if (isCourier && memoizedOrder?.id && session?.user?.email && mapsLoaded && !gpsWatchId) {
        startGPSTracking();
    }

    return () => {
        if (!isCourier || !memoizedOrder?.id || !session?.user?.email) {
            stopGPSTracking();
        }
    };
  }, [isCourier, memoizedOrder?.id, session?.user?.email, mapsLoaded, startGPSTracking, stopGPSTracking, gpsWatchId]);

  // Calculare directions cu debounce
  useEffect(() => {
    if (!initialLoadComplete || !mapsLoaded) return;

    const timer = setTimeout(() => {
        calculateDirections();
    }, 1500);

    return () => clearTimeout(timer);
  }, [calculateDirections, initialLoadComplete, mapsLoaded, memoizedCourierLocation, memoizedRestaurantLocations, memoizedUserLocation, navigationState, getCurrentTargetRestaurant]);

  // Handle map load
  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
    setMapsLoaded(true);
    console.log('Google Map instance loaded and ready.');

    // Stop loading once map is loaded and we have location data
    setIsLoading(false);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
    setMapsLoaded(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    stopGPSTracking();
    console.log('Google Map instance unmounted.');
  }, [stopGPSTracking]);

  // Seteaza initialLoadComplete odata ce Google Maps API este disponibil
  useEffect(() => {
    if (mapsLoaded && !initialLoadComplete) {
      setInitialLoadComplete(true);
      console.log('Initial map load and setup complete.');
    }
  }, [mapsLoaded, initialLoadComplete]);

  // Verificari de baza si mesaje de stare
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-2">Google Maps API key not configured</p>
          <p className="text-xs text-gray-500">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <p className="text-red-600 font-semibold mb-2">{error}</p>
          <p className="text-sm text-gray-600">Please check your internet connection or location permissions.</p>
          <button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
              if (isCourier) {
                startGPSTracking(); 
              }
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading logic - only show loading if maps not loaded yet
  if (isLoading && !mapsLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading map and location data...</p>
          {isCourier && (
            <p className="text-sm text-blue-600 mt-2">Initializing GPS tracking and preparing route...</p>
          )}
          {!isCourier && (
            <p className="text-sm text-gray-600 mt-2">Loading restaurant locations and map...</p>
          )}
          {/* Debug info during loading */}
          <div className="mt-3 text-xs text-gray-500">
            <p>Restaurants received: {debugInfo.restaurantsReceived}</p>
            <p>User location: {debugInfo.userLocationReceived ? 'Yes' : 'No'}</p>
            <p>Courier location: {debugInfo.courierLocationReceived ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Status indicator pentru curier */}
      {isCourier && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isGpsActive ? 'bg-green-500' : 'bg-red-500'} ${isGpsActive ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm font-medium">
            {isGpsActive ? 'GPS Active' : 'GPS Inactive'}
          </span>
          <div className="ml-4 text-xs text-gray-600">
            <span className="font-medium">
              {navigationState === 'TO_RESTAURANT' ? 
                `Going to: ${getCurrentTargetRestaurant?.name || 'Restaurant'}` : 
                navigationState === 'TO_USER' ? 'Delivering to customer' : 
                'Navigation complete'
              }
            </span>
          </div>
        </div>
      )}

      {/* Courier action buttons - Restaurant pickup */}
      {isCourier && getCurrentTargetRestaurant && navigationState === 'TO_RESTAURANT' && (
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <div className="bg-white rounded-md shadow-md p-2">
            <h3 className="font-semibold mb-1 text-sm">Current Pickup</h3>
            <p className="text-xs text-gray-600 mb-2">
              {getCurrentTargetRestaurant.name}
              {getCurrentTargetRestaurant.street_address && (
                <span className="block">{getCurrentTargetRestaurant.street_address}</span>
              )}
            </p>
            <button
              onClick={() => markRestaurantPickedUp(getCurrentTargetRestaurant.id)}
              className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 transition duration-300 flex items-center justify-center"
            >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Mark as Picked Up
          </button>
        </div>
      </div>
      )}

      {/* Complete delivery button */}
      {isCourier && navigationState === 'TO_USER' && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold mb-2">Ready for Delivery</h3>
            <p className="text-sm text-gray-600 mb-3">
              All items picked up. Navigate to customer location.
            </p>
            <button
              onClick={completeDelivery}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Complete Delivery
            </button>
          </div>
        </div>
      )}

      {/* Progress indicator for courier */}
      {isCourier && memoizedRestaurantLocations && memoizedRestaurantLocations.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2">
          <div className="text-sm font-medium mb-1">
            Progress: {pickedUpRestaurants.size}/{memoizedRestaurantLocations.length} restaurants
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(pickedUpRestaurants.size / memoizedRestaurantLocations.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Indicator pentru utilizatori normali */}
      {!isCourier && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${memoizedCourierLocation ? 'bg-blue-500' : 'bg-gray-400'} ${memoizedCourierLocation ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm font-medium">
            {memoizedCourierLocation ? 'Tracking courier' : 'Map ready - Waiting for courier'}
          </span>
          <span className="text-xs text-gray-500 ml-2">
            (Customer Mode)
          </span>
        </div>
      )}

      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        onLoad={() => {
          console.log('Google Maps LoadScript completed. API is ready.');
        }}
        onError={(err) => {
          console.error('Google Maps LoadScript error:', err);
          setError('Failed to load Google Maps API.');
          setIsLoading(false);
        }}
        loadingElement={
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading Google Maps...</p>
                </div>
            </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={map ? map.getZoom() : 13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {/* Restaurant markers */}
          {mapsLoaded && memoizedRestaurantLocations && memoizedRestaurantLocations.map((restaurant) => {
            if (!restaurant.lat || !restaurant.lng || isNaN(restaurant.lat) || isNaN(restaurant.lng)) {
              return null;
            }
            
            const isPickedUp = pickedUpRestaurants.has(restaurant.id);
            const isCurrentTarget = getCurrentTargetRestaurant?.id === restaurant.id;
            
            let icon = markerIcons.restaurant;
            if (isPickedUp) {
              icon = markerIcons.restaurantPickedUp;
            } else if (isCurrentTarget && isCourier) {
              icon = markerIcons.restaurantTarget;
            }
            
            return (
              <Marker
                key={`restaurant-${restaurant.id}`}
                position={{ lat: restaurant.lat, lng: restaurant.lng }}
                icon={icon}
                title={`${restaurant.name} ${isPickedUp ? '(Picked up)' : isCurrentTarget ? '(Next pickup)' : ''}`}
                onClick={() => setSelectedMarker({
                  type: 'restaurant',
                  data: { 
                    ...restaurant, 
                    isPickedUp, 
                    isCurrentTarget: isCurrentTarget && isCourier 
                  }
                })}
              />
            );
          })}

          {/* Courier marker */}
          {mapsLoaded && memoizedCourierLocation && memoizedOrder?.courier_id && (
            <Marker
              position={memoizedCourierLocation}
              icon={markerIcons.courier}
              title="Courier"
              onClick={() => setSelectedMarker({
                type: 'courier',
                data: { 
                  name: `Courier for Order ${memoizedOrder.id}`, 
                  lastUpdate: memoizedCourierLocation.timestamp,
                  navigationState
                }
              })}
            />
          )}

          {/* User location marker */}
          {mapsLoaded && memoizedUserLocation && memoizedUserLocation.lat && memoizedUserLocation.lng && (
            <Marker
              position={memoizedUserLocation}
              icon={navigationState === 'TO_USER' && isCourier ? markerIcons.userTarget : markerIcons.user}
              title="Your Location"
              onClick={() => setSelectedMarker({
                type: 'user',
                data: { 
                  name: 'Your Location',
                  address: memoizedOrder?.street_address || 'Your delivery address',
                  isTarget: navigationState === 'TO_USER' && isCourier
                }
              })}
            />
          )}

          {/* Directions - DOAR pentru curier */}
          {mapsLoaded && directions && isCourier && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: navigationState === 'TO_RESTAURANT' ? '#f59e0b' : '#2563eb',
                  strokeWeight: 4,
                  strokeOpacity: 0.8
                }
              }}
            />
          )}

          {/* Info window */}
          {mapsLoaded && selectedMarker && (
            <InfoWindow
              position={selectedMarker.type === 'restaurant' ? 
                { lat: selectedMarker.data.lat, lng: selectedMarker.data.lng } :
                selectedMarker.type === 'courier' ? memoizedCourierLocation : memoizedUserLocation
              }
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-3 max-w-sm">
                <h3 className="font-semibold mb-2">
                  {selectedMarker.type === 'courier' ? 'Courier' : selectedMarker.data.name}
                </h3>
                
                {selectedMarker.type === 'restaurant' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedMarker.data.street_address || selectedMarker.data.formatted_address}
                    </p>
                    {selectedMarker.data.isPickedUp && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mb-1">
                        Picked up
                      </span>
                    )}
                    {selectedMarker.data.isCurrentTarget && (
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full mb-1">
                        Next pickup
                      </span>
                    )}
                  </div>
                )}
                
                {selectedMarker.type === 'courier' && (
                  <div>
                    {selectedMarker.data.lastUpdate && (
                      <p className="text-sm text-gray-600 mb-1">
                        Last update: {new Date(selectedMarker.data.lastUpdate).toLocaleTimeString()}
                      </p>
                    )}
                    <p className="text-sm text-blue-600">
                      Status: {selectedMarker.data.navigationState === 'TO_RESTAURANT' ? 
                        'Going to pickup' : 
                        selectedMarker.data.navigationState === 'TO_USER' ? 
                        'Delivering to customer' : 'Complete'}
                    </p>
                  </div>
                )}
                
                {selectedMarker.type === 'user' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{selectedMarker.data.address}</p>
                    {selectedMarker.data.isTarget && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Delivery destination
                      </span>
                    )}
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMapsTracking;