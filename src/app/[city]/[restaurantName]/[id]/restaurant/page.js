"use client"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef, useContext, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "../../../../hooks/User/user";
import { useRestaurant } from "../../../../hooks/Restaurant/restaurant";
import { useProducts } from "../../../../hooks/Product/product";
import Loading from "../../../../../components/loading/loading";
import React from 'react';
import { CartContext } from "../../../../../components/CartContext";
import Header from "../../../../../components/header/header";

export default function RestaurantPage({ params }) {
  const resolvedParams = React.use(params);
  const { city, restaurantName, id } = resolvedParams;
  const restaurantId = id;
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, updateUser } = useUser();
  const { restaurant, updateRestaurant } = useRestaurant();
  const { products, setProducts } = useProducts();

  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [ restaurantIsOpen, setRestaurantIsOpen] = useState(false);
  
  // Refs for scrolling
  const categoryRefs = useRef({});

  // Search functionality
  const [filteredProducts, setFilteredProducts] = useState([]); // Store filtered products for the search
  const [searchQuery, setSearchQuery] = useState("");

  const handleProductSearch = useCallback((query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => 
      product.name?.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase()) ||
      product.category_name?.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  }, [products]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const restaurantResponse = await fetch(`/api/restaurant?restaurantId=${encodeURIComponent(restaurantId)}`);
        if (!restaurantResponse.ok) throw new Error("Failed to load restaurant!");
        
        const data = await restaurantResponse.json();
        if (data.restaurant) {
          updateRestaurant({
            name: data.restaurant.name,
            street_address: data.restaurant.street_address,
            city: data.restaurant.city,
            postal_code: data.restaurant.postal_code,
            image: data.restaurant.image,
            opens: data.restaurant.opens,
            closes: data.restaurant.closes 
          });

          const currentTime = new Date();
          const closesHour = parseInt(data.restaurant.closes.split(':')[0]);
          const closesMinutes = parseInt(data.restaurant.closes.split(':')[1]);

          if(currentTime.getHours() < closesHour){
            setRestaurantIsOpen(true);
          }
          else if(currentTime.getHours() == closesHour && currentTime.getMinutes < closesMinutes){
            setRestaurantIsOpen(true);
          }
          
          if (Array.isArray(data.products)) {

            setFilteredProducts(data.products);
            setProducts(data.products);
            
            // Set initial active category
            const categories = [...new Set(data.products.map(p => p.category_name || 'Other'))];
            if (categories.length > 0) {
              setActiveCategory(categories[0]);
            }
          } else {
            setFilteredProducts([]);
            setProducts([]);
          }         
          
          setDataLoaded(true);
        } else {
          throw new Error("Restaurant data not found");
        }
        
        if (status === "authenticated" && session) {
          const userResponse = await fetch("/api/user");
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const nameParts = userData.name ? userData.name.split(" ") : ["", ""];
            
            updateUser({
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
              phoneNumber: userData.phone_number || "",
              streetAddress: userData.street_address || "",
              postalCode: userData.postal_code || "",
              city: userData.city || "",
              dateOfBirth: userData.date_of_birth ? userData.date_of_birth.split("T")[0] : "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "An error occurred");
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    const userType = session?.user?.userType;
    if(userType === 'courier'){
      router.push('/courier/dashboard');
    }

    if (restaurantId) {
      fetchData();
    }
  }, [status, restaurantId]);

 // Update the scroll effect to only handle active category
    useEffect(() => {
      const handleScroll = () => {
        const scrollPosition = window.scrollY + 150; // offset for header + navbar
        
        for (const category in categoryRefs.current) {
          const element = categoryRefs.current[category];
          if (element && element.offsetTop <= scrollPosition && 
              element.offsetTop + element.offsetHeight > scrollPosition) {
            setActiveCategory(category);
            break;
          }
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Extract hours and minutes, ignoring seconds
    const [hours, minutes] = timeString.split(':');
    
    // Format in 24-hour time with leading zeros
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

const categories = useMemo(() => {
  const productsToUse = searchQuery ? filteredProducts : products;
  if (!productsToUse || productsToUse.length === 0) return ['All'];
  
  const uniqueCategories = [...new Set(productsToUse.map(product => product.category_name || 'Other'))];
  return uniqueCategories.length > 0 ? uniqueCategories : ['All'];
}, [searchQuery, filteredProducts, products]);

const groupedProducts = useMemo(() => {
  const productsToUse = searchQuery ? filteredProducts : products;
  const groupedProducts = {};
  
  categories.forEach(category => {
    groupedProducts[category] = productsToUse.filter(
      product => (product.category_name || 'Other') === category
    );
  });
  
  return groupedProducts;
}, [searchQuery, filteredProducts, products, categories]);


  // scrollToCategory
  const scrollToCategory = (category) => {
    setActiveCategory(category);
    if (categoryRefs.current[category]) {
      const element = categoryRefs.current[category];
      const offset = 120; // header + navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

// Cart and popup functionality
const {addToCart} = useContext(CartContext);
const [showPopup, setShowPopup] = useState(false);
const [selectedSize, setSelectedSize] = useState(null);
const [selectedExtras, setSelectedExtras] = useState([])

const [selectedProduct, setSelectedProduct] = useState(null);
const [isLoadingSizes, setIsLoadingSizes] = useState(false);
const [isLoadingExtras, setIsLoadingExtras] = useState(false);
const [sizes, setSizes] = useState([]);
const [extras, setExtras] = useState([]);

const fetchProductOptions = async (product) => {
  try {
    // Fetch sizes for the product
    setIsLoadingSizes(true);
    const sizesResponse = await fetch(`/api/sizes?productId=${product.id}`);
    if (!sizesResponse.ok) throw new Error("Failed to load sizes");
    const sizesData = await sizesResponse.json();
    setSizes(sizesData.sizes || []);
    
    // Set default selected size to the first size
    if (sizesData.sizes && sizesData.sizes.length > 0) {
      for(let size of sizesData.sizes){
        if(size.price == product.price_per_item){
          setSelectedSize(size)
        }
      }
    } else {
      setSelectedSize(null);
    }
    
    // Fetch extras for the product
    setIsLoadingExtras(true);
    const extrasResponse = await fetch(`/api/product-extras?productId=${product.id}`);
    if (!extrasResponse.ok) throw new Error("Failed to load extras");
    const extrasData = await extrasResponse.json();
    setExtras(extrasData.extras || []);
  } catch (error) {
    console.error("Error fetching product options:", error);
    toast.error("Failed to load product options");
  } finally {
    setIsLoadingSizes(false);
    setIsLoadingExtras(false);
  }
};

const calculateTotalPrice = () => {
  if (!selectedProduct) return 0;

  let totalPrice = selectedSize ? parseFloat(selectedSize.price) : parseFloat(selectedProduct.price_per_item);
  
  if (selectedExtras && selectedExtras.length > 0) {
    selectedExtras.forEach(extra => {

      totalPrice += parseFloat(extra.price || 0);
    });
  }
  
  return totalPrice.toFixed(2);
};

const handleAddToCartButtonClick = (product) => {
  // If the product has options and popup isn't shown yet, show popup
  if (product && !showPopup) {
    setSelectedProduct(product);
    setSelectedExtras([]);
    fetchProductOptions(product);
    setShowPopup(true);
    return;
  }
  
  // If popup is shown, add to cart with selected options
  if (showPopup && selectedProduct) {
    addToCart(selectedProduct, selectedSize, selectedExtras);
    setShowPopup(false);
    setSelectedProduct(null);
    setSelectedSize(null);
    setSelectedExtras([]);
    toast.success('Added to cart!');
  }
};

const handleExtraToggle = (ev, extra) => {
  const checked = ev.target.checked;
  
  if (checked) {
    setSelectedExtras(prev => [...prev, extra]);
  } else {
    setSelectedExtras(prev => prev.filter(e => e.extra_id !== extra.extra_id));
  }
};

const isExtraSelected = (extraId) => {
  return selectedExtras.some(extra => extra.extra_id === extraId);
};




// Loading circle
  if (status === "loading" || loading || !resolvedParams || !dataLoaded || !restaurant.name) {
    return (
      <div className="w-full h-screen flex items-center justify-center pt-16">
        <Loading baseSize={8} mdSize={12} lgSize={16} borderWidth={3} />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pb-8 mt-24">

      {/* header */}
      <Header searchProducts={handleProductSearch} />
      {/* navbar */}
      <div className="sticky top-16 z-20 bg-gradient-to-l from-primary to-secondary shadow-sm mx-auto">
        <div className="overflow-x-auto flex px-12 py-2 gap-3 whitespace-nowrap">
          {categories.map(category => (
            <button
              key={category}
              className={`px-2 py-2 rounded-full text-xs font-medium transition-colors text-black mt-2 ${
                activeCategory === category 
                  ? 'bg-white shadow-sm' 
                  : 'hover:bg-white/20'
              }`}
              onClick={() => scrollToCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
  {/* Restaurant banner section */}
  <section className="mx-16 my-6">
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg">
      {restaurant.image && (
        <Image 
          src={restaurant.image} 
          alt={restaurant.name} 
          fill
          sizes="150vw"
          priority
          style={{objectFit: "cover"}}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
      
      {/* Restaurant information overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/80 px-3 py-1 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                </svg>
                <span className="font-medium">4.8</span>
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(restaurant.opens)} - {formatTime(restaurant.closes)}
              </span>
            </div>
            
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm md:text-base">{restaurant.street_address}, <span className="capitalize">{restaurant.city}</span> {restaurant.postal_code}</p>
            </div>
          </div>
          
          {/* favorite button */}
          <div className="flex space-x-2 mt-3 md:mt-0">
            <Link href="/reviews">
              <button className="bg-white text-black px-4 py-2 rounded-full flex items-center text-sm font-medium hover:bg-yellow-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
        
        {/* Additional restaurant info badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="bg-white/10 text-xs px-3 py-1 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Delivery Fee: 5 Lei
          </span>
          <span className="bg-white/10 text-xs px-3 py-1 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            30-45 min
          </span>
          <span className="bg-white/10 text-xs px-3 py-1 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Online Payment
          </span>
        </div>
      </div>
    </div>
  </section>

      {/* Menu section */}
      <section className="mx-16 my-6">

        {/* Product popup */}
        <>
          {showPopup && selectedProduct && (
            <div 
              onClick={() => setShowPopup(false)} 
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
            >
              <div
                onClick={e => e.stopPropagation()}
                className="my-8 bg-white p-4 rounded-lg max-w-md w-full"
              >
                <div className="max-h-[calc(100vh-100px)] overflow-y-auto">
                  {/* Close button */}
                  <button 
                    onClick={() => setShowPopup(false)} 
                    className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {/* Product image */}
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <Image 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      style={{objectFit: "cover"}}
                    />
                  </div>
                  
                  {/* Product details */}
                  <h2 className="text-xl font-bold text-center mb-2">{selectedProduct.name}</h2>
                  <p className="text-center text-gray-500 text-sm mb-4">{selectedProduct.description}</p>
                  
                  {/* Size options */}
                  {isLoadingSizes ? (
                    <div className="p-2 text-center">Loading sizes...</div>
                  ) : sizes.length > 0 ? (
                    <div className="p-2 mb-4">
                      <h3 className="text-lg font-medium mb-2">Pick your size</h3>
                      <div className="space-y-2">
                        {sizes.map(size => (
                          <label 
                            key={size.size_id} 
                            className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
                              selectedSize?.size_id === size.size_id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name="size" 
                                checked={selectedSize?.size_id === size.size_id}
                                onChange={() => setSelectedSize(size)}
                                className="accent-primary"
                              />
                              <span>{size.size_name}</span>
                            </div>
                            <span className="font-medium">{size.price} Lei</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Extra options */}
                  {isLoadingExtras ? (
                    <div className="p-2 text-center">Loading extras...</div>
                  ) : extras.length > 0 ? (
                    <div className="p-2 mb-4">
                      <h3 className="text-lg font-medium mb-2">Extras</h3>
                      <div className="space-y-2">
                        {extras.map(extra => (
                          <label 
                            key={extra.extra_id} 
                            className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
                              isExtraSelected(extra.extra_id) ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                name={extra.extra_name}
                                checked={isExtraSelected(extra.extra_id)}
                                onChange={(ev) => handleExtraToggle(ev, extra)}
                                className="accent-primary"
                              />
                              <span>{extra.extra_name}</span>
                            </div>
                            <span className="font-medium">+{extra.price} Lei</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Add to cart button */}
                  <button
                    onClick={() => handleAddToCartButtonClick()}
                    className="w-full bg-primary hover:bg-primaryhov py-3 px-4 rounded-lg text-white font-medium mt-4 transition-colors"
                  >
                    Add to cart • {calculateTotalPrice()} Lei
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
        
        {categories.length > 0 ? (
          categories.map(category => (
            <div 
              key={category} 
              ref={el => categoryRefs.current[category] = el}
              className="mb-8"
            >
              <h3 className="text-2xl font-semibold mb-6 pt-4 border-t border-gray-200 text-primary capitalize">{category}</h3>
              
              {groupedProducts[category] && groupedProducts[category].length > 0 ? (
                <div className="space-y-4">
                  {groupedProducts[category].map((product, index) => (
                    <div 
                      key={product.product_id || `product-${index}`} 
                      className="flex flex-col sm:flex-row border rounded-lg p-3 hover:shadow-md transition-shadow hover:scale-105"
                    >
                      <div className="flex-grow pr-3">
                        <h3 className="font-medium text-lg">{product.name}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary text-2xl">{product.price_per_item} Lei</span>
                          
                          {restaurantIsOpen && (
                            <button
                              onClick={() => handleAddToCartButtonClick(product)}
                              className="bg-primary text-white py-1 px-2 rounded-full text-sm hover:bg-primaryhov transition-colors">
                              Add to cart
                            </button>

                          )}

                        </div>
                      </div>
                      {product.image && (
                        <div className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 relative rounded-lg overflow-hidden mt-3 sm:mt-0">
                          <Image
                            src={product.image}
                            alt={product.name || "Product"}
                            fill
                            sizes="(max-width: 640px) 128px, 160px"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+"
                            style={{objectFit: "cover"}}
                          />
                        </div>
                      )}        
                    </div>


                                      
                  ))}
                </div>
                

              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No items available in this category.</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items available.</p>
          </div>
        )}
      </section>
    </div>
  );
}