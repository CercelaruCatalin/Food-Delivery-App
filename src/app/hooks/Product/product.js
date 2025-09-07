import { useState } from "react";

export function useProduct(initialProduct = {}) {
  const [product, setProduct] = useState({
    product_id: initialProduct?.product_id || null,
    restaurant_id: initialProduct?.restaurant_id || null,
    name: initialProduct?.name || "",
    category_name: initialProduct?.category_name || null,
    description: initialProduct?.description || "",
    price_per_item: initialProduct?.price_per_item || 0,
    image: initialProduct?.image || "",
    weight: initialProduct?.weight || ""
  });

  const setProductId = (id) => {
    if (Number.isInteger(id)) {
      setProduct((prev) => ({ ...prev, product_id: id }));
    } else {
      throw new Error("Product ID must be an integer.");
    }
  };

  const setRestaurantId = (resId) => {
    if (Number.isInteger(resId)) {
      setProduct((prev) => ({ ...prev, restaurant_id: resId }));
    } else {
      throw new Error("Restaurant ID must be an integer.");
    }
  };

  const setProductName = (productName) => {
    if (typeof productName === "string") {
      setProduct((prev) => ({ ...prev, name: productName }));
    } else {
      throw new Error("Product name must be a string.");
    }
  };

  const setCategoryName = (newName) => {
    if (typeof newName === "string") {
      setProduct((prev) => ({ ...prev, category_name: newName }));
    } else {
      throw new Error("Category name must be a string");
    }
  };

  const setWeight = (newWeight) => {
    if (typeof newWeight === "string") {
      setProduct((prev) => ({ ...prev, weight: newWeight }));
    } else {
      throw new Error("Weight must be a string");
    }
  };

  const setDescription = (description) => {
    if (typeof description === "string") {
      setProduct((prev) => ({ ...prev, description }));
    } else {
      throw new Error("Description must be a string.");
    }
  };

  const setPricePerItem = (price) => {
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      setProduct((prev) => ({ 
        ...prev, 
        price_per_item: parseFloat(numericPrice.toFixed(2)) 
      }));
    } else {
      throw new Error("Price must be a valid non-negative number");
    }
  };

  const setImage = (image) => {
    if (typeof image === "string") {
      setProduct((prev) => ({ ...prev, image }));
    } else {
      throw new Error("Image URL must be a string.");
    }
  };

  return {
    product,
    setProductId,
    setRestaurantId,
    setProductName,
    setCategoryName,
    setWeight,
    setDescription,
    setPricePerItem,
    setImage,
  };
}

export function useProducts(initialProducts = []) {
  const [products, setProducts] = useState(initialProducts);

  const addProduct = (product) => {
    if (!product.restaurant_id || !product.name || !product.price_per_item) {
      throw new Error("Missing required product fields");
    }
    setProducts((prev) => [...prev, product]);
  };

  const updateProduct = (productId, updates) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.product_id === productId) {
          const updatedProduct = { ...p, ...updates };
          if (typeof updatedProduct.price_per_item === 'string') {
            updatedProduct.price_per_item = parseFloat(
              updatedProduct.price_per_item
            ).toFixed(2);
          }
          return updatedProduct;
        }
        return p;
      })
    );
  };

  const removeProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.product_id !== productId));
  };

  return { products, addProduct, updateProduct, removeProduct, setProducts };
}
