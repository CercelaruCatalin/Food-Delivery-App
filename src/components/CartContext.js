'use client';
import { useSession } from "next-auth/react";
import { createContext, useState, useEffect, useContext } from "react";

export const CartContext = createContext({});

export function CartContextProvider({children}) {
  const { data: session, status } = useSession();
  const [cartProducts, setCartProducts] = useState([]);
  const [cartRestaurants, setCartRestaurants] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const ls = typeof window !== 'undefined' ? window.localStorage : null;
  
  function saveCartProductsToLocalStorage(cartProducts, cartRestaurants) {
    if (ls) {
      ls.setItem('cart', JSON.stringify(cartProducts));
      ls.setItem('restaurants', JSON.stringify(cartRestaurants));
    }
  }
  
  // Function to fetch restaurant information by ID
  async function fetchRestaurantById(restaurantId) {
    try {
      const restaurantResponse = await fetch(`/api/restaurant?restaurantId=${encodeURIComponent(restaurantId)}`);
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json();
        if (restaurantData.restaurant) {
          console.log("Restaurant data cartcontext: ",restaurantData.restaurant);
          return restaurantData.restaurant;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching restaurant ${restaurantId}:`, error);
      return null;
    }
  }
  
  // Function to update restaurant list based on products
  async function updateRestaurantsList(products) {
    // Create a Set to track unique restaurant IDs
    const restaurantIds = new Set();
    
    // Collect all unique restaurant IDs from cart products
    for (const product of products) {
      if (product.restaurant_id && !restaurantIds.has(product.restaurant_id)) {
        restaurantIds.add(product.restaurant_id);
      }
    }
    
    // Fetch restaurant information for each unique restaurant ID
    const fetchedRestaurants = [];
    
    for (const restaurantId of restaurantIds) {
      // Check if we already have this restaurant in our state
      const existingRestaurant = cartRestaurants.find(r => r.id === restaurantId);
      
      if (existingRestaurant) {
        fetchedRestaurants.push(existingRestaurant);
      } else {
        const restaurant = await fetchRestaurantById(restaurantId);
        if (restaurant) {
          fetchedRestaurants.push(restaurant);
        }
      }
    }
    
    return fetchedRestaurants;
  }
  
  // Function to fetch cart from database for logged-in users
  async function fetchCartFromDatabase() {
    try {
      setLoadingCart(true);
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
     
      const data = await response.json();
      if (data.cartProducts && Array.isArray(data.cartProducts)) {
        setCartProducts(data.cartProducts);
        
        // Update restaurants based on fetched products
        const databaseRestaurants = await updateRestaurantsList(data.cartProducts);
        setCartRestaurants(databaseRestaurants);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoadingCart(false);
    }
  }
  
  // Function to sync entire cart to database for logged-in users
  async function syncCartToDatabase(products) {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products }),
      });
     
      if (!response.ok) throw new Error('Failed to sync cart');
     
      return await response.json();
    } catch (error) {
      console.error('Error syncing cart to database:', error);
    }
  }
  
  useEffect(() => {
    if (status === 'loading') return;
    const userType = session?.user?.userType;
   
    if (status === 'authenticated' && userType != 'courier') {
      fetchCartFromDatabase();
     
      // If there are items in localStorage, sync them to the database
      if (ls && ls.getItem('cart')) {
        const localCart = JSON.parse(ls.getItem('cart'));
       
        if (localCart.length > 0) {
          syncCartToDatabase(localCart)
            .then(() => {
              ls.removeItem('cart');
              ls.removeItem('restaurants');
              fetchCartFromDatabase();
            });
        }
      }
    } else {
      setLoadingCart(true);
      if (ls) {
        if (ls.getItem('cart')) {
          setCartProducts(JSON.parse(ls.getItem('cart')));
        }
        if (ls.getItem('restaurants')) {
          setCartRestaurants(JSON.parse(ls.getItem('restaurants')));
        }
      }
      setLoadingCart(false);
    }
  }, [status]);
  
  async function clearCart() {
    console.log("clearCart called, status:", status);
    
    if (status === 'authenticated') {
      try {
        console.log("Attempting to clear cart for authenticated user");
        
        const response = await fetch('/api/cart/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        console.log("Clear cart response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Clear cart error response:", errorData);
          throw new Error('Failed to clear cart');
        }
        
        const result = await response.json();
        console.log("Clear cart success:", result);
        
        // Update state immediately
        setCartProducts([]);
        setCartRestaurants([]);
        
        console.log("Cart state cleared in context");
        
      } catch (error) {
        console.error('Error clearing cart:', error);
        // Even if API fails, clear local state
        setCartProducts([]);
        setCartRestaurants([]);
      }
    } else {
      console.log("Clearing cart for non-authenticated user");
      setCartProducts([]);
      setCartRestaurants([]);
      saveCartProductsToLocalStorage([], []);
    }
  }
  
  // Remove product from cart
  async function removeCartProduct(indexToRemove) {
    if (status === 'authenticated') {
      try {
        const itemToRemove = cartProducts[indexToRemove];
        if (!itemToRemove || !itemToRemove.cart_item_id) {
          throw new Error('Invalid cart item');
        }
        
        const response = await fetch(`/api/cart/item?cartItemId=${itemToRemove.cart_item_id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to remove item from cart');
        
        const newCartProducts = cartProducts.filter((_, index) => index !== indexToRemove);
        setCartProducts(newCartProducts);
        
        // Update restaurants list based on remaining products
        const databaseRestaurants = await updateRestaurantsList(newCartProducts);
        setCartRestaurants(databaseRestaurants);
      } catch (error) {
        console.error('Error removing cart item:', error);
      }
    } else {
      const newCartProducts = cartProducts.filter((_, index) => index !== indexToRemove);
      setCartProducts(newCartProducts);
      
      // Update restaurants for local storage
      const updatedRestaurants = await updateRestaurantsList(newCartProducts);
      saveCartProductsToLocalStorage(newCartProducts, updatedRestaurants);
    }
  }
  
  // Update product quantity
  async function updateProductQuantity(indexToUpdate, quantity) {
    if (quantity < 1) {
      return removeCartProduct(indexToUpdate);
    }
    
    if (status === 'authenticated') {
      try {
        const itemToUpdate = cartProducts[indexToUpdate];
        if (!itemToUpdate || !itemToUpdate.cart_item_id) {
          throw new Error('Invalid cart item');
        }
        
        const response = await fetch(`/api/cart/item`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItemId: itemToUpdate.cart_item_id,
            quantity
          }),
        });
        
        if (!response.ok) throw new Error('Failed to update cart item');
        
        const newCartProducts = cartProducts.map((item, idx) => 
          idx === indexToUpdate ? {...item, quantity} : item
        );
        
        setCartProducts(newCartProducts);
        // No need to update restaurants as we're just changing quantity
      } catch (error) {
        console.error('Error updating cart item:', error);
      }
    } else {
      const newCartProducts = cartProducts.map((item, idx) => 
        idx === indexToUpdate ? {...item, quantity} : item
      );
      setCartProducts(newCartProducts);
      saveCartProductsToLocalStorage(newCartProducts, cartRestaurants);
    }
  }
  
  // Add product to cart
  async function addToCart(product, size = null, extras = []) {
    if (status === 'authenticated') {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product,
            size,
            extras
          }),
        });
        
        if (!response.ok) throw new Error('Failed to add item to cart');
        
        // Refresh cart to get updated data with cart_item_id
        await fetchCartFromDatabase();
      } catch (error) {
        console.error('Error adding item to cart:', error);
      }
    } else {
      const cartProduct = {...product, size, extras, quantity: 1};
      const newProducts = [...cartProducts, cartProduct];
      setCartProducts(newProducts);
      
      // Check if we need to add the restaurant
      if (product.restaurant_id) {
        // Check if the restaurant is already in our list
        const restaurantExists = cartRestaurants.some(r => r.id === product.restaurant_id);
        
        if (!restaurantExists) {
          // Fetch the restaurant info
          const restaurant = await fetchRestaurantById(product.restaurant_id);
          if (restaurant) {
            const updatedRestaurants = [...cartRestaurants, restaurant];
            setCartRestaurants(updatedRestaurants);
            saveCartProductsToLocalStorage(newProducts, updatedRestaurants);
            return;
          }
        }
      }
      
      // If no restaurant update needed, just save the products
      saveCartProductsToLocalStorage(newProducts, cartRestaurants);
    }
  }
  
  // Calculate total price of items in cart
  function calculateTotalPrice() {
    return cartProducts.reduce((total, product) => {
      let itemPrice = product.size ? parseFloat(product.size.price) : parseFloat(product.price_per_item);
      
      // Add extras prices
      if (product.extras && product.extras.length > 0) {
        product.extras.forEach(extra => {
          itemPrice += parseFloat(extra.price || 0);
        });
      }
      
      return total + (itemPrice * (product.quantity || 1));
    }, 0).toFixed(2);
  }
  
  return (
    <CartContext.Provider value={{
      cartProducts,
      cartRestaurants,
      updateRestaurantsList,
      fetchRestaurantById,
      setCartProducts,
      setCartRestaurants,
      addToCart,
      removeCartProduct,
      updateProductQuantity,
      clearCart,
      calculateTotalPrice,
      loadingCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Export a custom hook for using the cart context
export function useCart() {
  return useContext(CartContext);
}