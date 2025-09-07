"use client"
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  ShoppingBagIcon, 
  MapPinIcon, 
  UserIcon, 
  CreditCardIcon, 
  ClockIcon, 
  TrashIcon,
  BuildingStorefrontIcon 
} from '@heroicons/react/24/outline';

import { useOrder } from '../../components/OrdersContext';
import { useUser } from "../hooks/User/user";
import { useCart } from "../../components/CartContext";
import Loading from "../../components/loading/loading";
import DeliveryTime from "./deliveryTime";
import CheckoutPayment from "../checkout-payment-stripe/page";
import { useRouter } from "next/navigation";

export default function Checkout() {
  const {data: session, status} = useSession();
  const { user, updateField, updateUser } = useUser();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryTime, setDeliveryTime] = useState('now');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState(null);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);

  const router = useRouter();

  const { 
    cartProducts, 
    calculateTotalPrice,
    cartRestaurants
  } = useCart();

  const productsPrice = parseFloat(calculateTotalPrice());
  const deliveryFee = parseFloat(10.00);
  const totalPrice = parseFloat(productsPrice + deliveryFee);

  const {
    placeOrder
  } = useOrder();

  useEffect(() =>{
    const fetchUserInfo = async () => {
      try{
        setIsLoading(true)
        if(status === 'authenticated'){
          
          const response = await fetch('/api/user');
  
          if (!response.ok) throw new Error("Failed to fetch data");
    
          const data = await response.json();
          updateUser({
            name: data.name || "",
            phoneNumber: data.phone_number || "",
            streetAddress: data.street_address || "",
            postalCode: data.postal_code || "",
            city: data.city || "",
            dateOfBirth: data.date_of_birth ? data.date_of_birth.split("T")[0] : ""
          })
        } else{
          updateUser({
            name: "",
            phoneNumber: "",
            streetAddress: "",
            postalCode: "",
            city: "",
            dateOfBirth: ""
          })
        }
      } catch(error){
        toast.error("Something went wrong: ", error.message);
      } finally {
        setIsLoading(false)
      }
    }

    const userType = session?.user?.userType;

    if(userType == 'courier'){
      router.push('/courier/dashboard');
    }
    
    fetchUserInfo();

  },[status, updateUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
      // doar cifre
      const onlyDigits = value.replace(/\D/g, "");

      // Limiteaza la 10 caractere
      const limitedDigits = onlyDigits.slice(0, 10);

      updateField(name, limitedDigits);
  };

  const handleNumberKeyPress = (e) => {
    // Permite doar cifre (0-9), backspace, delete, tab, escape, enter
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
    const isNumber = /[0-9]/.test(e.key);
    
    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
    
    // Previne introducerea de mai mult de 10 caractere
    if (isNumber && e.target.value.length >= 10) {
      e.preventDefault();
    }
  };

  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!user.streetAddress || !user.city || !user.postalCode || !user.phoneNumber) {
        toast.error("Please fill in all address and contact information");
        return;
      }
      
      if (cartProducts.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      // Validate email for guest users
      if (status !== 'authenticated' && !user.email) {
        toast.error("Please fill in your email address");
        return;
      }
      
      // For guest users
      const guestDetails = status !== 'authenticated' ? {
        name: user.name,
        email: user.email,
        phone: user.phoneNumber
      } : null;
      
      // Pass the scheduled delivery date directly
      // Daca este "now", trimitem null, altfel trimitem data programata
      const deliveryDateToSend = deliveryTime === 'now' ? null : scheduledDeliveryDate;
      
      // If payment method is card, show Stripe checkout
      if (paymentMethod === 'card') {
        setShowStripeCheckout(true);
        return;
      }
      
      // For cash payments, proceed with regular order placement
      const result = await placeOrder(
        user.streetAddress,
        user.postalCode,
        user.city,
        user.phoneNumber,
        paymentMethod,
        totalPrice,
        guestDetails,
        deliveryDateToSend
      );
      
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliveryTimeChange = (option) => {
    setDeliveryTime(option);
    if (option === 'later') {
      setShowTimeModal(true);
    } else {
      setSelectedTimeSlot("");
      setScheduledDeliveryDate(null);
    }
  };

  const handleTimeSelected = (timeSlot, scheduledDate) => {
    setSelectedTimeSlot(timeSlot);
    setScheduledDeliveryDate(scheduledDate);
    setShowTimeModal(false);
  };

  // Group products by restaurant
  const groupRestaurantProducts = () => {
    const grouped = {};
    
    // Initialize empty arrays for each restaurant
    cartRestaurants.forEach(restaurant => {
      grouped[restaurant.id] = {
        restaurant,
        products: []
      };
    });
    
    // Add products to their respective restaurants
    cartProducts.forEach((product, index) => {
      if (product.restaurant_id && grouped[product.restaurant_id]) {
        grouped[product.restaurant_id].products.push({
          ...product,
          originalIndex: index // Keep track of the original index
        });
      }
    });
    
    return Object.values(grouped);
  };

  if (isLoading) {
    return <Loading baseSize={8} mdSize={12} lgSize={16} borderWidth={3} />;
  }

  // If showing Stripe checkout, render the payment component
  if (showStripeCheckout) {
    const guestDetails = status !== 'authenticated' ? {
      name: user.name,
      email: user.email,
      phone: user.phoneNumber
    } : null;

    const deliveryDateToSend = deliveryTime === 'now' ? null : scheduledDeliveryDate;

    return (
      <CheckoutPayment
        streetAddress={user.streetAddress}
        postalCode={user.postalCode}
        city={user.city}
        phoneNumber={user.phoneNumber}
        guestDetails={guestDetails}
        deliveryDate={deliveryDateToSend}
        totalPrice={totalPrice}
      />
    );
  }

  // Get grouped products
  const restaurantGroups = groupRestaurantProducts();

  return (
    <div className="container mx-auto px-4 md:px-16 py-8 mt-20">
      <h1 className="text-center text-primary text-4xl mb-4">Send Delivery</h1>
        
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Coloana principala */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date utilizator */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <UserIcon className="mr-2 h-5 w-5 text-primary" />
                Your data
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    name="name"
                    placeholder="Enter your name"
                    value={user.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                {session?.user?.email ?(
                  <input
                  name="email"
                  type="email"
                  disabled
                  placeholder = "Enter your email" 
                  value={session.user.email}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-gray-50"
                />

                ) : (
                  <input
                    name="email"
                    type="email"
                    placeholder = "Enter your email" 
                    value={user.email} onChange={handleChange} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                )}
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number *</label>
                <input 
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={user.phoneNumber} onChange={handleNumberChange}
                  onKeyDown={handleNumberKeyPress}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal code *</label>
                <input 
                  name="postalCode"
                  placeholder="Enter your postal code"
                  value={user.postalCode} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input 
                  name="city"
                  placeholder="Enter city"
                  value={user.city} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street address *</label>
                <input 
                  name="streetAddress"
                  placeholder="Enter your street address"
                  value={user.streetAddress} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Metoda de plata */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CreditCardIcon className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Payment method</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input type="radio"
                 className="h-5 w-5 text-primary"
                 onChange={() => setPaymentMethod('card')}
                 checked = {paymentMethod === 'card'} />
                <label className="ml-2">Card (Stripe)</label>
              </div>
              <div className="flex items-center">
                <input type="radio"
                  className="h-5 w-5 text-primary"
                  onChange={() => setPaymentMethod('cash')} 
                  checked = {paymentMethod === 'cash'}/>
                <label className="ml-2">Cash on delivery</label>
              </div>
            </div>
          </div>

          {/* Timpul de livrare */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <ClockIcon className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Delivery time</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input type="radio"
                  name="deliveryTime"
                  className="h-5 w-5 text-primary"
                  checked={deliveryTime === 'now'}
                  onChange={() => handleDeliveryTimeChange('now')}
                />
                <label className="ml-2">Deliver now</label>
              </div>
              <div className="flex items-center">
                <input type="radio"
                  name="deliveryTime"
                  className="h-5 w-5 text-primary"
                  checked={deliveryTime === 'later'}
                  onChange={() => handleDeliveryTimeChange('later')}
                />
                <label className="ml-2">Deliver later</label>
                {deliveryTime === 'later' && selectedTimeSlot && (
                  <span className="ml-3 text-primary font-medium">{selectedTimeSlot}</span>
                )}
                {deliveryTime === 'later' && !selectedTimeSlot && (
                  <button 
                    onClick={() => setShowTimeModal(true)} 
                    className="ml-3 text-primary underline font-medium"
                  >
                    Select time
                  </button>
                )}
              </div>
            </div>
            
            {showTimeModal && (
              <DeliveryTime
                onClose={() => setShowTimeModal(false)} 
                onSelectTime={handleTimeSelected} 
                restaurants={cartRestaurants}
              />
            )}
          </div>

          {/* Produse comandate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <ShoppingBagIcon className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your products</h2>
            </div>

            <div className="p-4">
              {cartProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Your cart is empty</p>
              ) : (
                restaurantGroups.map((restaurantGroup, restaurantIndex) => (
                  <div key={restaurantIndex} className="mb-8 last:mb-0">
                    <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                      <BuildingStorefrontIcon className="mr-2 h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{restaurantGroup.restaurant.name}</h3>
                    </div>
                    
                    {restaurantGroup.products.map((item) => (
                      <div key={item.originalIndex} className="flex flex-col md:flex-row border-b border-gray-200 py-4 last:border-b-0">
                        <div className="md:w-1/4 mb-4 md:mb-0">
                          {item.image && (
                            <div className="relative h-48 w-48 rounded-md overflow-hidden">
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
                          <h3 className="text-xl font-semibold text-secondary">{item.name}</h3>
                          <p className="text-gray-600 text-md mt-1">{item.description?.substring(0, 200)}{item.description?.length > 200 ? '...' : ''}</p>
                          
                          {item.size && (
                            <p className="text-md text-gray-500 mt-1">
                              Size: {item.size.size_name} ({item.size.price} Lei)
                            </p>
                          )}
                          
                          {item.extras && item.extras.length > 0 && (
                            <div className="mt-1">
                              <p className="text-md text-gray-500">Extra:</p>
                              <ul className="text-md text-gray-500 ml-2">
                                {item.extras.map((extra, i) => (
                                  <li key={i}>• {extra.extra_name} (+{extra.price} Lei)</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="md:w-1/4 flex flex-col items-end justify-between">
                          <div className="text-right">
                            <p className="text-lg font-semibold">
                              {(item.size ? parseFloat(item.size.price) : parseFloat(item.price_per_item)) * item.quantity} Lei
                            </p>
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <span className="mx-2 text-center w-8">{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Coloana secundara cu sumar */}
       <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{productsPrice.toFixed(2)} Lei</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>{deliveryFee.toFixed(2)} Lei</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} Lei</span>
              </div>
              
              {deliveryTime === 'later' && selectedTimeSlot && (
                <div className="pt-2 flex items-center text-primary">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span>{selectedTimeSlot}</span>
                </div>
              )}
              
              {paymentMethod === 'card' && (
                <div className="pt-2 text-primary text-sm">
                  <p>Secure payment with Stripe</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleSubmitOrder} 
              disabled={isSubmitting || 
                      cartProducts.length === 0 || 
                      !user.streetAddress || 
                      !user.city || 
                      !user.postalCode || 
                      !user.phoneNumber || 
                      (status === 'authenticated' ? !session?.user?.email : !user.email) ||
                      (deliveryTime === 'later' && !selectedTimeSlot)} 
              className="w-full py-3 px-4 bg-primary hover:bg-primaryhov text-white font-medium rounded-lg transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Processing...' : 
               paymentMethod === 'card' ? 'Continue to Payment' : 'Place Order'}
            </button>

            {cartProducts.length === 0 && (
              <p className="text-red-500 text-sm mt-2 text-center">Add products to your cart to place an order</p>
            )}
            
            {deliveryTime === 'later' && !selectedTimeSlot && (
              <p className="text-primary text-sm mt-2 text-center">Please select a delivery time</p>
            )}

            {status !== 'authenticated' && !user.email && (
              <p className="text-red-500 text-sm mt-2 text-center">Email is required for order confirmation</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}