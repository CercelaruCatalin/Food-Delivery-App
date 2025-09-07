'use client'
import React, { useEffect, useState, useRef } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "./convertToSubcurrency";
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useCart } from "../../components/CartContext";

export default function CheckoutStripeForm({ 
  amount, 
  streetAddress, 
  postalCode, 
  city, 
  phoneNumber, 
  guestDetails, 
  deliveryDate, 
  placeOrder 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const { clearCart } = useCart();
  
  // Use refs to prevent multiple payment intent creations
  const paymentIntentCreated = useRef(false);
  const isProcessing = useRef(false);

  useEffect(() => {
    // Prevent creating multiple payment intents
    if (paymentIntentCreated.current) {
      return;
    }

    const createPaymentIntent = async () => {
      try {
        paymentIntentCreated.current = true;
        
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret received');
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setErrorMessage('Failed to initialize payment. Please refresh and try again.');
        // Reset the flag so user can try again after refresh
        paymentIntentCreated.current = false;
      }
    };

    createPaymentIntent();
  }, [amount]); // Only depend on amount

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Prevent double submission
    if (isProcessing.current) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    isProcessing.current = true;

    if (!stripe || !elements) {
      setLoading(false);
      isProcessing.current = false;
      return;
    }

    try {
      // Submit the payment element
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setErrorMessage(submitError.message);
        return;
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        console.error('Payment failed:', error);
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        setErrorMessage('Payment was not completed successfully.');
        return;
      }

      console.log('Payment successful, creating order...', paymentIntent.id);
      
      const orderResult = await placeOrder(
        streetAddress,
        postalCode,
        city,
        phoneNumber,
        'card',
        amount,
        guestDetails,
        deliveryDate,
        paymentIntent.id
      );

      if (!orderResult.success) {
        console.error('Order creation failed after successful payment:', {
          paymentIntentId: paymentIntent.id,
          error: orderResult.error
        });
        setErrorMessage('Payment was successful, but order creation failed. Please contact support with payment reference: ' + paymentIntent.id);
        return;
      }

      // Success clear cart and redirect
      await clearCart();
      window.location.href = `/delivery?orderId=${orderResult.order.id}`;

    } catch (error) {
      console.error('Error during payment process:', error);
      setErrorMessage(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <ArrowPathIcon className="h-12 w-12 text-white animate-spin" />
          <p className="text-white text-lg">Loading payment form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
        <div className="flex justify-between items-center text-lg">
          <span>Total Amount:</span>
          <span className="font-bold text-2xl">{amount.toFixed(2)} Lei</span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Payment Information
          </h3>
          
          {clientSecret && (
            <div className="space-y-4">
              <PaymentElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
            </div>
          )}
        </div>

        <button
          disabled={!stripe || loading || isProcessing.current}
          className="w-full py-4 px-6 bg-black text-white text-lg font-bold rounded-xl hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
        >
          {!loading ? (
            <span className="flex items-center justify-center space-x-2">
              <span>Pay {amount.toFixed(2)} Lei</span>
              <LockClosedIcon className="w-5 h-5" />
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>Processing payment...</span>
            </span>
          )}
        </button>
      </form>

      {/* Security Info */}
      <div className="text-center text-white/80 text-sm">
        <p className="flex items-center justify-center space-x-2">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </p>
      </div>
    </div>
  );
}