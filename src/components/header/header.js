"use client";
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import Dropdown from '../dropdownButton/dropdown';
import { useCart } from '../CartContext';
import { useOrder } from '../OrdersContext';
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
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

export default function Header({ searchProducts, searchRestaurants }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userData = session?.user;
  let userName = userData?.name || userData?.email;

  const userType = userData?.userType;

  const [searchQuery, setSearchQuery] = useState("");
  const [loadingAbandonOrder, setLoadingAbandonOrder] = useState(false);
  const pathName = usePathname();

  // Don't display header on the Stripe checkout form page
  if (pathName?.includes("/checkout-payment")) {
    return null;
  }

  // Determine page type for search bar visibility and functionality
  const { isRestaurantsPage, isSpecificRestaurantPage, isSearchPage } = useMemo(() => {
    const currentPath = pathName || '';
    
    const isSpecificRestaurant = currentPath.includes('/restaurant/') && !currentPath.endsWith('/restaurants');
    const isRestaurants = currentPath.endsWith('/restaurants');
    const isSearch = isRestaurants || isSpecificRestaurant;

    return {
      isRestaurantsPage: isRestaurants,
      isSpecificRestaurantPage: isSpecificRestaurant,
      isSearchPage: isSearch
    };
  }, [pathName]);

  const handleSearch = (value) => {
    setSearchQuery(value);

    if (isRestaurantsPage) {
      if (typeof searchRestaurants === 'function') {
        searchRestaurants(value);
      } else {
        console.warn('`searchRestaurants` function not provided to Header component.');
      }
    } else if (isSpecificRestaurantPage) {
      if (typeof searchProducts === 'function') {
        searchProducts(value);
      } else {
        console.warn('`searchProducts` function not provided to Header component.');
      }
    }
  };

  const { cartProducts, loadingCart } = useCart();
  const { 
    currentOrder, 
    loadingOrders, 
    courierActiveOrder, 
    abandonCourierOrder, 
    checkActiveOrder,
    hasActiveOrder,
    loadingCourierOrder
  } = useOrder();

  if (userName && userName.includes(' ')) {
    userName = userName.split(' ')[0];
  }

  // Check for active courier orders when component mounts or session changes
  useEffect(() => {
    if (status === 'authenticated' && userType === 'courier') {
      checkActiveOrder();
    }
  }, [status, userType]);

  const deliveringNow = useMemo(() => {
    if (userType === 'courier' || loadingOrders) return false;
    
    return currentOrder && currentOrder.courier_status !== 'Delivered';
  }, [currentOrder, loadingOrders, userType]);

  // Handle courier order abandonment
  const handleAbandonOrder = async () => {
    if (!courierActiveOrder?.id || !session?.user?.id) {
      console.warn('Nu se poate abandona comanda: Lipseste comanda activa sau ID-ul utilizatorului.');
      return;
    }

    setLoadingAbandonOrder(true);

    try {
      const result = await abandonCourierOrder();

      if (result.success) {
        router.push('/courier/dashboard');
      } else {
        console.error('Eroare la abandonarea comenzii:', result.error);
      }
    } catch (error) {
      console.error('Eroare la apelarea functiei abandonCourierOrder:', error);
    } finally {
      setLoadingAbandonOrder(false);
    }
  };

  // Get order status display text and color
  const getOrderStatusDisplay = (order) => {
    if (!order) return { text: 'N/A', color: 'text-gray-500' };

    const status = order.delivery_status || 'Order received';
    const isCompleted = status === 'Delivered';

    return {
      text: isCompleted ? 'Order Completed' : `Active: ${status}`,
      color: isCompleted ? 'text-green-600' : 'text-blue-600'
    };
  };

  // check if courier is truly available
  const isCourierAvailable = useMemo(() => {
    return userType === 'courier' &&
           status === 'authenticated' &&
           !loadingOrders &&
           !loadingCourierOrder &&
           !courierActiveOrder &&
           !hasActiveOrder;
  }, [userType, status, loadingOrders, loadingCourierOrder, courierActiveOrder, hasActiveOrder]);

  return (
    <header className="w-full flex items-center justify-between py-4 px-6 bg-white border-b-2 border-gray-200 fixed top-0 left-0 right-0 z-50">
      <nav className="flex gap-8 items-center font-semibold">
        {/* Logo/Home Link */}
        <Link className="text-primary font-bold text-2xl tracking-tight hover:text-primaryhov transition-colors" href={userType === 'courier' ? '/courier/dashboard' : "/"}>
          SKY FOODS
        </Link>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primaryhov transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Authenticated User Navigation */}
        {status === 'authenticated' && (
          <>
            {/* My Account Dropdown */}
            <Dropdown
              btnName="My Account"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
              }
              btnPath="/profile"
              items={[
                ...(userType !== 'courier' ? [{ name: 'Orders history', path: '/orders-history' }] : []),
                { name: 'Profile', path: '/profile' }
              ]}
            />

            {/* Courier Dashboard Link */}
            {userType === 'courier' && (
              <Link href="/courier/dashboard" className='flex items-center gap-2 rounded-full px-6 py-2 border text-black border-gray-200 hover:bg-primaryhov hover:text-white hover:border-primaryhov transition-all duration-200'>
                <BuildingStorefrontIcon className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </>
        )}

        {/* Customer Cart Link */}
        {userType !== 'courier' && (
          <Link href="/cart" className='flex items-center gap-2 rounded-full px-6 py-2 border text-black border-gray-200 hover:bg-primaryhov hover:text-white hover:border-primaryhov transition-all duration-200'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
            </svg>
            <span>Cart ({loadingCart ? '...' : cartProducts?.length || 0})</span>
          </Link>
        )}

        {/* Search Bar */}
        {isSearchPage && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={isSpecificRestaurantPage ? 'Search products...' : 'Search restaurants...'}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Courier Active Order Display */}
        {userType === 'courier' && courierActiveOrder && (
          <div className="flex items-center gap-2">
            <Link
              href={`/delivery?orderId=${courierActiveOrder.id}`}
              className='flex items-center gap-2 rounded-full px-6 py-2 border text-black border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200'
            >
              <TruckIcon className="h-5 w-5 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Order #{courierActiveOrder.id}</span>
                <span className={`text-xs ${getOrderStatusDisplay(courierActiveOrder)?.color}`}>
                  {getOrderStatusDisplay(courierActiveOrder)?.text}
                </span>
              </div>
            </Link>

            {/* Abandon Order Button */}
            <button
              onClick={handleAbandonOrder}
              disabled={loadingAbandonOrder}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 disabled:opacity-50"
              title="Abandon Order"
            >
              {loadingAbandonOrder ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              ) : (
                <XMarkIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {/* Customer Active Order Display */}
        {deliveringNow && userType !== 'courier' && (
          <Link href={`/delivery?orderId=${currentOrder.id}`} className='flex items-center gap-2 rounded-full px-6 py-2 border text-black border-gray-200 hover:bg-primaryhov hover:text-white hover:border-primaryhov transition-all duration-200'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
              <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75Z" />
              <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
            </svg>
            <span>Food Order in Progress</span>
          </Link>
        )}

        {/* Courier Status Indicator - FIXED */}
        {isCourierAvailable && (
          <div className="flex items-center gap-2 rounded-full px-6 py-2 border border-green-200 bg-green-50 text-green-700">
            <CheckCircleIcon className="h-5 w-5" />
            <span>Available for Orders</span>
          </div>
        )}
      </nav>

      {/* Authentication Buttons */}
      <nav className="flex items-center gap-4 font-semibold">
        {status === 'authenticated' ? (
          <button
            onClick={() => signOut()}
            className="bg-primary text-white rounded-full px-6 py-2 hover:bg-primaryhov transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primaryhov focus:ring-opacity-50"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-primary text-white rounded-full px-6 py-2 hover:bg-primaryhov transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primaryhov focus:ring-opacity-50"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white rounded-full px-6 py-2 hover:bg-primaryhov transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}