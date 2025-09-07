'use client';
import { SessionProvider } from "next-auth/react";
import { OrderContextProvider } from "./OrdersContext";
import { CartContextProvider } from "./CartContext";

// Wrapper component that includes SessionProvider
export function AppProvider({children}) {
  return (
    <SessionProvider>
      <CartContextProvider>
        <OrderContextProvider>
          {children}
        </OrderContextProvider>
      </CartContextProvider>
    </SessionProvider>
  );
}