"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../components/CartContext";
import { useRouter } from "next/navigation";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

export default function CartPage() {
  const {
    cartProducts,
    removeCartProduct,
    updateProductQuantity,
    clearCart,
    calculateTotalPrice,
    loading,
    cartRestaurants
  } = useCart();

  const router = useRouter();
  const { data: session, status } = useSession();

  const [restaurantGroups, setRestaurantGroups] = useState([]);

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity >= 1) {
      updateProductQuantity(index, newQuantity);
    }
  };

  const handleRemoveItem = (index) => {
    removeCartProduct(index);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  // Group products by restaurant
  const getRestaurantProducts = () => {
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
          originalIndex: index
        });
      }
    });

    return Object.values(grouped);
  };

  // curier sau user
  useEffect(() => {
    if (status === 'loading' || loading) {
      return;
    }

    const userType = session?.user?.userType;

    if (userType === 'courier') {
      router.push("/courier/dashboard");
    } else {
      if (cartProducts && cartRestaurants) {
        setRestaurantGroups(getRestaurantProducts());
      }
    }
  }, [status, loading, session, cartProducts, cartRestaurants, router]);

  // loading
  if (loading || status === 'loading') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 mt-10">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Acesta ar trebui sa se execute doar dupa ce loading este false si session status nu este 'loading'
  if (cartProducts.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 mt-10">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-6">Your cart is empty</p>
          <Link
            href="/"
            className="bg-primary text-white rounded-full px-6 py-2 hover:bg-primaryhov transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-16 py-8 mt-20">
      <h1 className="text-center text-primary text-4xl mb-4">Your Cart</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4">
          {restaurantGroups.map((restaurantGroup, restaurantIndex) => (
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
                      <button
                        onClick={() => handleQuantityChange(item.originalIndex, item.quantity - 1)}
                        className="text-primaryhov focus:outline-none p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z" clipRule="evenodd" />
                        </svg>
                      </button>

                      <span className="mx-2 text-center w-8">{item.quantity}</span>

                      <button
                        onClick={() => handleQuantityChange(item.originalIndex, item.quantity + 1)}
                        className="focus:outline-none text-primaryhov p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleRemoveItem(item.originalIndex)}
                        className="ml-4 text-red-500 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                          <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between bg-white rounded-lg shadow-md p-10 mb-8">
        <div className="mb-4 md:mb-0">
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 transition-colors duration-200 flex items-center text-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 mr-2">
              <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
            </svg>
            Clear Cart
          </button>
        </div>

        <div className="text-right">
          <div className="mb-2">
            <span className="text-gray-700 text-xl">Total:</span>
            <span className="text-2xl font-bold ml-2">{calculateTotalPrice()} Lei</span>
          </div>

          <button
            onClick={handleCheckout}
            className={"bg-primary text-white rounded-full px-8 py-3 hover:bg-primaryhov transition-colors duration-200 flex items-center ml-auto"}
          >
            <>
              Checkout
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 ml-2">
                <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </>
          </button>
        </div>
      </div>

      <div className="text-center">
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