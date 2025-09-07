'use client'
import { useOrder } from "../../components/OrdersContext";
import CheckoutStripeForm from "./CheckoutStripeForm";
import convertToSubcurrency from "./convertToSubcurrency";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function CheckoutPayment({
  streetAddress,
  postalCode,
  city,
  phoneNumber,
  guestDetails = null,
  deliveryDate = null,
  totalPrice,
  onBack = null,
}) {
  const { placeOrder } = useOrder();
 
  return (
    <main className="min-h-screen mt-24 flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-gradient-to-tr from-primary to-secondary rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-white hover:text-white/80 transition-colors mb-6"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to order details
            </button>
          )}
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Sky Foods
            </h1>
            <p className="text-white/90 text-lg">
              Complete your order securely
            </p>
          </div>

          {/* Order Details Summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white mb-6">
            <h3 className="text-lg font-semibold mb-3">Delivery Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Address:</span> {streetAddress}, {city}, {postalCode}</p>
              <p><span className="font-medium">Phone:</span> {phoneNumber}</p>
              {guestDetails && (
                <>
                  <p><span className="font-medium">Name:</span> {guestDetails.name}</p>
                  <p><span className="font-medium">Email:</span> {guestDetails.email}</p>
                </>
              )}
              {deliveryDate && (
                <p><span className="font-medium">Delivery Time:</span> {new Date(deliveryDate).toLocaleString()}</p>
              )}
            </div>
          </div>
         
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: convertToSubcurrency(totalPrice),
              currency: "ron",
            }}
          >
            <CheckoutStripeForm
              amount={totalPrice}
              streetAddress={streetAddress}
              postalCode={postalCode}
              city={city}
              phoneNumber={phoneNumber}
              guestDetails={guestDetails}
              deliveryDate={deliveryDate}
              placeOrder={placeOrder}
            />
          </Elements>
        </div>
      </div>
    </main>
  );
}