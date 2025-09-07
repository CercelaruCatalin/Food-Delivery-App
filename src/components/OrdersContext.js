'use client';
import { createContext, useState, useEffect, useContext } from "react";
import { useSession } from 'next-auth/react';
import { useCart } from "./CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { 
  BuildingStorefrontIcon, 
  ClockIcon,
  TruckIcon,
  HomeIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export const OrderContext = createContext({});

export function OrderContextProvider({ children }) {
  const { data: session, status } = useSession();
  const { clearCart, cartProducts, cartRestaurants, fetchRestaurantById } = useCart();
  const router = useRouter();

  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentOrderProducts, setCurrentOrderProducts] = useState([]);
  const [currentOrderRestaurants, setCurrentOrderRestaurants] = useState([]);
  const [ordersRestaurants, setOrdersRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderProducts, setOrderProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // New state for courier active order - will persist in localStorage
  const [courierActiveOrder, setCourierActiveOrder] = useState(null);
  const [loadingCourierOrder, setLoadingCourierOrder] = useState(false);

  // New states for managing courier's active order status in the context
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);

  // New state for delivery steps
  const [deliverySteps, setDeliverySteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // NEW: State for guest details
  const [guestDetails, setGuestDetails] = useState(null);

  const ls = typeof window !== 'undefined' ? window.localStorage : null;

  // NEW: Functions to manage guest details in localStorage
  function saveGuestDetailsToLocalStorage(details) {
    if (ls && details) {
      ls.setItem('guestDetails', JSON.stringify(details));
      setGuestDetails(details);
    }
  }

  function getGuestDetailsFromLocalStorage() {
    if (ls) {
      const stored = ls.getItem('guestDetails');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setGuestDetails(parsed);
          return parsed;
        } catch (error) {
          console.error('Error parsing guest details from localStorage:', error);
          ls.removeItem('guestDetails');
        }
      }
    }
    return null;
  }

  function clearGuestDetailsFromLocalStorage() {
    if (ls) {
      ls.removeItem('guestDetails');
    }
    setGuestDetails(null);
  }

  // NEW: Get guest address for geocoding
  function getGuestAddressForGeocoding() {
    if (guestDetails && guestDetails.streetAddress && guestDetails.city) {
      return `${guestDetails.streetAddress}, ${guestDetails.city}`;
    }
    return null;
  }

  // Updated steps split into automatic and manual
  const automaticStepsConfig = [
    { title: "Order received", offsetMinutes: 0, useOrderDate: true, icon: CheckCircleIcon },
    { title: "The restaurant confirmed your order", offsetMinutes: 3, icon: BuildingStorefrontIcon },
    { title: "Preparing delivery", offsetMinutes: 8, icon: ClockIcon }
  ];

  const manualStepsConfig = [
    { title: "A courier has taken your order", icon: UserIcon },
    { title: "Delivering", icon: TruckIcon },
    { title: "Delivered", icon: HomeIcon }
  ];

  const allStepsConfig = [...automaticStepsConfig, ...manualStepsConfig];

  // Format delivery date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if courier has an active order
  const checkActiveOrder = async () => {
    if (session?.user?.userType !== 'courier') {
      setHasActiveOrder(false);
      setActiveOrderId(null);
      return;
    }

    try {
      setLoadingCourierOrder(true);
      const response = await fetch('/api/courier/accept-order');

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.orders && data.orders.length > 0) {
          setHasActiveOrder(true);
          setActiveOrderId(data.orders[0].id);
          setCourierActiveOrder(data.orders[0]); // Also set the full active order object
        } else {
          setHasActiveOrder(false);
          setActiveOrderId(null);
          setCourierActiveOrder(null);
        }
      } else {
        setHasActiveOrder(false);
        setActiveOrderId(null);
        setCourierActiveOrder(null);
      }
    } catch (err) {
      console.error('Error checking active orders:', err);
      setHasActiveOrder(false);
      setActiveOrderId(null);
      setCourierActiveOrder(null);
    } finally {
      setLoadingCourierOrder(false);
    }
  };

  // Handle courier order abandonment
  async function abandonCourierOrder() {
    if (!courierActiveOrder || !session?.user?.id) {
      toast.error('Nu exista comanda activa sau sesiune de utilizator.');
      return { success: false, error: 'Nu exista comanda activa sau sesiune de utilizator' };
    }

    // se incarca comanda curierului
    setLoadingCourierOrder(true);
    try {
      const response = await fetch('/api/courier/abandon-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: courierActiveOrder.id,
        }),
      });

      // Verifica raspunsul de la API
      if (response.ok) {
        setCourierActiveOrder(null);
        setHasActiveOrder(false);
        setActiveOrderId(null);
        
        // IMPORTANT: Force refresh the active orders check
        await checkActiveOrder();
        
        toast.success('Comanda a fost abandonata cu succes!');
        return { success: true };
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Eroare la abandonarea comenzii.');
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Eroare la abandonarea comenzii:', error);
      toast.error('Eroare la abandonarea comenzii. Va rugam ss incercati din nou.');
      return { success: false, error: error.message };
    } finally {
      setLoadingCourierOrder(false);
    }
  }

  // Function to get automatic step progress based on time
  function getAutomaticStepProgress(startDate, isScheduled, scheduledDate) {
    const now = new Date();

    if (isScheduled && scheduledDate) {
      const timeUntilDelivery = scheduledDate - now;

      if (timeUntilDelivery > 0) {
        const minutesUntilDelivery = timeUntilDelivery / (1000 * 60);

        if (minutesUntilDelivery > 45) {
          return 0; // Just received
        } else if (minutesUntilDelivery > 37) {
          return 1; // Restaurant confirmed
        } else {
          return 2; // Preparing delivery
        }
      } else {
        return 2; // All automatic steps completed for scheduled orders
      }
    }

    // ASAP delivery
    const minutesSinceOrder = (now - startDate) / (1000 * 60);

    if (minutesSinceOrder < 3) {
      return 0; // Order received
    } else if (minutesSinceOrder < 8) {
      return 1; // Restaurant confirmed
    } else {
      return 2; // Preparing delivery
    }
  }

  // Get manual step index based on courier status
  function getManualStepIndex(courierStatus) {
    switch (courierStatus) {
      case "A courier has taken your order":
        return 3; 
      case "Delivering":
        return 4; 
      case "Delivered":
        return 5; 
      default:
        return 2;
    }
  }

  const calculateDeliverySteps = (order) => {
    if (!order?.order_date) return { steps: [], activeStepIndex: 0 };

    const orderDate = new Date(order.order_date);
    const hasScheduledDelivery = order.delivery_date && new Date(order.delivery_date) > orderDate;
    let scheduledDeliveryDate = hasScheduledDelivery ? new Date(order.delivery_date) : null;

    // For scheduled orders, calculate when preparation should start
    const preparationStartDate = hasScheduledDelivery && scheduledDeliveryDate ?
      new Date(scheduledDeliveryDate.getTime() - 45 * 60000) : // 45 min before
      orderDate; // For ASAP use order date

    // Build automatic steps with correct timestamps
    const automaticSteps = automaticStepsConfig.map((step, index) => {
      let stepTime;

      if (step.useOrderDate) {
        // First step always uses order date
        stepTime = new Date(orderDate.getTime() + step.offsetMinutes * 60000);
      } else {
        // Other automatic steps use preparation start date
        stepTime = new Date(preparationStartDate.getTime() + step.offsetMinutes * 60000);
      }

      return {
        title: step.title,
        time: formatDate(stepTime),
        timestamp: stepTime,
        completed: false,
        icon: step.icon,
        isAutomatic: true
      };
    });

    // Build manual steps (controlled by courier, and only by him)
    const manualSteps = manualStepsConfig.map((step, index) => ({
      title: step.title,
      time: '', // Will be filled based on courier status
      timestamp: null,
      completed: false,
      icon: step.icon,
      isAutomatic: false
    }));

    const allSteps = [...automaticSteps, ...manualSteps];

    // Mark automatic steps as completed based on time progression
    const automaticProgress = getAutomaticStepProgress(
      preparationStartDate,
      hasScheduledDelivery,
      scheduledDeliveryDate
    );

    // Complete automatic steps based on natural time progression ONLY
    for (let i = 0; i <= automaticProgress; i++) {
      if (i < 3) { // Only automatic steps (0, 1, 2)
        allSteps[i].completed = true;
      }
    }

    // Handle manual steps and courier status
    if (order.courier_status) {
      const currentTime = formatDate(new Date());
      
      switch (order.courier_status) {
        case "A courier has taken your order":
          allSteps[3].completed = true;
          allSteps[3].time = currentTime;
          break;
          
        case "Delivering":
          // Courier is delivering complete steps 3 and 4
          allSteps[3].completed = true;
          allSteps[3].time = currentTime;
          allSteps[4].completed = true;
          allSteps[4].time = currentTime;
          
          // IMPORTANT: Complete ALL previous automatic steps when courier starts delivering
          // order received -> confirmed -> prepared -> courier takes -> delivering
          allSteps[0].completed = true; // Order received
          allSteps[1].completed = true; // The restaurant confirmed your order
          allSteps[2].completed = true; // Preparing delivery
          break;
          
        case "Delivered":
          // Order delivered - complete all steps
          allSteps[3].completed = true;
          allSteps[3].time = currentTime;
          allSteps[4].completed = true;
          allSteps[4].time = currentTime;
          allSteps[5].completed = true;
          allSteps[5].time = currentTime;
          
          // Ensure all automatic steps are also completed
          allSteps[0].completed = true; // Order received
          allSteps[1].completed = true; // The restaurant confirmed your order
          allSteps[2].completed = true; // Preparing delivery
          break;
      }
    }

    // Determine active step index - find the first incomplete step
    let activeStepIndex = 0;
    for (let i = 0; i < allSteps.length; i++) {
      if (!allSteps[i].completed) {
        activeStepIndex = i;
        break;
      }
      // If all steps are completed, set to last step
      if (i === allSteps.length - 1) {
        activeStepIndex = i;
      }
    }

    return { steps: allSteps, activeStepIndex };
  };

  // Updated: Get delivery status name from step index (only for automatic steps)
  const getDeliveryStatusName = (stepIndex) => {
    const statusNames = [
      "Order received",
      "The restaurant confirmed your order",
      "Preparing delivery",
    ];
    return statusNames[stepIndex] || "Order received";
  };

  // Updated: Get step index from status name
  const getStepIndexFromStatus = (statusName, courierStatus) => {
    // If courier has taken action, return manual step index
    if (courierStatus) {
      return getManualStepIndex(courierStatus);
    }

    // Otherwise, return automatic step index
    const automaticStatusMap = {
      "Order received": 0,
      "The restaurant confirmed your order": 1,
      "Preparing delivery": 2
    };
    return automaticStatusMap[statusName] || 0;
  };

  // Update delivery status in database (only for automatic steps)
  const updateDeliveryStatus = async (orderId, stepIndex) => {
    if (!orderId || stepIndex === undefined || stepIndex > 2) return; // Only update automatic steps

    const statusName = getDeliveryStatusName(stepIndex);

    try {
      const response = await fetch('/api/orders/delivery-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          deliveryStatus: statusName,
          orderType: currentOrder.order_type
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update delivery status:', errorData.error);
        toast.error('Failed to update delivery status: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Error updating delivery status.');
    }
  };

  // function to update courier status (for manual steps)
  const updateCourierStatus = async (orderId, courierStatus) => {
    if (!orderId || !courierStatus) return;

    if (!session?.user || session.user.userType !== 'courier') {
      console.error('Only couriers can update courier status');
      toast.error('Access denied. Only couriers can update delivery status.');
      return;
    }

    try {
      console.log('=== COURIER STATUS UPDATE START ===');
      console.log('Request data:', { orderId, courierStatus });
      console.log('Session user:', session?.user);
      
      const requestBody = {
        orderId: orderId,
        courierStatus: courierStatus
      };
      console.log('Request body to be sent:', JSON.stringify(requestBody));
      
      const response = await fetch('/api/courier/courier-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response received:');
      console.log('- Status:', response.status);
      console.log('- Status Text:', response.statusText);
      console.log('- OK:', response.ok);
      console.log('- Headers:', Object.fromEntries(response.headers.entries()));

      // Check if response has content
      const responseText = await response.text();
      console.log('Raw response text length:', responseText.length);
      console.log('Raw response text:', responseText);

      if (!responseText || responseText.trim() === '') {
        console.error('CRITICAL: Server returned completely empty response');
        console.error('This usually indicates a server crash or unhandled exception');
        throw new Error('Server returned empty response - check server logs for errors');
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response data:', responseData);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text that failed to parse:', responseText);
        console.error('Response text character codes:', Array.from(responseText).map(c => c.charCodeAt(0)));
        throw new Error(`Invalid JSON response. Server returned: "${responseText}"`);
      }

      if (!response.ok) {
        console.error('API returned error:', responseData);
        throw new Error(responseData.error || `HTTP ${response.status}: Failed to update courier status`);
      }

      console.log('SUCCESS: Courier status updated successfully:', responseData);
      console.log('=== COURIER STATUS UPDATE END ===');
      return responseData;

    } catch (error) {
      console.error('=== COURIER STATUS UPDATE ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('=== END ERROR LOG ===');
      
      toast.error(`Error updating courier status: ${error.message}`);
      throw error;
    }
  };

  // Get formatted delivery time string for display
  const getDeliveryTimeDisplay = (order) => {
    if (!order) return "";
    
    if (order.delivery_date) {
      const deliveryDate = new Date(order.delivery_date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const timeString = deliveryDate.toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      if (deliveryDate.toDateString() === today.toDateString()) {
        return `Today at ${timeString}`;
      } else if (deliveryDate.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${timeString}`;
      } else {
        return formatDate(deliveryDate);
      }
    }
    
    return "ASAP";
  };

  // Updated: Get estimated delivery time based on delivery date and courier status
  const getEstimatedDeliveryTime = (order, stepIndex) => {
    if (!order) return "";
    
    if (order.delivery_date) {
      return getDeliveryTimeDisplay(order);
    }
    
    if (order.courier_status === "Delivering") {
      return '5-10 min';
    } else if (order.courier_status === "A courier has taken your order") {
      return '15-25 min';
    } else {
      // Still in automatic steps - check if preparation is done

      const now = new Date();
      const orderDate = new Date(order.order_date);
      const minutesSinceOrder = (now - orderDate) / (1000 * 60);
      
      if (minutesSinceOrder >= 8) { // Preparation should be done
        return '20-30 min'; // Waiting for courier
      } else {
        return '25-35 min'; // Still preparing
      }
    }
  };

 const advanceCourierStep = async (orderId, newStatus) => {
    if (!orderId || !newStatus) {
      toast.error('Missing order ID or status');
      return;
    }
    
    if (!session?.user || session.user.userType !== 'courier') {
      toast.error('Access denied. Only couriers can update delivery status.');
      return;
    }
    
    try {
      // Update courier status in database
      const result = await updateCourierStatus(orderId, newStatus);
      
      if (result) {
        // Refresh current order to reflect changes
        if (currentOrder?.id === orderId) {
          await fetchCurrentOrderFromDatabase(orderId);
        }
        
        // refresh courier's active order
        if (courierActiveOrder?.id === orderId) {
          await checkActiveOrder();
        }
      
        toast.success(`Status updated to: ${newStatus}`);
      }
    } catch (error) {
      console.error('Error advancing courier step:', error);
      toast.error('Failed to update status');
    }
  };

  // Update delivery steps when current order changes
  useEffect(() => {
    if (currentOrder) {
      const { steps, activeStepIndex } = calculateDeliverySteps(currentOrder);
      setDeliverySteps(steps);
      setCurrentStepIndex(activeStepIndex);
    } else {
      setDeliverySteps([]);
      setCurrentStepIndex(0);
    }
  }, [currentOrder]);

  // Update delivery status when step index changes (only for automatic steps)
  useEffect(() => {
    if (currentOrder?.id && currentStepIndex !== undefined && currentStepIndex <= 2) {
      updateDeliveryStatus(currentOrder.id, currentStepIndex);
    }
  }, [currentOrder?.id, currentStepIndex]);

  // Sync step index with order status from database
  useEffect(() => {
    if (currentOrder?.delivery_status) {
      const stepIndex = getStepIndexFromStatus(currentOrder.delivery_status, currentOrder.courier_status);
      if (stepIndex !== currentStepIndex) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [currentOrder?.delivery_status, currentOrder?.courier_status]);

  function saveGuestOrderToLocalStorage(orderId){
    if(ls){
      ls.setItem('guestOrderId', JSON.stringify(orderId));
    }
  }
  
  const isOrderInProgress = (order) => {
    if (!order) return false;
    
    // Order is completed only if courier has delivered it
    if (order.courier_status === 'delivered') {
      return false;
    }
    
    const inProgressStatuses = [
      "Order received",
      "The restaurant confirmed your order", 
      "Preparing delivery"
    ];
    
    return inProgressStatuses.includes(order.delivery_status) || (order.courier_status && order.courier_status !== 'delivered');
  };
  
  // works for any type of restaurant list
  async function updateOrderRestaurantsList(products, existingRestaurants = []) {

    const restaurantIds = new Set();
    
    // Collect all unique restaurant IDs from products
    for (const product of products) {
      if (product.restaurant_id && !restaurantIds.has(product.restaurant_id)) {
        restaurantIds.add(product.restaurant_id);
      }
    }
    
    if (restaurantIds.size === 0) {
      console.log('No restaurant IDs found in products');
      return [];
    }
    
    // Fetch restaurant information for each unique restaurant ID
    const fetchedRestaurants = [];
    
    for (const restaurantId of restaurantIds) {
      const existingRestaurant = existingRestaurants.find(r => r && r.id === restaurantId);
      
      if (existingRestaurant) {
        fetchedRestaurants.push(existingRestaurant);
        console.log(`Using existing restaurant: ${existingRestaurant.name}`);
      } else {
        console.log(`Fetching restaurant with ID: ${restaurantId}`);
        const restaurant = await fetchRestaurantById(restaurantId);
        if (restaurant) {
          fetchedRestaurants.push(restaurant);
          console.log(`Fetched restaurant: ${restaurant.name}`);
        } else {
          console.warn(`Failed to fetch restaurant with ID: ${restaurantId}`);
        }
      }
    }
    
    console.log('Final fetched restaurants: ', fetchedRestaurants);
    return fetchedRestaurants;
  }
 
  // Only for the logged user
  async function fetchOrdersFromDatabase() {
    try {
      setLoadingOrders(true);
      const response = await fetch('/api/orders');
      if(!response.ok) throw new Error('Failed to get orders!');
     
      const data = await response.json();
      if(data.orders && Array.isArray(data.orders)){
        setOrders(data.orders);
        setOrderProducts(data.ordersProducts);
        
        // Update restaurants list for all orders
        const allOrdersRestaurants = await updateOrderRestaurantsList(data.ordersProducts, ordersRestaurants);
        setOrdersRestaurants(allOrdersRestaurants);
        
        // Check if there's a current order in progress
        await checkForCurrentOrder(data.orders);
      }
    } catch (error){
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  }
  
  // Check for current order in progress
  async function checkForCurrentOrder(allOrders = null) {
    try {
      const ordersToCheck = allOrders || orders;
      
      if(status === "authenticated"){
        
        // we are looking for the most recent order in progress
        if (ordersToCheck && ordersToCheck.length > 0) {
          // Sort orders by date (most recent first)
          const sortedOrders = [...ordersToCheck].sort((a, b) => 
            new Date(b.order_date) - new Date(a.order_date)
          );
          
          for (const order of sortedOrders) {
            if (isOrderInProgress(order)) {
              console.log('Found order in progress:', order.id);
              await fetchCurrentOrderFromDatabase(order.id);
              return;
            }
          }
        }

      }
      // guests
      else if(status === "unauthenticated"){
        // First, check if there's a stored current order ID
        const storedOrderId = ls && ls.getItem('guestOrderId') ? JSON.parse(ls.getItem('guestOrderId')) : null;
        
        if (storedOrderId) {
          console.log('Found stored order ID:', storedOrderId);
          // Try to fetch the stored order
          await fetchCurrentOrderFromDatabase(storedOrderId);
          return;
        }
      }
      
      // No order in progress found, clear current order
      clearCurrentOrder();
      
    } catch (error) {
      console.error('Error checking for current order:', error);
    }
  }
  
  // Clear current order data
  function clearCurrentOrder() {
    setCurrentOrder(null);
    setCurrentOrderProducts([]);
    setCurrentOrderRestaurants([]);
    setDeliverySteps([]);
    setCurrentStepIndex(0);
    if (ls) {
      ls.removeItem('guestOrderId');
    }
  }
 
  // For logged users and guests
  async function fetchCurrentOrderFromDatabase(orderId) {
    try {
      setLoadingOrders(true);
      console.log(`Fetching order with ID: ${orderId}`);
      
      const response = await fetch(`/api/orders/current?orderId=${encodeURIComponent(orderId)}`);
      
      if(!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load this order!');
      }
    
      const data = await response.json();
      console.log("Fetched order data:", data);
            
      if(data.order && data.orderProducts){
        // Check if the order is still in progress
        if (isOrderInProgress(data.order)) {
          setCurrentOrder(data.order);
          setCurrentOrderProducts(data.orderProducts || []);
          
          console.log("Order products for restaurant fetching:", data.orderProducts);
          
          // Update restaurants based on fetched products, using existing restaurants as reference
          const currentRestaurants = await updateOrderRestaurantsList(
            data.orderProducts, 
            [...currentOrderRestaurants, ...ordersRestaurants]
          );
          
          console.log("Setting current order restaurants:", currentRestaurants);
          setCurrentOrderRestaurants(currentRestaurants);
          
          // only for guests
          if (status === "unauthenticated") {
            saveGuestOrderToLocalStorage(orderId);
          }
        } else {
          // Order is completed or cancelled, clear current order
          console.log('Order is no longer in progress:', data.order.delivery_status);
          clearCurrentOrder();
        }
      } else {
        throw new Error('Order data structure is invalid');
      }
    } catch (error) {
      console.error('Error getting order:', error);

      clearCurrentOrder();
      toast.error(`Failed to load order: ${error.message}`);
    } finally {
      setLoadingOrders(false);
    }
  }

  // Transfer guest order to user function
  async function transferGuestOrderToUser(guestOrderId) {
    try {
      const response = await fetch('/api/orders/transfer-guest-order-to-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestOrderId: guestOrderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transfer the order!');
      }

      const data = await response.json();
      console.log('Order transferred successfully:', data);
      return data;

    } catch (error) {
      console.error("Error transferring guest order after login: ", error);
      throw error;
    }
  }
 
  // Place a new order (works with both regular and Stripe payments)
  async function placeOrder(streetAddress, postalCode, city, phoneNumber, paymentMethod, totalPrice, guestDetails = null, deliveryDate = null, paymentIntentId = null) {
    try {
      // Make sure we have all required data
      if (!cartProducts || cartProducts.length === 0) {
        throw new Error('Cart is empty');
      }
      
      if (!streetAddress || !postalCode || !city) {
        throw new Error('Delivery address is required');
      }
      
      if (!paymentMethod || !totalPrice) {
        throw new Error('Payment method is required');
      }

      if(!phoneNumber){
        throw new Error('Phone number is required');
      }
      
      // If user is not logged in
      if (status !== 'authenticated') {
        if (!guestDetails || !guestDetails.name || !guestDetails.email || !guestDetails.phone) {
          throw new Error('Guest details are required for non-logged in users');
        }
        
        // Save guest details to localStorage for geocoding
        const guestDetailsToSave = {
          ...guestDetails,
          streetAddress,
          city,
          postalCode,
          phoneNumber
        };
        saveGuestDetailsToLocalStorage(guestDetailsToSave);
      }

      console.log("Cart objects in orderscontext: ",cartProducts, cartRestaurants);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartProducts,
          streetAddress,
          city,
          postalCode,
          phoneNumber,
          paymentMethod,
          totalPrice,
          guestDetails: status !== 'authenticated' ? guestDetails : undefined,
          deliveryDate,
          paymentIntentId
        }),
      });
     
      if(!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order!');
      }
     
      const result = await response.json();
      
      // For non-Stripe payments, clear cart and redirect immediately
      if (result.success && paymentMethod !== 'card') {
        clearCart();
        
        if(status === 'unauthenticated'){
          saveGuestOrderToLocalStorage(result.order.id)
        }
        
        // Fetch the order details immediately after placing it
        await fetchCurrentOrderFromDatabase(result.order.id);
        
        router.push(`/delivery?orderId=${result.order.id}`);
        
        toast.success('Order placed successfully!');
      }
      
      // For Stripe payments, return the result without redirecting
      // The CheckoutStripeForm will handle the payment confirmation and redirect, sper
      return result;
    } catch (error) {
      console.error('Error placing an order:', error);
      toast.error(`Failed to place order: ${error.message}`);
      throw error;
    }
  }

  // Initialize current order on mount/session change
  useEffect(() => {
    if (status === "loading") return;

    const initializeOrders = async () => {
      const userType = session?.user?.userType;

      // Initialize guest details from localStorage for all users
      getGuestDetailsFromLocalStorage();

      if (status === 'authenticated' && userType !== 'courier') {
        const guestOrderId = ls && ls.getItem('guestOrderId') ? JSON.parse(ls.getItem('guestOrderId')) : null;

        if (guestOrderId) {
          try {
            console.log('Attempting to transfer guest order:', guestOrderId);
            const transferResponse = await transferGuestOrderToUser(guestOrderId);

            if (transferResponse.success) {
              console.log('Guest order transferred successfully to user order:', transferResponse.orderId);
              // Clear the guest order ID from localStorage
              ls.removeItem('guestOrderId');
              // Clear guest details since they're now transferred to user account
              clearGuestDetailsFromLocalStorage();
              
              // Fetch the transferred order as current order
              await fetchCurrentOrderFromDatabase(transferResponse.orderId);
              
              // Fetch all user orders (including the transferred one)
              await fetchOrdersFromDatabase();
              
              toast.success('Your previous order has been transferred to your account!');
              return;
            }
          } catch (error) {
            console.error('Failed to transfer guest order:', error);
            ls.removeItem('guestOrderId');
            toast.error('Failed to transfer your previous order. Please check your order history.');
          }
        }

        // Normal logged-in user flow
        await fetchOrdersFromDatabase();

      } else if (status === 'unauthenticated') {
        // Guest user flow
        const storedOrderId = ls && ls.getItem('guestOrderId') ? JSON.parse(ls.getItem('guestOrderId')) : null;

        if (storedOrderId) {
          console.log('Loading guest order from localStorage:', storedOrderId);
          await fetchCurrentOrderFromDatabase(storedOrderId);
        } else {
          setOrders([]);
          setOrderProducts([]);
          setOrdersRestaurants([]);
          clearCurrentOrder();
          setLoadingOrders(false);
        }
      }
    };

    initializeOrders();
    
  }, [status, session?.user?.userType]);
 
  return (
    <OrderContext.Provider value={{
      currentOrder,
      currentOrderProducts,
      currentOrderRestaurants,
      orders,
      orderProducts,
      ordersRestaurants,
      loadingOrders,
      courierActiveOrder,
      
      // Delivery steps functionality
      deliverySteps,
      currentStepIndex,
      setCurrentStepIndex,
      getDeliveryStatusName,
      getStepIndexFromStatus,
      getDeliveryTimeDisplay,
      getEstimatedDeliveryTime,
      updateDeliveryStatus,
      advanceCourierStep,

      // Guest details functionality
      guestDetails,
      saveGuestDetailsToLocalStorage,
      getGuestDetailsFromLocalStorage,
      clearGuestDetailsFromLocalStorage,
      getGuestAddressForGeocoding,

      // Original functions
      fetchOrdersFromDatabase,
      fetchCurrentOrderFromDatabase,
      placeOrder,
      clearCurrentOrder,
      isOrderInProgress,
      transferGuestOrderToUser,

      // courier
      abandonCourierOrder,
      hasActiveOrder,
      activeOrderId,
      checkActiveOrder,
      updateCourierStatus
      
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}