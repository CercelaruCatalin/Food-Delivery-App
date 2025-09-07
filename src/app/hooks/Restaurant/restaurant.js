import { useState } from "react";

export function useRestaurant(initialRestaurant = {}) {
  const [restaurant, setRestaurant] = useState({
    id: initialRestaurant?.id || null,
    name: initialRestaurant?.name || "",
    city: initialRestaurant?.city || "",
    street_address: initialRestaurant?.street_address || "",
    postal_code: initialRestaurant?.postal_code || "",
    opens: initialRestaurant?.opens || "08:00:00",
    closes: initialRestaurant?.closes || "22:00:00",
    image: initialRestaurant?.image || ""
  });

  const updateRestaurant = (updates) => {
    setRestaurant((prevState) => ({ ...prevState, ...updates }));
  };

  const setRestaurantId = (newId) => {
    if (Number.isInteger(newId)) {
      setRestaurant((prev) => ({ ...prev, id: newId }));
    } else {
      throw new Error("Invalid restaurant ID");
    }
  };

  const setRestaurantName = (newName) => {
    if (typeof newName === "string") {
      setRestaurant((prev) => ({ ...prev, name: newName }));
    } else {
      throw new Error("Invalid restaurant name");
    }
  };

  const setCity = (newCity) => {
    if (typeof newCity === "string") {
      setRestaurant((prev) => ({ ...prev, city: newCity }));
    } else {
      throw new Error("Invalid city");
    }
  };

  const setStreetAddress = (newAddress) => {
    if (typeof newAddress === "string") {
      setRestaurant((prev) => ({ ...prev, street_address: newAddress }));
    } else {
      throw new Error("Invalid street address");
    }
  };

  const setPostalCode = (newPostalCode) => {
    if (typeof newPostalCode === "string") {
      setRestaurant((prev) => ({ ...prev, postal_code: newPostalCode }));
    } else {
      throw new Error("Invalid postal code");
    }
  };

  const setOpens = (newOpens) => {
    setRestaurant((prev) => ({ ...prev, opens: newOpens }));
  };

  const setCloses = (newCloses) => {
    setRestaurant((prev) => ({ ...prev, closes: newCloses }));
  };

  const setImage = (newImage) => {
    if (typeof newImage === "string") {
      setRestaurant((prev) => ({ ...prev, image: newImage }));
    } else {
      throw new Error("Invalid restaurant image");
    }
  };

  return {
    restaurant,
    setRestaurantId,
    setRestaurantName,
    setCity,
    setStreetAddress,
    setPostalCode,
    setOpens,
    setCloses,
    setImage,
    updateRestaurant,
  };
}

export function useRestaurants(initialRestaurants = []) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);

  const addRestaurant = (restaurant) => {
    setRestaurants((prev) => [...prev, restaurant]);
  };

  const updateRestaurant = (restaurantId, updates) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId ? { ...r, ...updates } : r
      )
    );
  };

  const removeRestaurant = (restaurantId) => {
    setRestaurants((prev) =>
      prev.filter((r) => r.id !== restaurantId)
    );
  };

  return { restaurants, addRestaurant, updateRestaurant, removeRestaurant, setRestaurants };
}